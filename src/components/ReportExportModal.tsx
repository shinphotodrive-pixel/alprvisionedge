import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileCode,
  FileText,
  Terminal,
  ShieldCheck
} from 'lucide-react';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDevice: 'jetson' | 'rk3588';
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  activeDevice
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const deepStreamConfig = `[application]
enable-perf-measurement=1
perf-measurement-interval-sec=5

[source0]
enable=1
type=4
uri=rtsp://192.168.1.100:554/live/ch1
num-sources=4
gpu-id=0
nvbuf-memory-type=0

[streammux]
gpu-id=0
batch-size=4
batched-push-timeout=33000
width=1920
height=1080
enable-padding=0
nvbuf-memory-type=0

[primary-gie]
enable=1
gpu-id=0
model-engine-file=models/yolov10n_nmsfree_int8.engine
batch-size=4
interval=0
bbox-border-color0=0;1;0;1
nvbuf-memory-type=0

[secondary-gie0]
enable=1
gpu-id=0
model-engine-file=models/svtr_ocr_korean_fp16.engine
operate-on-gie-id=1
operate-on-class-ids=1
batch-size=8

[tracker]
enable=1
tracker-width=640
tracker-height=384
ll-lib-file=/opt/nvidia/deepstream/deepstream/lib/libnvds_nvmultiobjecttracker.so
ll-config-file=config_tracker_NvDCF_accuracy.yml
enable-batch-process=1`;

  const tensorRtCommands = `# 1. YOLOv10 NMS-Free INT8 TensorRT Engine Build
trtexec --onnx=yolov10n.onnx \\
        --saveEngine=yolov10n_nmsfree_int8.engine \\
        --int8 \\
        --calib=calibration.cache \\
        --fp16 \\
        --workspace=4096 \\
        --avgRuns=100

# 2. SVTR Korean OCR TensorRT Engine Build
trtexec --onnx=svtr_korean_patchvit.onnx \\
        --saveEngine=svtr_ocr_korean_fp16.engine \\
        --fp16 \\
        --minShapes=input:1x3x48x320 \\
        --optShapes=input:4x3x48x320 \\
        --maxShapes=input:8x3x48x320`;

  const rknnScript = `import numpy as np
from rknn.api import RKNN

# Initialize RKNN Toolkit for RK3588 (6 TOPS NPU)
rknn = RKNN(verbose=True)
rknn.config(mean_values=[[0, 0, 0]], std_values=[[255, 255, 255]], target_platform='rk3588')

# Load ONNX model
print('--> Loading YOLOv10/v12 model...')
rknn.load_onnx(model='yolov10n.onnx')

# Build model with QAT INT8 quantization
print('--> Building RKNN model with INT8 QAT calibration...')
rknn.build(do_quantization=True, dataset='dataset_calibration.txt')

# Export RKNN model
rknn.export_rknn('yolov10n_rk3588_int8.rknn')
print('--> Export done for 3-core NPU!')`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                엔지니어링 사양서 & 배포 스크립트 Export
              </h3>
              <p className="text-[11px] text-slate-400">
                타겟 디바이스: {activeDevice === 'jetson' ? 'NVIDIA Jetson Orin NX' : 'Rockchip RK3588'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Executive Summary Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-sky-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              SOTA ALPR 핵심 권장 아키텍처 요약
            </span>
            <ul className="text-slate-300 space-y-1 text-[11px] list-disc list-inside leading-relaxed">
              <li><strong>탐지 엔진:</strong> YOLOv10 (NMS-Free 이중 할당으로 차량 수에 따른 지터 배제) 또는 RT-DETR (야간 반사광 내성)</li>
              <li><strong>문자 복원 & OCR:</strong> STN(어파인 회전 정렬) + CLAHE(국소 명암비) + SVTR(한글 2D 패치 트랜스포머)</li>
              <li><strong>양자화 전략:</strong> Wide Minima 손실 평탄화를 적용한 QAT 기반 INT8 양자화로 정확도 손실 0.3% 이내 억제</li>
              <li><strong>관제 메모리:</strong> DeepStream Zero-Copy NVMM 파이프라인으로 30 FPS 실시간 22ms 통제</li>
            </ul>
          </div>

          {/* DeepStream App Config Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-indigo-400" />
                DeepStream 4채널 설정 파일 (deepstream_app_config.txt)
              </span>
              <button
                onClick={() => handleCopy(deepStreamConfig, 'ds')}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition"
              >
                {copiedKey === 'ds' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'ds' ? '복사됨' : '설정 복사'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono-code text-[11px] text-slate-300 overflow-x-auto max-h-40 leading-relaxed">
              {deepStreamConfig}
            </pre>
          </div>

          {/* TensorRT Command Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-amber-400" />
                TensorRT 엔진 빌드 CLI 명령어 (trtexec)
              </span>
              <button
                onClick={() => handleCopy(tensorRtCommands, 'trt')}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition"
              >
                {copiedKey === 'trt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'trt' ? '복사됨' : '명령어 복사'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono-code text-[11px] text-slate-300 overflow-x-auto max-h-36 leading-relaxed">
              {tensorRtCommands}
            </pre>
          </div>

          {/* RKNN Script */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                Rockchip RK3588 NPU 변환 Python 스크립트 (convert_rknn.py)
              </span>
              <button
                onClick={() => handleCopy(rknnScript, 'rknn')}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition"
              >
                {copiedKey === 'rknn' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'rknn' ? '복사됨' : '스크립트 복사'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono-code text-[11px] text-slate-300 overflow-x-auto max-h-36 leading-relaxed">
              {rknnScript}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            보고서 형식: SOTA v2.5 Technical Report
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
