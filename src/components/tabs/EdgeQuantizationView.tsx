import React, { useState } from 'react';
import {
  Cpu,
  Calculator,
  Gauge,
  Server,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  TrendingDown,
  Info
} from 'lucide-react';
import { HARDWARE_PLATFORMS, HardwarePlatform } from '../../data/alprData';

interface EdgeQuantizationViewProps {
  activeDevice: 'jetson' | 'rk3588';
  setActiveDevice: (device: 'jetson' | 'rk3588') => void;
}

export const EdgeQuantizationView: React.FC<EdgeQuantizationViewProps> = ({
  activeDevice,
  setActiveDevice
}) => {
  // Quantization Math Parameters
  const [fp32Weight, setFp32Weight] = useState<number>(3.14159);
  const [scaleFactor, setScaleFactor] = useState<number>(0.025);
  const [zeroPoint, setZeroPoint] = useState<number>(0);

  // Physics Displacement Parameters
  const [vehicleSpeed, setVehicleSpeed] = useState<number>(100); // km/h
  const [triggerLatency, setTriggerLatency] = useState<number>(30); // ms

  // Quantization calculations
  const rawQ = Math.round(fp32Weight / scaleFactor) + zeroPoint;
  const clampedQ = Math.max(-128, Math.min(127, rawQ));
  const dequantizedR = (clampedQ - zeroPoint) * scaleFactor;
  const quantError = Math.abs(fp32Weight - dequantizedR);

  // Physics displacement calculations
  // v (m/s) = speed / 3.6
  const metersPerSec = vehicleSpeed / 3.6;
  const cmPerMs = (metersPerSec * 100) / 1000;
  const totalShiftCm = cmPerMs * triggerLatency;
  const totalShiftMeters = totalShiftCm / 100;
  const isOutOfFov = totalShiftMeters > 2.0;

  // Minima points for loss landscape graph
  const minimaPoints = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
  const ptqLoss = [18, 12, 6, 1, 0.2, 1, 7, 14, 22]; // Narrow minima (spikes easily)
  const qatLoss = [4.5, 2.0, 0.6, 0.15, 0.05, 0.15, 0.6, 2.0, 4.5]; // Wide minima (flat basin)

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                Section 4. 양자화 기술 및 엣지 배포 최적화
              </span>
              <span className="text-xs text-slate-400 font-mono-code">
                INT8 PTQ vs QAT · Physics Shift · RK3588 vs Jetson Orin
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              선형 양자화 수식 시뮬레이터 및 고속 주행 물리적 이탈 계산기
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              부동소수점 FP32 모델을 엣지 NPU용 INT8로 변환할 때의 오차 역전파 및 Wide Minima(QAT) 효과를 실증하고, 차량 이동 속도와 파이프라인 지연시간(Trigger Latency) 간의 물리적 촬영 위치 밀림 현상을 정밀 분석합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 pl-2">현재 선택:</span>
            <button
              onClick={() => setActiveDevice('jetson')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeDevice === 'jetson'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Jetson Orin NX
            </button>
            <button
              onClick={() => setActiveDevice('rk3588')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeDevice === 'rk3588'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Rockchip RK3588
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Math Formula Simulator & Loss Landscape Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quantization Formula Interactive Lab */}
        <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-5 shadow-sm">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-400" />
              선형 아핀 양자화 수식: <span className="font-mono-code text-sky-400">R = S × (Q - Z)</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono-code">INT8 Mapping</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono-code text-xs">
            <div className="text-slate-300 leading-relaxed text-[11px]">
              <span className="text-sky-400 font-bold block mb-1">Q = Clamp(round(R / S) + Z, -128, 127)</span>
              • R: 원본 FP32 가중치 실수값<br />
              • S: 스케일 팩터 (Scale Factor)<br />
              • Z: 제로 포인트 (대칭 양자화 시 0)
            </div>

            {/* Input Sliders */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
              <div>
                <label className="text-slate-400 block text-[11px] mb-1">입력 FP32 실수 (R):</label>
                <input
                  type="number"
                  step="0.05"
                  value={fp32Weight}
                  onChange={(e) => setFp32Weight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-amber-400 font-bold focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block text-[11px] mb-1">Scale Factor (S):</label>
                <input
                  type="number"
                  step="0.005"
                  value={scaleFactor}
                  onChange={(e) => setScaleFactor(parseFloat(e.target.value) || 0.001)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-emerald-400 font-bold focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Results Display */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">변환 INT8 (Q)</span>
                <span className="text-sky-300 font-bold text-sm">{clampedQ}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">역양자화 (R̂)</span>
                <span className="text-slate-200 font-bold text-sm">{dequantizedR.toFixed(4)}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">양자화 오차 손실</span>
                <span className="text-rose-400 font-bold text-sm">{quantError.toFixed(5)}</span>
              </div>
            </div>
          </div>

          {/* PTQ vs QAT Loss Landscape Visualizer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span>Narrow Minima (PTQ) vs Wide Minima (QAT) 손실 지형</span>
              <span className="text-[10px] text-slate-400 font-normal">오차 내성 곡선</span>
            </div>

            {/* Custom SVG Loss Landscape Curve */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 h-44 relative flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                {/* Grid Lines */}
                <line x1="0" y1="110" x2="400" y2="110" stroke="#1e293b" strokeWidth="1" />
                <line x1="200" y1="0" x2="200" y2="120" stroke="#1e293b" strokeDasharray="3,3" />

                {/* PTQ Curve (Narrow V-shape) */}
                <path
                  d="M 20 10 Q 150 20 180 90 T 200 110 T 220 90 Q 250 20 380 10"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                />

                {/* QAT Curve (Wide flat basin) */}
                <path
                  d="M 20 70 Q 120 75 160 100 T 200 110 T 240 100 Q 280 75 380 70"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                />

                {/* Optimal Point Marker */}
                <circle cx="200" cy="110" r="4" fill="#38bdf8" />
              </svg>

              {/* Legend overlay */}
              <div className="absolute top-3 left-4 flex items-center gap-4 text-[10px] font-mono-code">
                <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <span className="w-3 h-0.5 bg-rose-500 rounded" />
                  PTQ: 협소 지형 (오차 시 손실 급증)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-3 h-0.5 bg-emerald-500 rounded" />
                  QAT: 완만 분지 (노이즈 강건)
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              QAT(양자화 인식 훈련)는 가중치 손실 평면을 평탄화(Flat Minimum)하여, INT8 변환 시 가중치 반올림 오차가 발생해도 정확도 하락을 0.3% 이내로 방어합니다.
            </p>
          </div>
        </div>

        {/* Physics Displacement vs Trigger Latency Simulator */}
        <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-5 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-rose-400" />
                물리적 차량 속도 vs 시스템 지연시간(Trigger Latency) 밀림 실시간 계산기
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                고속 주행 차량은 AI 추론 지연 시간 동안 실제로 수 미터를 전진합니다. 카메라 최적 화각(FOV) 이탈 여부를 물리 법칙으로 검증합니다.
              </p>
            </div>

            {/* Interactive Sliders */}
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-200 mb-1.5">
                  <span>차량 주행 속도:</span>
                  <span className="font-mono-code font-bold text-sky-400 text-sm">{vehicleSpeed} km/h</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="180"
                  step="5"
                  value={vehicleSpeed}
                  onChange={(e) => setVehicleSpeed(parseInt(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono-code mt-0.5">
                  <span>20 km/h (도심 골목)</span>
                  <span>100 km/h (고속도로)</span>
                  <span>180 km/h (초과속)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-200 mb-1.5">
                  <span>전체 시스템 지연시간 (Latency):</span>
                  <span className="font-mono-code font-bold text-amber-400 text-sm">{triggerLatency} ms</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={triggerLatency}
                  onChange={(e) => setTriggerLatency(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono-code mt-0.5">
                  <span>5 ms (최적 엣지)</span>
                  <span>33.3 ms (30 FPS 한계)</span>
                  <span>200 ms (심각한 병목)</span>
                </div>
              </div>

              {/* Physical Calculation Output Box */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono-code text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">초당 실주행 속도:</span>
                  <span className="text-slate-200 font-bold">{metersPerSec.toFixed(2)} m/s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">1ms 동안 차량 이동량:</span>
                  <span className="text-emerald-400 font-bold">{cmPerMs.toFixed(2)} cm</span>
                </div>

                <div className="border-t border-slate-800 pt-2.5 flex justify-between items-center text-sm">
                  <span className="text-slate-200 font-bold">최종 촬영 위치 밀림 거리:</span>
                  <span className={`font-mono-code font-bold text-base ${isOutOfFov ? 'text-rose-400' : 'text-amber-400'}`}>
                    {totalShiftCm.toFixed(1)} cm ({totalShiftMeters.toFixed(2)} m)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Evaluation Callout */}
          <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
            isOutOfFov
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}>
            <div className="flex items-center gap-1.5 font-bold">
              {isOutOfFov ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>위험: 카메라 화각(FOV) 이탈 가능성 매우 높음</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>안전: 카메라 심도 및 피사계 초점 영역 내부 포착 가능</span>
                </>
              )}
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              {isOutOfFov
                ? `밀림 거리 ${totalShiftMeters.toFixed(2)}m는 일반적인 머신비전 렌즈 심도(DoF)를 초과하여 번호판 블러 및 미검출을 초래합니다. INT8 가속과 고속 글로벌 셔터 도입이 필수적입니다.`
                : `현재 30ms 지연에서는 차량이 83.3cm 이내로 밀려나 광각/망원 합성 화각 내에서 안정적인 판독이 유지됩니다.`}
            </p>
          </div>
        </div>
      </div>

      {/* Target Edge Hardware Platform Benchmark Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-sky-400" />
            타겟 엣지 AI 하드웨어 플랫폼 실증 최적화 벤치마크
          </h3>
          <span className="text-xs text-slate-500 font-mono-code">
            NVIDIA TensorRT vs Rockchip RKNN
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/70 text-slate-400 font-semibold border-b border-slate-800">
                <th className="p-3.5">하드웨어 플랫폼</th>
                <th className="p-3.5">NPU 연산 성능</th>
                <th className="p-3.5">런타임 엔진</th>
                <th className="p-3.5">양자화 포맷</th>
                <th className="p-3.5">YOLO 추론 FPS</th>
                <th className="p-3.5">문자 단위 정확도</th>
                <th className="p-3.5">소비 전력</th>
                <th className="p-3.5">가성비 및 필드 평가</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {HARDWARE_PLATFORMS.map((hw, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-slate-800/40 transition ${
                    (hw.vendor === 'NVIDIA' && activeDevice === 'jetson') ||
                    (hw.vendor === 'Rockchip' && activeDevice === 'rk3588')
                      ? 'bg-sky-500/5'
                      : ''
                  }`}
                >
                  <td className="p-3.5 font-bold text-white whitespace-nowrap">
                    {hw.name}
                  </td>
                  <td className="p-3.5 font-mono-code text-sky-400 font-semibold whitespace-nowrap">
                    {hw.npuPower}
                  </td>
                  <td className="p-3.5 font-mono-code text-slate-400 whitespace-nowrap">
                    {hw.runtimeEngine}
                  </td>
                  <td className="p-3.5 font-mono-code font-bold text-amber-400 whitespace-nowrap">
                    {hw.quantFormat}
                  </td>
                  <td className="p-3.5 font-mono-code font-bold text-emerald-400 whitespace-nowrap">
                    {hw.fpsYolo}
                  </td>
                  <td className="p-3.5 font-mono-code text-slate-200 whitespace-nowrap">
                    {hw.charAccuracy}
                  </td>
                  <td className="p-3.5 font-mono-code text-slate-400 whitespace-nowrap">
                    {hw.powerWatt}
                  </td>
                  <td className="p-3.5 text-slate-400 text-xs">
                    {hw.evaluation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
