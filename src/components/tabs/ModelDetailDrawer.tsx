import React, { useEffect } from 'react';
import {
  X,
  Cpu,
  Zap,
  Award,
  Layers,
  Gauge,
  CheckCircle2,
  Clock,
  HardDrive,
  Target,
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { DetectionModel } from '../../data/alprData';

interface ModelDetailDrawerProps {
  model: DetectionModel | null;
  onClose: () => void;
  activeDevice: 'jetson' | 'rk3588';
}

export const ModelDetailDrawer: React.FC<ModelDetailDrawerProps> = ({
  model,
  onClose,
  activeDevice
}) => {
  const [copied, setCopied] = React.useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (model) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [model]);

  if (!model) return null;

  const currentLatency = activeDevice === 'jetson' ? model.latencyOrin : model.latencyRK3588;
  const currentFps = Math.round(1000 / currentLatency);
  const isLatencyWarning = currentLatency > 30;
  const isMapWarning = model.map50_95 < 40.0 || model.map50_95 < 0.70;

  const getFamilyBadge = (family: string) => {
    switch (family) {
      case 'YOLOv8':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'YOLOv9':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'YOLOv10':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'YOLOv11':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'YOLOv12':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'RT-DETR':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  // Get architecture deep-dive technical notes based on family
  const getArchitectureNotes = (model: DetectionModel) => {
    switch (model.family) {
      case 'YOLOv8':
        return {
          backbone: 'Modified CSPDarknet53 with C2f (Cross-Stage Partial with 2 convolutions)',
          neck: 'PAN-FPN (Path Aggregation Network with Feature Pyramid)',
          head: 'Anchor-Free Decoupled Head (Separated Classification & Regression)',
          keyInnovation: 'Anchor-Free 디자인 채택으로 BBox 후보군 튜닝 제거 및 C2f 경량화'
        };
      case 'YOLOv9':
        return {
          backbone: 'GELAN (Generalized Efficient Layer Aggregation Network)',
          neck: 'PGI (Programmable Gradient Information) 보조 가역 분기',
          head: 'Decoupled Dual-Task Detection Head',
          keyInnovation: '정보 병목(Information Bottleneck) 극복을 위한 가역 아키텍처 및 PGI 손실 보정'
        };
      case 'YOLOv10':
        return {
          backbone: 'Efficiency-Driven Compact Inverted Block (CIB) & SCDown',
          neck: 'Large-Kernel Convolutions & Partial Self-Attention (PSA)',
          head: 'Dual Label Assignment (One-to-Many 학습 + One-to-One 추론)',
          keyInnovation: 'Non-Maximum Suppression (NMS) 전면 배제로 엣지 런타임 레이턴시 지터(Jitter) 0% 달성'
        };
      case 'YOLOv11':
        return {
          backbone: 'C3k2 (Cross Stage Partial with Kernel scaling) + SPPF',
          neck: 'Enhanced Feature Pyramid with C3k2 Blocks',
          head: 'Depthwise Separable Decoupled Detection Head',
          keyInnovation: 'FLOPs 대폭 감축 및 TensorRT FP16/INT8 양자화 시 정확도 하락 최소화 최적화'
        };
      case 'YOLOv12':
        return {
          backbone: 'Area Attention Hybrid ViT + FlashConv Feed-Forward Network',
          neck: 'Multi-scale Attention Cross-FPN with Residual Scaling',
          head: 'Fully Decoupled Zero-Latency Task Aligned Head',
          keyInnovation: '선형 시간 복잡도 Area Attention으로 글로벌 수용장 확보 및 실시간 100+ FPS 동시 달성'
        };
      case 'RT-DETR':
        return {
          backbone: 'ResNet / HGNetv2 (High Performance GPU-optimized Network)',
          neck: 'AIFI (Attention-based Intra-scale Feature Interaction) + CCFM',
          head: 'Deformable Transformer Decoder with IoU-aware Query Selection',
          keyInnovation: '완전한 End-to-End 디텍터로 NMS 불필요, 야간 헤드라이트 빛 번짐 및 왜곡에 가장 강인'
        };
      default:
        return {
          backbone: 'Standard CNN Backbone',
          neck: 'FPN / PAN Feature Aggregator',
          head: 'Decoupled Anchor-free Head',
          keyInnovation: '실시간 영상 추론 최적화'
        };
    }
  };

  const archNotes = getArchitectureNotes(model);

  const copyModelDetails = () => {
    const text = `[ALPR Model Specification]
Model: ${model.name} (${model.family})
Parameters: ${model.params}M
FLOPs: ${model.flops} GFLOPs
COCO mAP (50-95): ${model.map50_95}%
Latency (${activeDevice === 'jetson' ? 'Jetson Orin NX' : 'RK3588'}): ${currentLatency.toFixed(2)} ms (${currentFps} FPS)
A100 Latency: ${model.latencyA100.toFixed(2)} ms
NMS Required: ${model.nmsRequired ? 'Yes' : 'No (NMS-Free)'}
Architecture: ${model.architecture}
Recommended Field Use: ${model.recommendedUse}
Strengths: ${model.strengths.join(', ')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative w-full max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col z-10 overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 backdrop-blur flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold border ${getFamilyBadge(model.family)}`}>
                {model.family}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                model.nmsRequired
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                {model.nmsRequired ? 'NMS 필요' : 'NMS-Free (실시간 최적)'}
              </span>
              {isLatencyWarning && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> 지연 &gt;30ms
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              {model.name}
            </h3>
            <p className="text-xs text-slate-400">
              차량 번호판 감지(LP Detection) 및 엣지 AI 가속기 사양 명세
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyModelDetails}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95 border border-slate-700"
              title="사양 텍스트 복사"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition active:scale-95 border border-slate-700"
              title="닫기 (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-300 text-xs">
          {/* Key Metrics Quick Gauge Grid */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-sky-400" />
              핵심 벤치마크 지표 요약
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* mAP */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 block">COCO mAP 50-95</span>
                <span className={`text-lg font-bold font-mono-code ${isMapWarning ? 'text-amber-400' : 'text-sky-400'}`}>
                  {model.map50_95}%
                </span>
                <span className="text-[10px] text-slate-500 block">정밀도 지수</span>
              </div>

              {/* Latency */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 block">
                  {activeDevice === 'jetson' ? 'Jetson Orin' : 'RK3588'} 지연
                </span>
                <span className={`text-lg font-bold font-mono-code ${isLatencyWarning ? 'text-amber-400' : 'text-amber-300'}`}>
                  {currentLatency.toFixed(1)} <span className="text-xs font-normal text-slate-400">ms</span>
                </span>
                <span className="text-[10px] text-slate-500 block font-mono-code">
                  ~{currentFps} FPS
                </span>
              </div>

              {/* Params */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 block">파라미터 수</span>
                <span className="text-lg font-bold font-mono-code text-indigo-400">
                  {model.params} <span className="text-xs font-normal text-slate-400">M</span>
                </span>
                <span className="text-[10px] text-slate-500 block">가중치 볼륨</span>
              </div>

              {/* FLOPs */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 block">연산량 (FLOPs)</span>
                <span className="text-lg font-bold font-mono-code text-purple-400">
                  {model.flops} <span className="text-xs font-normal text-slate-400">G</span>
                </span>
                <span className="text-[10px] text-slate-500 block">GFLOPs</span>
              </div>
            </div>
          </div>

          {/* Device Latency Comparison Bar */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                타깃 하드웨어별 추론 지연시간 비교
              </span>
              <span className="text-[10px] text-slate-500 font-mono-code font-normal">
                기준: FP16 엔진 추론
              </span>
            </h4>

            <div className="space-y-2.5">
              {/* Jetson Orin NX */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    NVIDIA Jetson Orin NX (20W):
                  </span>
                  <span className="font-bold text-emerald-400 font-mono-code">
                    {model.latencyOrin.toFixed(2)} ms ({Math.round(1000 / model.latencyOrin)} FPS)
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (model.latencyOrin / 50) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Rockchip RK3588 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    Rockchip RK3588 (6 TOPS NPU):
                  </span>
                  <span className="font-bold text-sky-400 font-mono-code">
                    {model.latencyRK3588.toFixed(2)} ms ({Math.round(1000 / model.latencyRK3588)} FPS)
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-sky-400 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (model.latencyRK3588 / 50) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Server A100 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    NVIDIA A100 Tensor Core (클라우드/서버):
                  </span>
                  <span className="font-bold text-purple-400 font-mono-code">
                    {model.latencyA100.toFixed(2)} ms ({Math.round(1000 / model.latencyA100)} FPS)
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-400 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (model.latencyA100 / 50) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Architecture Breakdown Section */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              아키텍처 구조 상세 분해 (Architecture Breakdown)
            </h4>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">요약 구조</div>
                <p className="text-xs text-slate-200 leading-relaxed font-mono-code bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                  {model.architecture}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-start gap-2">
                  <span className="w-16 shrink-0 text-[10px] text-slate-500 font-mono-code">백본(Backbone):</span>
                  <span className="text-slate-300 font-medium">{archNotes.backbone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-16 shrink-0 text-[10px] text-slate-500 font-mono-code">넥(Neck):</span>
                  <span className="text-slate-300 font-medium">{archNotes.neck}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-16 shrink-0 text-[10px] text-slate-500 font-mono-code">헤드(Head):</span>
                  <span className="text-slate-300 font-medium">{archNotes.head}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-xs text-sky-200">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  핵심 아키텍처 혁신점
                </div>
                <p className="text-[11px] text-sky-200/90 leading-relaxed">
                  {archNotes.keyInnovation}
                </p>
              </div>
            </div>
          </div>

          {/* Primary Use Case & Field Deployment */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              권장 적용 분야 및 현장 시나리오
            </h4>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-200 text-xs mb-1">최적 운영 필드</h5>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {model.recommendedUse}
                  </p>
                </div>
              </div>

              {/* Strengths bullet points */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">핵심 강점 및 적합 환경</div>
                <div className="grid grid-cols-1 gap-1.5">
                  {model.strengths.map((str, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-300 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Edge Deployment Pipeline Guide */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 space-y-2 text-slate-400 text-[11px]">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              엣지 파이프라인 배포 팁
            </div>
            <p className="leading-relaxed">
              본 모델을 Jetson Orin 환경에 배포 시 <code className="bg-slate-900 text-sky-300 px-1.5 py-0.5 rounded font-mono-code">trtexec --fp16</code> 혹은 <code className="bg-slate-900 text-sky-300 px-1.5 py-0.5 rounded font-mono-code">TensorRT INT8 PTQ</code> 캘리브레이션을 수행하여 추가 1.8배~2.3배의 가속을 달성할 수 있으며, DeepStream 파이프라인의 <code className="bg-slate-900 text-sky-300 px-1.5 py-0.5 rounded font-mono-code">nvinferserver / nvinfer</code> 플러그인에 직접 바인딩할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 backdrop-blur flex items-center justify-between gap-3">
          <button
            onClick={copyModelDetails}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">사양 복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>모델 사양 복사하기</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition active:scale-95"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
