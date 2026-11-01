import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Wand2,
  FileText,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCw,
  Sun,
  Camera,
  Cpu,
  BarChart2
} from 'lucide-react';
import { OCR_MODELS, OcrModel } from '../../data/alprData';

export const OcrPerformanceView: React.FC = () => {
  const [plateText, setPlateText] = useState<string>('370가 8294');
  const [plateType, setPlateType] = useState<'standard' | 'ev' | 'commercial'>('standard');
  const [enableSTN, setEnableSTN] = useState<boolean>(false);
  const [enableCLAHE, setEnableCLAHE] = useState<boolean>(false);
  const [enableESRGAN, setEnableESRGAN] = useState<boolean>(false);
  const [selectedEngine, setSelectedEngine] = useState<string>('svtr');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculate CER based on active filters and OCR engine
  const calculateCerAndPrediction = () => {
    let baseCer = 26.5; // Unrestored degraded CER
    if (enableSTN) baseCer -= 8.5;
    if (enableCLAHE) baseCer -= 6.5;
    if (enableESRGAN) baseCer -= 7.5;

    // Model specific deduction
    if (selectedEngine === 'parseq') baseCer -= 2.5;
    if (selectedEngine === 'svtr') baseCer -= 3.8;
    if (selectedEngine === 'lprnet') baseCer += 2.0;

    const cer = Math.max(0.2, baseCer);

    // Predict text representation based on CER
    let predicted = plateText;
    let confidence = 99.5;

    if (cer > 15.0) {
      // High error: substitute last char or blur Hangul
      const chars = plateText.split('');
      if (chars.length > 4) chars[chars.length - 1] = '?';
      if (chars.length > 3) chars[3] = '?';
      predicted = chars.join('');
      confidence = 62.4;
    } else if (cer > 6.0) {
      const chars = plateText.split('');
      if (chars.length > 5) chars[chars.length - 1] = chars[chars.length - 1] === '4' ? '1' : '?';
      predicted = chars.join('');
      confidence = 84.1;
    } else if (cer > 2.0) {
      predicted = plateText;
      confidence = 94.8;
    } else {
      predicted = `${plateText} (100% 일치)`;
      confidence = 99.2;
    }

    return { cer, predicted, confidence };
  };

  const { cer, predicted, confidence } = calculateCerAndPrediction();

  // Draw virtual license plate canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Background based on plate type
    if (plateType === 'ev') {
      ctx.fillStyle = '#bae6fd'; // Sky blue EV plate
    } else if (plateType === 'commercial') {
      ctx.fillStyle = '#fef08a'; // Yellow commercial plate
    } else {
      ctx.fillStyle = '#ffffff'; // Standard white plate
    }
    ctx.fillRect(0, 0, width, height);

    // Plate Outer Border
    ctx.strokeStyle = plateType === 'commercial' ? '#854d0e' : '#0f172a';
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, width - 8, height - 8);

    // Center Coordinate Translation
    ctx.translate(width / 2, height / 2);

    // If STN is disabled, simulate realistic camera perspective distortion (-14 degrees)
    if (!enableSTN) {
      ctx.rotate((-13 * Math.PI) / 180);
      ctx.transform(1, 0, 0.25, 1, 0, 0); // shear tilt
    }

    // Plate Korean text font styling
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const fontStyle = enableESRGAN ? 'bold 36px "Pretendard", sans-serif' : '30px "Pretendard", sans-serif';
    ctx.font = fontStyle;

    // Text color: CLAHE enhances black-to-white contrast
    if (enableCLAHE) {
      ctx.fillStyle = '#000000';
    } else {
      ctx.fillStyle = '#64748b'; // Low contrast washed out
    }

    ctx.fillText(plateText, 0, 0);

    // Headlight glare & blur noise if not restored
    if (!enableCLAHE && !enableESRGAN) {
      // Draw radial flare simulating oncoming headlight glare
      const flare = ctx.createRadialGradient(40, -10, 5, 40, -10, 110);
      flare.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      flare.addColorStop(0.6, 'rgba(255, 255, 255, 0.45)');
      flare.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = flare;
      ctx.fillRect(-width / 2, -height / 2, width, height);
    }

    ctx.restore();
  }, [plateText, plateType, enableSTN, enableCLAHE, enableESRGAN]);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                Section 3. 번호판 문자 인식 및 생성적 복원
              </span>
              <span className="text-xs text-slate-400 font-mono-code">
                STN · CLAHE · Real-ESRGAN · SVTR · PARSeq
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              대화형 번호판 영상 복원 및 OCR 인지 실험실
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              사각지대 카메라 각도로 왜곡된 번호판을 미분 가능한 STN으로 자동 수평 정렬하고, 야간 빛 번짐을 CLAHE 및 Real-ESRGAN 초해상도로 복원하여 OCR 모델별 문자 오류율(CER) 변화를 실시간으로 테스트합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 font-mono-code text-xs">
            <span className="text-slate-400">실시간 CER:</span>
            <span className={`font-bold px-2.5 py-1 rounded-lg ${
              cer < 3.0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
              cer < 10.0 ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
              'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {cer.toFixed(1)}% ({cer < 3.0 ? '최상' : cer < 10.0 ? '우수' : '오류 발생'})
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Plate Canvas & Restoration Controls */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Virtual Canvas Render Container */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center justify-between w-full text-xs">
              <span className="text-slate-400 font-mono-code flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-sky-400" />
                가상 캔버스 렌더러 (380x120 Surface)
              </span>
              <span className="text-[11px] text-slate-500">
                {enableSTN ? 'STN 수평 정렬됨' : '원근 13° 비틀림 적용'}
              </span>
            </div>

            {/* Canvas Box */}
            <div className="relative w-full max-w-md h-36 bg-slate-900 rounded-xl overflow-hidden border border-slate-700/80 flex items-center justify-center shadow-inner">
              <canvas
                ref={canvasRef}
                width={380}
                height={120}
                className="block rounded shadow-md max-w-full"
              />
            </div>

            {/* Recognition Prediction Box */}
            <div className="w-full bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">OCR 신경망 판독 결과:</span>
                <span className={`font-mono-code font-bold text-sm tracking-wider ${
                  cer < 3.0 ? 'text-emerald-400' :
                  cer < 10.0 ? 'text-sky-400' :
                  'text-amber-400'
                }`}>
                  {predicted}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px] font-mono-code">판독 확신도</span>
                <span className="font-mono-code font-bold text-slate-200">
                  {confidence.toFixed(1)}% Match
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Controls Panel */}
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                전처리 복원 모듈 & 필터 제어
              </h4>
              <span className="text-[11px] text-slate-400">다중 필터 조합 테스트</span>
            </div>

            {/* Plate Input & Style Options */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">번호판 텍스트 입력:</label>
                <input
                  type="text"
                  value={plateText}
                  onChange={(e) => setPlateText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 font-mono-code font-bold text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">번호판 규격 스타일:</label>
                <select
                  value={plateType}
                  onChange={(e) => setPlateType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="standard">일반 자가용 (흰색 바탕)</option>
                  <option value="ev">친환경 전기차 (하늘색)</option>
                  <option value="commercial">영업용 화물/택시 (노란색)</option>
                </select>
              </div>
            </div>

            {/* 3 Major Restoration Filters */}
            <div className="space-y-2.5 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              {/* STN Filter */}
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-slate-900 transition">
                <div>
                  <span className="font-bold text-slate-200 block">1. STN (Spatial Transformer Network)</span>
                  <span className="text-[11px] text-slate-400">위치 신경망 + TPS 그리드 생성기로 13° 원근 비틀림 수평 직교 정렬</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableSTN}
                  onChange={(e) => setEnableSTN(e.target.checked)}
                  className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                />
              </label>

              {/* CLAHE Filter */}
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-slate-900 transition border-t border-slate-800/80">
                <div>
                  <span className="font-bold text-slate-200 block">2. CLAHE (적응형 국소 히스토그램 평활화)</span>
                  <span className="text-[11px] text-slate-400">야간 직사 조명 및 짙은 그림자 속에서 문자 획의 경계선 대비 증폭</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableCLAHE}
                  onChange={(e) => setEnableCLAHE(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>

              {/* Real-ESRGAN Filter */}
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-slate-900 transition border-t border-slate-800/80">
                <div>
                  <span className="font-bold text-slate-200 block">3. Real-ESRGAN (생성적 초해상도)</span>
                  <span className="text-[11px] text-slate-400">고속 이동 블러 프레임의 고주파 텍스트 윤곽선 생성 복원</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableESRGAN}
                  onChange={(e) => setEnableESRGAN(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                />
              </label>
            </div>

            {/* OCR Engine Selector */}
            <div>
              <label className="font-bold text-slate-300 block mb-1">OCR 인식 엔진 선택:</label>
              <select
                value={selectedEngine}
                onChange={(e) => setSelectedEngine(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-medium text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="svtr">SVTR / PP-OCRv4 (Patch-wise Vision Transformer - 한글 최적)</option>
                <option value="parseq">PARSeq (Permuted Autoregressive - 난반사/플레어 최저 CER)</option>
                <option value="crnn">CRNN (ResNet + BiLSTM + CTC - 표준 아키텍처)</option>
                <option value="lprnet">LPRNet (Fully Convolutional CNN - 초경량 엣지 추론)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* OCR Accuracy Across Conditions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparative Accuracy Multi-Bar Card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              OCR 모델별 극한 환경 인식 정밀도 (%)
            </h3>
            <span className="text-xs text-slate-500 font-mono-code">벤치마크 데이터셋</span>
          </div>

          <div className="space-y-4">
            {OCR_MODELS.map((model) => {
              const isCurrent = selectedEngine === model.id;
              return (
                <div
                  key={model.id}
                  onClick={() => setSelectedEngine(model.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-950 border-sky-500 ring-1 ring-sky-500/40'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{model.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono-code">({model.type})</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono-code">
                      <span className="text-sky-400 font-bold">CER: {model.avgCer}%</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-amber-400 font-bold">{model.latencyMs}ms</span>
                    </div>
                  </div>

                  {/* Multi-Condition Progress Bars */}
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono-code">
                    <div>
                      <span className="text-slate-400 block mb-0.5">정상 조명</span>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${model.normalAcc}%` }} />
                      </div>
                      <span className="text-slate-300 font-semibold mt-0.5 block">{model.normalAcc}%</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">야간/빛번짐</span>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${model.nightAcc}%` }} />
                      </div>
                      <span className="text-slate-300 font-semibold mt-0.5 block">{model.nightAcc}%</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">극심한 블러/가림</span>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${model.blurAcc}%` }} />
                      </div>
                      <span className="text-slate-300 font-semibold mt-0.5 block">{model.blurAcc}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Korean Character 2D Structure & Architectural Insight */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                한글 2차원 결합 구조와 SVTR 패치 트랜스포머의 우위성
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                서양 알파벳과 달리 한글은 초성·중성·종성이 2차원 평면으로 결합되므로 1차원 순차 RNN(CRNN)보다 2D 공간 어텐션이 결정적인 차이를 만듭니다.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-200 font-bold">
                  <span>SVTR (Single Visual Model)</span>
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-mono-code">
                    한글 최적 SOTA
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  이미지를 작은 패치(Patch) 단위로 분할하여 지역(Local)과 전역(Global) 어텐션을 동시 적용합니다. '가'와 '나', '오'와 '우' 같이 미세한 획 차이로 의미가 바뀌는 한글 음절을 98.9% 정밀도로 완벽 판별합니다.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-200 font-bold">
                  <span>PARSeq (Permuted Autoregressive)</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono-code">
                    최저 CER (2.1%)
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  좌우 양방향 및 무작위 순열 컨텍스트를 학습하여 특정 글자가 번짐이나 가림으로 인해 훼손되더라도 번호판 문법 체계(숫자-문자-숫자)를 활용해 원본 텍스트를 복원합니다.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-200 font-bold">
                  <span>LPRNet (Fully Convolutional)</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono-code">
                    초고속 1.8ms
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  1x13 비대칭 커널로 수평 문자 흐름을 포착하며 RNN 계층이 없어 CPU에서도 초당 100회 이상 실행 가능합니다. 주차장 차단기 등 비용 민감 현장에 최적입니다.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>현장 권장 구성:</strong> STN(1차 정렬) + CLAHE(명암비) + SVTR(추론) 파이프라인 적용 시 종합 인식 성공률 99.4% 방어
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
