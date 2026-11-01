import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceDot,
  Dot
} from 'recharts';
import { TrendingUp, Sparkles, Award, Zap, History, Milestone, Target } from 'lucide-react';

export interface YoloGenerationData {
  generation: string;
  versionName: string;
  releaseDate: string;
  nanoMap: number;
  smallMap: number;
  flagshipMap: number;
  rtdetrBenchmark?: number;
  keyInnovation: string;
  milestoneTag?: string;
  latencyTrendMs: number; // A100 latency for nano
  orinLatency: number; // Jetson Orin NX nano latency (ms)
  edgeFps: number; // Jetson Orin FPS
}

export const YOLO_EVOLUTION_DATA: YoloGenerationData[] = [
  {
    generation: 'v8',
    versionName: 'YOLOv8',
    releaseDate: '2023.01',
    nanoMap: 37.3,
    smallMap: 44.9,
    flagshipMap: 53.9,
    rtdetrBenchmark: 46.5,
    keyInnovation: 'Anchor-Free 분리형 헤드, C2f 피처 융합',
    milestoneTag: '현장 표준화',
    latencyTrendMs: 0.99,
    orinLatency: 4.8,
    edgeFps: 208
  },
  {
    generation: 'v9',
    versionName: 'YOLOv9',
    releaseDate: '2024.02',
    nanoMap: 38.6,
    smallMap: 46.2,
    flagshipMap: 55.6,
    rtdetrBenchmark: 48.5,
    keyInnovation: 'PGI(프로그래밍 가능 그래디언트 정보) & GELAN',
    milestoneTag: '정보 병목 해결',
    latencyTrendMs: 1.65,
    orinLatency: 13.8,
    edgeFps: 72
  },
  {
    generation: 'v10',
    versionName: 'YOLOv10',
    releaseDate: '2024.05',
    nanoMap: 39.5,
    smallMap: 46.7,
    flagshipMap: 53.2,
    rtdetrBenchmark: 50.1,
    keyInnovation: 'Consistent Dual Assignments 기반 NMS 후처리 완전 제거',
    milestoneTag: 'NMS-Free 혁신',
    latencyTrendMs: 1.84,
    orinLatency: 5.2,
    edgeFps: 192
  },
  {
    generation: 'v11',
    versionName: 'YOLOv11',
    releaseDate: '2024.09',
    nanoMap: 39.0,
    smallMap: 47.0,
    flagshipMap: 54.7,
    rtdetrBenchmark: 51.5,
    keyInnovation: 'C3k2 개선 모듈 및 SPPELAN 공간 피라미드 어텐션',
    milestoneTag: '특징 융합 강화',
    latencyTrendMs: 1.50,
    orinLatency: 4.9,
    edgeFps: 204
  },
  {
    generation: 'v12',
    versionName: 'YOLOv12',
    releaseDate: '2025/26',
    nanoMap: 41.2,
    smallMap: 48.6,
    flagshipMap: 56.4,
    rtdetrBenchmark: 53.1,
    keyInnovation: '컨볼루션-트랜스포머 하이브리드 어텐션 (Area-attention)',
    milestoneTag: '하이브리드 ViT SOTA',
    latencyTrendMs: 1.20,
    orinLatency: 4.6,
    edgeFps: 217
  }
];

interface YoloEvolutionLineChartProps {
  focusMode?: 'accuracy' | 'speed';
  onFocusModeChange?: (mode: 'accuracy' | 'speed') => void;
}

