import React from 'react';
import {
  Video,
  VectorSquare,
  Wand2,
  FileText,
  Route,
  Play,
  RotateCcw,
  Cpu,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { PIPELINE_STEPS, PipelineStepDetail } from '../../data/alprData';

interface PipelineViewProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  onRunSimulation: () => void;
  onResetSimulation: () => void;
  isSimulating: boolean;
  activeDevice: 'jetson' | 'rk3588';
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  currentStep,
  onSelectStep,
  onRunSimulation,
  onResetSimulation,
  isSimulating,
  activeDevice
}) => {
  const activeDetail = PIPELINE_STEPS.find((s) => s.step === currentStep) || PIPELINE_STEPS[0];

  // Adjust latency based on selected hardware
  const multiplier = activeDevice === 'jetson' ? 1.0 : 1.7;
  const totalLatency = PIPELINE_STEPS.reduce((acc, cur) => acc + cur.latencyMs * multiplier, 0);

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1:
        return <Video className="w-5 h-5 text-sky-400" />;
      case 2:
        return <VectorSquare className="w-5 h-5 text-indigo-400" />;
      case 3:
        return <Wand2 className="w-5 h-5 text-amber-400" />;
      case 4:
        return <FileText className="w-5 h-5 text-emerald-400" />;
      case 5:
        return <Route className="w-5 h-5 text-rose-400" />;
      default:
        return <Cpu className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Intro Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold">
                차세대 SOTA 지능형 관제 아키텍처
              </span>
              <span className="text-xs text-slate-400 font-mono-code">
                Zero-Copy VRAM Memory Flow
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              종단 간(End-to-End) ALPR 처리 파이프라인 시뮬레이터
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-3xl leading-relaxed">
              RTSP 프레임 인입부터 하드웨어 NVMM 디코딩, YOLOv10/RT-DETR 차량 및 번호판 1차 탐지, STN 공간 왜곡 보정, SVTR 문자 인식 및 차량 재식별(Re-ID) 메타데이터 발행까지 전 단계 텐서 흐름을 단계별로 검증합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={onRunSimulation}
              disabled={isSimulating}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-lg ${
                isSimulating
                  ? 'bg-sky-600/60 text-sky-200 cursor-not-allowed'
                  : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/30 hover:scale-[1.02]'
              }`}
            >
              <Play className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? '시뮬레이션 실행 중...' : '전체 파이프라인 자동 Run'}</span>
            </button>
            <button
              onClick={onResetSimulation}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Summary Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase font-mono-code">선택 하드웨어</span>
            <span className="font-bold text-slate-200 mt-0.5 block truncate">
              {activeDevice === 'jetson' ? 'NVIDIA Jetson Orin NX' : 'Rockchip RK3588'}
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase font-mono-code">총합 지연시간 (Latency)</span>
            <span className={`font-mono-code font-bold text-base mt-0.5 block ${totalLatency < 33.3 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {totalLatency.toFixed(1)} ms
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase font-mono-code">실시간 30 FPS 한계치</span>
            <span className="font-mono-code font-bold text-slate-200 mt-0.5 block">
              33.3 ms / Frame
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase font-mono-code">여유 마진 (Headroom)</span>
            <span className="font-mono-code font-bold text-sky-400 mt-0.5 block">
              +{(33.3 - totalLatency).toFixed(1)} ms {(totalLatency < 33.3 ? '(실시간 충족)' : '(프레임 드랍 위험)')}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive 5-Step Pipeline Flow Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-semibold text-slate-300">단계별 파이프라인 노드 (클릭하여 상세 검사)</span>
          <span className="font-mono-code text-[11px]">Step {currentStep} of 5 선택됨</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {PIPELINE_STEPS.map((step) => {
            const isSelected = currentStep === step.step;
            const stepLatency = (step.latencyMs * multiplier).toFixed(1);

            return (
              <div
                key={step.step}
                onClick={() => onSelectStep(step.step)}
                className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 relative group border text-left flex flex-col justify-between space-y-4
                  ${isSelected
                    ? 'bg-slate-800/90 border-sky-500 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                  }
                `}
              >
                {/* Step Top Badge & Icon */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono-code font-extrabold px-2 py-0.5 rounded-full border ${
                    isSelected
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    STEP 0{step.step}
                  </span>
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-sky-500/20' : 'bg-slate-800'}`}>
                    {getStepIcon(step.step)}
                  </div>
                </div>

                {/* Step Titles */}
                <div>
                  <h3 className={`text-xs font-bold leading-snug ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {step.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono-code">
                    {step.subTitle}
                  </p>
                </div>

                {/* Latency Tag */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono-code">
                  <span className="text-slate-500">Latency:</span>
                  <span className={`font-bold ${isSelected ? 'text-sky-400' : 'text-slate-300'}`}>
                    {stepLatency} ms
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Step Deep Dive Inspector Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
              {getStepIcon(activeDetail.step)}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Step {activeDetail.step}. {activeDetail.name}
              </h3>
              <p className="text-xs text-sky-400 font-mono-code">
                {activeDetail.subTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono-code">
              실행 환경: {activeDetail.environment}
            </span>
          </div>
        </div>

        {/* 3-Column Detailed Technical Specification */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>입력 / 출력 텐서 규격</span>
            </div>
            <p className="font-mono-code text-slate-200 text-[11px] leading-relaxed bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              {activeDetail.inputOutput}
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>핵심 알고리즘 및 신경망 모듈</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              {activeDetail.coreTech}
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>기술적 병목 및 최적화 핵심</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              {activeDetail.bottlenecks}
            </p>
          </div>
        </div>
      </div>

      {/* 3 Pillars of SOTA ALPR Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white">33.3ms 임계치 통제</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            30 FPS 실시간 스트림 환경에서는 단 1프레임 지연도 누적 지연(Latency Jitter)을 유발합니다. NMS-free 모델과 Zero-Copy 메모리 체계를 통해 파이프라인 총합 지연을 22.0ms 이내로 안정화합니다.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white">악천후 및 야간 강건성</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            헤드라이트 빛 번짐, 짙은 빗길 반사, 30° 이상 비틀어진 번호판 각도에서도 미분 가능한 STN 어파인 정렬과 CLAHE 평활화를 직렬 연계하여 OCR 인지율 98.5%를 견인합니다.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
            <Route className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white">다중 관제 차량 Re-ID 융합</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            번호판이 화물차나 흙먼지에 가려지는 오클루전(Occlusion) 상황에서도, 차량 시각 외형 특징(128~512d Feature Vector)을 결합하여 카메라 간 차량 ID를 영속 추적합니다.
          </p>
        </div>
      </div>
    </div>
  );
};