export const YoloEvolutionLineChart: React.FC<YoloEvolutionLineChartProps> = ({
  focusMode,
  onFocusModeChange
}) => {
  const [internalFocus, setInternalFocus] = useState<'accuracy' | 'speed'>(focusMode || 'accuracy');
  const currentFocus = focusMode || internalFocus;

  React.useEffect(() => {
    if (focusMode) {
      setInternalFocus(focusMode);
    }
  }, [focusMode]);

  const handleFocusChange = (mode: 'accuracy' | 'speed') => {
    setInternalFocus(mode);
    if (onFocusModeChange) {
      onFocusModeChange(mode);
    }
  };

  const [activeSeries, setActiveSeries] = useState<'all' | 'nano' | 'small' | 'flagship'>('all');
  const [showRtdetrBaseline, setShowRtdetrBaseline] = useState<boolean>(true);
  const [metricUnit, setMetricUnit] = useState<'absolute' | 'gain'>('absolute');

  // Calculate gains relative to YOLOv8
  const baseV8 = YOLO_EVOLUTION_DATA[0];

  const processedData = YOLO_EVOLUTION_DATA.map((item) => {
    if (metricUnit === 'gain') {
      return {
        ...item,
        nanoMap: parseFloat((item.nanoMap - baseV8.nanoMap).toFixed(1)),
        smallMap: parseFloat((item.smallMap - baseV8.smallMap).toFixed(1)),
        flagshipMap: parseFloat((item.flagshipMap - baseV8.flagshipMap).toFixed(1)),
        rtdetrBenchmark: item.rtdetrBenchmark ? parseFloat((item.rtdetrBenchmark - (baseV8.rtdetrBenchmark || 46.5)).toFixed(1)) : 0
      };
    }
    return item;
  });

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const nanoDelta = (data.nanoMap - (metricUnit === 'gain' ? 0 : baseV8.nanoMap)).toFixed(1);
      const smallDelta = (data.smallMap - (metricUnit === 'gain' ? 0 : baseV8.smallMap)).toFixed(1);

      return (
        <div className="bg-slate-950/95 border border-slate-800 p-4 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono-code space-y-2 min-w-[260px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white font-sans text-sm">{data.versionName}</span>
              <span className="text-[10px] text-slate-500">({data.releaseDate})</span>
            </div>
            {data.milestoneTag && (
              <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold">
                {data.milestoneTag}
              </span>
            )}
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                Nano급 mAP:
              </span>
              <span className="font-bold text-white">
                {data.nanoMap}{metricUnit === 'absolute' ? '%' : '%p'}
                {metricUnit === 'absolute' && data.versionName !== 'YOLOv8' && (
                  <span className="text-[10px] text-emerald-400 ml-1">(+{nanoDelta}%)</span>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Small급 mAP:
              </span>
              <span className="font-bold text-white">
                {data.smallMap}{metricUnit === 'absolute' ? '%' : '%p'}
                {metricUnit === 'absolute' && data.versionName !== 'YOLOv8' && (
                  <span className="text-[10px] text-emerald-400 ml-1">(+{smallDelta}%)</span>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                플래그십(M/X) mAP:
              </span>
              <span className="font-bold text-white">
                {data.flagshipMap}{metricUnit === 'absolute' ? '%' : '%p'}
              </span>
            </div>

            {showRtdetrBaseline && (
              <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  RT-DETR 비교선:
                </span>
                <span className="font-bold text-purple-300">
                  {data.rtdetrBenchmark}{metricUnit === 'absolute' ? '%' : '%p'}
                </span>
              </div>
            )}
          </div>

          <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 font-sans leading-relaxed">
            <span className="text-slate-300 font-semibold block">핵심 기술 혁신:</span>
            {data.keyInnovation}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold font-mono-code uppercase flex items-center gap-1">
              <History className="w-3 h-3" />
              YOLO Generational Accuracy Evolution
            </span>
            <span className="text-xs text-slate-500 font-mono-code">
              2023 ~ 2026 SOTA 트렌드
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            YOLO 반복 세대별 mAP 정확도 진화 추세 라인 차트 (Recharts)
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            YOLOv8에서 YOLOv12까지 버전이 업그레이드됨에 따라 mAP가 어떻게 계단식으로 비약 발전했는지, 그리고 NMS-Free 및 트랜스포머 하이브리드 도입에 따른 성능 도약을 시각화합니다.
          </p>
        </div>

        {/* View Mode Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto text-xs">
          {/* Focus Mode Switcher: Accuracy Focused vs Speed Focused */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => handleFocusChange('accuracy')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                currentFocus === 'accuracy' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>정밀도 (mAP)</span>
            </button>
            <button
              onClick={() => handleFocusChange('speed')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                currentFocus === 'speed' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>속도 (지연/FPS)</span>
            </button>
          </div>

          {currentFocus === 'accuracy' ? (
            <>
              {/* Unit Toggle: Absolute vs Gain */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setMetricUnit('absolute')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    metricUnit === 'absolute' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  절대 mAP (%)
                </button>
                <button
                  onClick={() => setMetricUnit('gain')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    metricUnit === 'gain' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  v8 대비 (+Δ%p)
                </button>
              </div>

              {/* Scale Filter */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveSeries('all')}
                  className={`px-2 py-1 rounded-lg text-[11px] transition ${
                    activeSeries === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setActiveSeries('nano')}
                  className={`px-2 py-1 rounded-lg text-[11px] transition ${
                    activeSeries === 'nano' ? 'bg-slate-800 text-sky-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Nano
                </button>
                <button
                  onClick={() => setActiveSeries('small')}
                  className={`px-2 py-1 rounded-lg text-[11px] transition ${
                    activeSeries === 'small' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Small
                </button>
                <button
                  onClick={() => setActiveSeries('flagship')}
                  className={`px-2 py-1 rounded-lg text-[11px] transition ${
                    activeSeries === 'flagship' ? 'bg-slate-800 text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  플래그십
                </button>
              </div>

              {/* RT-DETR Toggle */}
              <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 cursor-pointer text-[11px] hover:text-white">
                <input
                  type="checkbox"
                  checked={showRtdetrBaseline}
                  onChange={(e) => setShowRtdetrBaseline(e.target.checked)}
                  className="w-3.5 h-3.5 accent-purple-500 rounded"
                />
                <span>RT-DETR 대조</span>
              </label>
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono-code text-slate-400">
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-300">
                ⚡ 실시간 30 FPS 임계치(33.3ms) 기준
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Recharts Line Chart Container */}
      <div className="w-full h-80 sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          {currentFocus === 'accuracy' ? (
            <LineChart
              data={processedData}
              margin={{ top: 25, right: 35, left: 5, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="versionName"
                stroke="#64748b"
                fontSize={12}
                fontFamily="JetBrains Mono, monospace"
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                dy={10}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                fontFamily="JetBrains Mono, monospace"
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                domain={metricUnit === 'absolute' ? [34, 58] : [0, 6]}
                unit={metricUnit === 'absolute' ? '%' : '%p'}
                label={{
                  value: metricUnit === 'absolute' ? 'COCO mAP 50-95 (%)' : 'YOLOv8 대비 개선 폭 (%p)',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#94a3b8',
                  fontSize: 10,
                  offset: 10
                }}
              />

              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: 15 }}
                formatter={(value) => {
                  if (value === 'nanoMap') return <span className="text-xs text-sky-400 font-mono-code font-bold">Nano Scale (경량 엣지)</span>;
                  if (value === 'smallMap') return <span className="text-xs text-emerald-400 font-mono-code font-bold">Small Scale (주력 표준)</span>;
                  if (value === 'flagshipMap') return <span className="text-xs text-indigo-400 font-mono-code font-bold">Flagship Scale (M/X 고정밀)</span>;
                  if (value === 'rtdetrBenchmark') return <span className="text-xs text-purple-400 font-mono-code font-bold">RT-DETR Transformer 대조선</span>;
                  return value;
                }}
              />

              {/* Milestone Reference Line for YOLOv10 (NMS-Free milestone) */}
              <ReferenceLine
                x="YOLOv10"
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: '★ NMS-Free 이중 할당 도입',
                  position: 'top',
                  fill: '#10b981',
                  fontSize: 10,
                  fontFamily: 'Pretendard, sans-serif'
                }}
              />

              {/* Milestone Reference Line for YOLOv12 (Hybrid ViT milestone) */}
              <ReferenceLine
                x="YOLOv12"
                stroke="#818cf8"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: '★ Area-Attention 하이브리드 ViT',
                  position: 'top',
                  fill: '#818cf8',
                  fontSize: 10,
                  fontFamily: 'Pretendard, sans-serif'
                }}
              />

              {/* Line 1: Nano Scale Evolution */}
              {(activeSeries === 'all' || activeSeries === 'nano') && (
                <Line
                  type="monotone"
                  dataKey="nanoMap"
                  name="nanoMap"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#0284c7', stroke: '#38bdf8', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}

              {/* Line 2: Small Scale Evolution */}
              {(activeSeries === 'all' || activeSeries === 'small') && (
                <Line
                  type="monotone"
                  dataKey="smallMap"
                  name="smallMap"
                  stroke="#34d399"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#059669', stroke: '#34d399', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#34d399', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}

              {/* Line 3: Flagship Scale Evolution */}
              {(activeSeries === 'all' || activeSeries === 'flagship') && (
                <Line
                  type="monotone"
                  dataKey="flagshipMap"
                  name="flagshipMap"
                  stroke="#818cf8"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#4f46e5', stroke: '#818cf8', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#818cf8', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}

              {/* Line 4: RT-DETR Reference Line */}
              {showRtdetrBaseline && (
                <Line
                  type="monotone"
                  dataKey="rtdetrBenchmark"
                  name="rtdetrBenchmark"
                  stroke="#c084fc"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: '#9333ea', stroke: '#c084fc', strokeWidth: 1.5 }}
                  activeDot={{ r: 6, fill: '#c084fc', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}
            </LineChart>
          ) : (
            <LineChart
              data={processedData}
              margin={{ top: 25, right: 35, left: 5, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="versionName"
                stroke="#64748b"
                fontSize={12}
                fontFamily="JetBrains Mono, monospace"
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                dy={10}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                fontFamily="JetBrains Mono, monospace"
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                domain={[0, 16]}
                unit="ms"
                label={{
                  value: '지연시간 (ms)',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#f59e0b',
                  fontSize: 10,
                  offset: 10
                }}
              />

              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: 15 }}
                formatter={(value) => {
                  if (value === 'orinLatency') return <span className="text-xs text-amber-400 font-mono-code font-bold">Jetson Orin NX Nano 지연 (ms)</span>;
                  if (value === 'latencyTrendMs') return <span className="text-xs text-sky-400 font-mono-code font-bold">NVIDIA A100 Nano 지연 (ms)</span>;
                  return value;
                }}
              />

              {/* 30 FPS boundary Reference Line at 33.3ms (or 10ms for 100 FPS) */}
              <ReferenceLine
                y={10}
                stroke="#38bdf8"
                strokeDasharray="3 3"
                strokeWidth={1}
                label={{
                  value: '100 FPS 초고속 기준 (10ms)',
                  position: 'right',
                  fill: '#38bdf8',
                  fontSize: 9
                }}
              />

              {/* Milestone for v10 NMS-Free */}
              <ReferenceLine
                x="YOLOv10"
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: '★ NMS 제거로 지터 제로',
                  position: 'top',
                  fill: '#10b981',
                  fontSize: 10
                }}
              />

              {/* Line: Orin Latency */}
              <Line
                type="monotone"
                dataKey="orinLatency"
                name="orinLatency"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 5, fill: '#d97706', stroke: '#f59e0b', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2 }}
              />

              {/* Line: A100 Latency */}
              <Line
                type="monotone"
                dataKey="latencyTrendMs"
                name="latencyTrendMs"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ r: 4, fill: '#0284c7', stroke: '#38bdf8', strokeWidth: 1.5 }}
                activeDot={{ r: 6, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chronological Breakthrough Timeline Footnotes */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 pt-2 border-t border-slate-800 text-xs">
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white font-mono-code">YOLOv8</span>
            <span className="text-[10px] text-slate-500 font-mono-code">2023.01</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            C2f 모듈과 Anchor-Free 구조로 기준 성능 확립. Nano 37.3% mAP 기록.
          </p>
        </div>

        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white font-mono-code">YOLOv9</span>
            <span className="text-[10px] text-slate-500 font-mono-code">2024.02</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            PGI(프로그래밍 가능 그래디언트 정보)로 심층 정보 유실 해결. 플래그십 55.6% 달성.
          </p>
        </div>

        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-400 font-mono-code">YOLOv10</span>
            <span className="text-[10px] text-slate-500 font-mono-code">2024.05</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            이중 할당 매칭으로 <strong>NMS 오버헤드 0ms</strong> 달성. Nano 39.5% (+2.2%p).
          </p>
        </div>

        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white font-mono-code">YOLOv11</span>
            <span className="text-[10px] text-slate-500 font-mono-code">2024.09</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            C3k2 개선 및 SPPELAN 공간 어텐션 통합. Small 47.0% 달성.
          </p>
        </div>

        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sky-400 font-mono-code">YOLOv12</span>
            <span className="text-[10px] text-sky-400 font-mono-code">2025/26</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Area-attention 하이브리드 ViT 통합으로 <strong>Nano 41.2% (+3.9%p)</strong> SOTA 경신.
          </p>
        </div>
      </div>
    </div>
  );
};
