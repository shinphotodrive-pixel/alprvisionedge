import React, { useState, useMemo } from 'react';
import {
  Check,
  Zap,
  Award,
  Layers,
  ArrowUpDown,
  Download,
  Copy,
  Sparkles,
  SlidersHorizontal,
  TrendingUp,
  Cpu,
  Clock,
  Gauge,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BarChart3,
  AlertTriangle,
  Target,
  Info
} from 'lucide-react';
import { DETECTION_MODELS, DetectionModel } from '../../data/alprData';
import { ModelComparisonBarChart } from '../charts/ModelComparisonBarChart';
import { YoloEvolutionLineChart } from '../charts/YoloEvolutionLineChart';

interface SideBySideComparisonTableProps {
  activeDevice: 'jetson' | 'rk3588';
  focusMode?: 'accuracy' | 'speed';
  onFocusModeChange?: (mode: 'accuracy' | 'speed') => void;
  onSelectModel?: (model: DetectionModel) => void;
}

type ModelFamily = 'YOLOv8' | 'YOLOv9' | 'YOLOv10' | 'YOLOv11' | 'YOLOv12' | 'RT-DETR';

const ALL_FAMILIES: ModelFamily[] = [
  'YOLOv8',
  'YOLOv9',
  'YOLOv10',
  'YOLOv11',
  'YOLOv12',
  'RT-DETR'
];

export const SideBySideComparisonTable: React.FC<SideBySideComparisonTableProps> = ({
  activeDevice,
  focusMode,
  onFocusModeChange,
  onSelectModel
}) => {
  // Family selection state
  const [selectedFamilies, setSelectedFamilies] = useState<Record<ModelFamily, boolean>>({
    'YOLOv8': true,
    'YOLOv9': true,
    'YOLOv10': true,
    'YOLOv11': true,
    'YOLOv12': true,
    'RT-DETR': true
  });

  // Scale selection
  const [scaleFilter, setScaleFilter] = useState<'all' | 'nano' | 'small_compact' | 'medium_large'>('all');

  // Baseline model for direct delta comparison
  const [baselineModelId, setBaselineModelId] = useState<string>('yolov8n');

  // Metric toggles
  const [showMap, setShowMap] = useState<boolean>(true);
  const [showLatency, setShowLatency] = useState<boolean>(true);
  const [showFps, setShowFps] = useState<boolean>(true);
  const [showParams, setShowParams] = useState<boolean>(true);
  const [showFlops, setShowFlops] = useState<boolean>(true);
  const [showNms, setShowNms] = useState<boolean>(true);

  // Table view style: 'columns' (Side-by-side family cards) or 'rows' (Sortable matrix table)
  const [viewStyle, setViewStyle] = useState<'columns' | 'matrix'>('columns');
  const [showChart, setShowChart] = useState<boolean>(true);
  const [showLineChart, setShowLineChart] = useState<boolean>(false);

  // Sort state for matrix table
  const [sortBy, setSortBy] = useState<'map' | 'latency' | 'fps' | 'params'>('map');
  const [sortDesc, setSortDesc] = useState<boolean>(true);

  // Copy notification
  const [copied, setCopied] = useState<boolean>(false);

  // Family toggle handler
  const toggleFamily = (fam: ModelFamily) => {
    setSelectedFamilies((prev) => ({
      ...prev,
      [fam]: !prev[fam]
    }));
  };

  const selectAllFamilies = () => {
    setSelectedFamilies({
      'YOLOv8': true,
      'YOLOv9': true,
      'YOLOv10': true,
      'YOLOv11': true,
      'YOLOv12': true,
      'RT-DETR': true
    });
  };

  const clearFamilies = () => {
    setSelectedFamilies({
      'YOLOv8': false,
      'YOLOv9': false,
      'YOLOv10': false,
      'YOLOv11': false,
      'YOLOv12': false,
      'RT-DETR': false
    });
  };

  // Preset selectors
  const applyPreset = (preset: 'nano' | 'standard' | 'flagship') => {
    selectAllFamilies();
    if (preset === 'nano') setScaleFilter('nano');
    if (preset === 'standard') setScaleFilter('small_compact');
    if (preset === 'flagship') setScaleFilter('medium_large');
  };

  // Helper for latency & FPS based on active device
  const getLatency = (model: DetectionModel) => {
    return activeDevice === 'jetson' ? model.latencyOrin : model.latencyRK3588;
  };

  const getFps = (model: DetectionModel) => {
    const lat = getLatency(model);
    return Math.round(1000 / lat);
  };

  // Filter models
  const displayedModels = useMemo(() => {
    return DETECTION_MODELS.filter((m) => {
      if (!selectedFamilies[m.family as ModelFamily]) return false;

      if (scaleFilter === 'nano') {
        return m.id.endsWith('n') || m.id === 'rtdetr_r18';
      }
      if (scaleFilter === 'small_compact') {
        return m.id.endsWith('s') || m.id === 'yolov9c';
      }
      if (scaleFilter === 'medium_large') {
        return m.id.endsWith('m') || m.id.endsWith('x') || m.id === 'yolov9e' || m.id === 'rtdetr_r50';
      }
      return true;
    });
  }, [selectedFamilies, scaleFilter]);

  // Find baseline model
  const baselineModel = DETECTION_MODELS.find((m) => m.id === baselineModelId) || DETECTION_MODELS[0];
  const baselineLatency = getLatency(baselineModel);
  const baselineFps = getFps(baselineModel);

  // Best performer metrics
  const maxMap = Math.max(...displayedModels.map((m) => m.map50_95), 0);
  const minLatency = Math.min(...displayedModels.map((m) => getLatency(m)), 999);
  const maxFps = Math.max(...displayedModels.map((m) => getFps(m)), 0);

  // Sorted models for matrix
  const sortedModels = useMemo(() => {
    return [...displayedModels].sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortBy === 'map') {
        valA = a.map50_95;
        valB = b.map50_95;
      } else if (sortBy === 'latency') {
        valA = getLatency(a);
        valB = getLatency(b);
      } else if (sortBy === 'fps') {
        valA = getFps(a);
        valB = getFps(b);
      } else if (sortBy === 'params') {
        valA = a.params;
        valB = b.params;
      }
      return sortDesc ? valB - valA : valA - valB;
    });
  }, [displayedModels, sortBy, sortDesc, activeDevice]);

  // Representative model per family for side-by-side family column view
  const representativeModels = useMemo(() => {
    const list: { family: ModelFamily; model: DetectionModel }[] = [];
    ALL_FAMILIES.forEach((fam) => {
      if (!selectedFamilies[fam]) return;
      // find matching model based on scale filter
      let candidate: DetectionModel | undefined;
      const familyModels = displayedModels.filter((m) => m.family === fam);
      if (familyModels.length > 0) {
        candidate = familyModels[0];
      } else {
        // fallback to any model in family
        candidate = DETECTION_MODELS.find((m) => m.family === fam);
      }
      if (candidate) {
        list.push({ family: fam, model: candidate });
      }
    });
    return list;
  }, [selectedFamilies, displayedModels]);

  // Sync matrix table sort with focusMode
  React.useEffect(() => {
    if (focusMode === 'speed') {
      setSortBy('latency');
      setSortDesc(false);
    } else if (focusMode === 'accuracy') {
      setSortBy('map');
      setSortDesc(true);
    }
  }, [focusMode]);

  // Export CSV
  const exportCsv = () => {
    const headers = [
      'Model',
      'Family',
      'Params(M)',
      'FLOPs(G)',
      'mAP(%)',
      `Latency (${activeDevice === 'jetson' ? 'Jetson Orin' : 'RK3588'} ms)`,
      'FPS',
      'NMS Required',
      'Warning Status',
      'Architecture',
      'Field'
    ];
    const rows = displayedModels.map((m) => {
      const lat = getLatency(m);
      const fps = getFps(m);
      const isHighLat = lat > 30;
      const isLowMap = m.map50_95 < 40.0 || m.map50_95 < 0.70;
      let warning = 'Normal';
      if (isHighLat && isLowMap) warning = 'Latency > 30ms & Low mAP (<0.70)';
      else if (isHighLat) warning = 'Latency > 30ms';
      else if (isLowMap) warning = 'mAP < 0.70 (<40%)';

      return [
        `"${m.name}"`,
        `"${m.family}"`,
        m.params,
        m.flops,
        m.map50_95,
        lat.toFixed(2),
        fps,
        `"${m.nmsRequired ? 'Yes' : 'No'}"`,
        `"${warning}"`,
        `"${m.architecture.replace(/"/g, '""')}"`,
        `"${m.recommendedUse.replace(/"/g, '""')}"`
      ].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `alpr_side_by_side_comparison_${activeDevice}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyComparisonSummary = () => {
    const summary = displayedModels.map((m) => {
      const lat = getLatency(m);
      const fps = getFps(m);
      return `[${m.name}] mAP: ${m.map50_95}% | Latency: ${lat.toFixed(1)}ms | FPS: ${fps} | NMS: ${m.nmsRequired ? '필요' : 'NMS-Free'}`;
    }).join('\n');

    navigator.clipboard.writeText(`ALPR 객체/번호판 탐지 모델 성능 비교 (${activeDevice === 'jetson' ? 'Jetson Orin NX' : 'RK3588'})\n\n${summary}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Badge colors per family
  const getFamilyBadge = (fam: string) => {
    switch (fam) {
      case 'YOLOv8':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'YOLOv9':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      case 'YOLOv10':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'YOLOv11':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'YOLOv12':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'RT-DETR':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-sm">
      {/* Title & Preset Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold font-mono-code uppercase">
              Side-by-Side Comparison Matrix
            </span>
            <span className="text-xs text-slate-500 font-mono-code">
              6대 모델 아키텍처 실시간 교차 검증
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-sky-400" />
            YOLOv8 · YOLOv9 · YOLOv10 · YOLOv11 · YOLOv12 · RT-DETR 다차원 성능 비교표
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            필터 토글을 통해 각 모델 계열의 정밀도(mAP), 추론 지연시간(Latency), 초당 프레임수(FPS)를 동일 스케일에서 나란히 비교합니다.
          </p>
        </div>

        {/* View Style Switcher & Export */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewStyle('columns')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                viewStyle === 'columns'
                  ? 'bg-sky-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              컬럼 나란히 뷰
            </button>
            <button
              onClick={() => setViewStyle('matrix')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                viewStyle === 'matrix'
                  ? 'bg-sky-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              정렬 정밀 매트릭스
            </button>
          </div>

          {/* Toggle Recharts Bar Chart */}
          <button
            onClick={() => setShowChart(!showChart)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition border ${
              showChart
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-200 font-semibold'
                : 'bg-slate-850 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
            <span>{showChart ? '바 차트 숨김' : 'Recharts 바 차트'}</span>
          </button>

          {/* Toggle Recharts Line Chart */}
          <button
            onClick={() => setShowLineChart(!showLineChart)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition border ${
              showLineChart
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-semibold'
                : 'bg-slate-850 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>{showLineChart ? '라인 차트 숨김' : 'mAP 진화 라인 차트'}</span>
          </button>

          {/* Quick Actions */}
          <button
            onClick={copyComparisonSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition border border-slate-700"
            title="비교 요약 클립보드 복사"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '복사됨' : '복사'}</span>
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition border border-slate-700"
            title="CSV 다운로드"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>CSV 저장</span>
          </button>
        </div>
      </div>

      {/* Interactive Family Toggles Bar */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            비교 대상 아키텍처 토글 (클릭하여 선택/해제):
          </span>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={selectAllFamilies}
              className="text-sky-400 hover:text-sky-300 font-medium hover:underline text-[11px]"
            >
              전체 선택
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={clearFamilies}
              className="text-slate-400 hover:text-slate-300 font-medium hover:underline text-[11px]"
            >
              선택 해제
            </button>
          </div>
        </div>

        {/* 6 Family Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {ALL_FAMILIES.map((fam) => {
            const isChecked = selectedFamilies[fam];
            return (
              <button
                key={fam}
                onClick={() => toggleFamily(fam)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition border ${
                  isChecked
                    ? 'bg-sky-500/15 border-sky-500/50 text-white shadow-sm ring-1 ring-sky-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>{fam}</span>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  isChecked ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-500'
                }`}>
                  {isChecked ? <Check className="w-3 h-3 stroke-[3]" /> : ''}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Scale Presets and Metric Toggles */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px]">스케일 프리셋:</span>
            <button
              onClick={() => applyPreset('nano')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                scaleFilter === 'nano' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Nano (초경량 엣지)
            </button>
            <button
              onClick={() => applyPreset('standard')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                scaleFilter === 'small_compact' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Small / Compact (표준)
            </button>
            <button
              onClick={() => applyPreset('flagship')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                scaleFilter === 'medium_large' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Medium / XLarge (고정밀)
            </button>
            <button
              onClick={() => setScaleFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                scaleFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              전체
            </button>
          </div>

          {/* Metric Column Checkboxes */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="text-slate-500">표시 지표:</span>
            <label className="flex items-center gap-1 cursor-pointer hover:text-slate-200">
              <input
                type="checkbox"
                checked={showMap}
                onChange={(e) => setShowMap(e.target.checked)}
                className="w-3.5 h-3.5 accent-sky-500 rounded"
              />
              <span>mAP</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer hover:text-slate-200">
              <input
                type="checkbox"
                checked={showLatency}
                onChange={(e) => setShowLatency(e.target.checked)}
                className="w-3.5 h-3.5 accent-sky-500 rounded"
              />
              <span>Latency</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer hover:text-slate-200">
              <input
                type="checkbox"
                checked={showFps}
                onChange={(e) => setShowFps(e.target.checked)}
                className="w-3.5 h-3.5 accent-sky-500 rounded"
              />
              <span>FPS</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer hover:text-slate-200">
              <input
                type="checkbox"
                checked={showNms}
                onChange={(e) => setShowNms(e.target.checked)}
                className="w-3.5 h-3.5 accent-sky-500 rounded"
              />
              <span>NMS</span>
            </label>
          </div>
        </div>
      </div>

      {/* Active Device & Baseline Reference Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono-code">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">측정 하드웨어 환경:</span>
          <span className="text-slate-200 font-bold">
            {activeDevice === 'jetson' ? 'NVIDIA Jetson Orin NX (100 TOPS INT8)' : 'Rockchip RK3588 (6 TOPS 3-Core NPU)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">비교 기준선(Baseline):</span>
          <select
            value={baselineModelId}
            onChange={(e) => setBaselineModelId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs font-bold focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            {DETECTION_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} (mAP {m.map50_95}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Bar Chart (Recharts) */}
      {showChart && (
        <ModelComparisonBarChart
          models={displayedModels}
          activeDevice={activeDevice}
          focusMode={focusMode}
          onFocusModeChange={onFocusModeChange}
        />
      )}

      {/* Accuracy Evolution Line Chart (Recharts) */}
      {showLineChart && (
        <YoloEvolutionLineChart
          focusMode={focusMode}
          onFocusModeChange={onFocusModeChange}
        />
      )}

      {/* VIEW STYLE 1: SIDE-BY-SIDE COLUMNS (Card Columns) */}
      {viewStyle === 'columns' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>나란히 비교 컬럼 ({representativeModels.length}개 아키텍처 활성화)</span>
            <span className="text-[11px] text-slate-500 font-mono-code">가로 스크롤 지원 ↔</span>
          </div>

          <div className="overflow-x-auto pb-3">
            <div className="flex gap-4 min-w-[760px]">
              {representativeModels.map(({ family, model }) => {
                const latency = getLatency(model);
                const fps = getFps(model);

                // Deltas against baseline
                const mapDelta = (model.map50_95 - baselineModel.map50_95).toFixed(1);
                const latDelta = (latency - baselineLatency).toFixed(1);
                const fpsDelta = fps - baselineFps;

                const isHighestMap = model.map50_95 === maxMap;
                const isFastestLatency = latency === minLatency;
                const isNmsFree = !model.nmsRequired;

                return (
                  <div
                    key={model.id}
                    className={`flex-1 min-w-[240px] max-w-[320px] rounded-2xl border p-4 space-y-4 transition-all duration-200 flex flex-col justify-between ${
                      isHighestMap
                        ? 'bg-gradient-to-b from-indigo-950/40 to-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                        : isFastestLatency
                        ? 'bg-gradient-to-b from-sky-950/40 to-slate-900 border-sky-500/60 shadow-lg shadow-sky-500/10'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    {/* Header */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono-code font-bold px-2 py-0.5 rounded border ${getFamilyBadge(family)}`}>
                          {family}
                        </span>
                        {isHighestMap && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                            <Award className="w-3 h-3" /> 최고 mAP
                          </span>
                        )}
                        {isFastestLatency && !isHighestMap && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded-full border border-sky-500/30">
                            <Zap className="w-3 h-3" /> 최저 지연
                          </span>
                        )}
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() => onSelectModel?.(model)}
                          className="group/mbtn flex items-center gap-1.5 text-left hover:text-sky-400 transition"
                          title="클릭하여 상세 아키텍처 및 하드웨어 사양 보기"
                        >
                          <h4 className="text-sm font-bold text-white group-hover/mbtn:text-sky-400 transition tracking-tight">
                            {model.name}
                          </h4>
                          <span className="p-0.5 rounded bg-slate-800 text-slate-400 group-hover/mbtn:text-sky-300 group-hover/mbtn:bg-sky-500/20 transition">
                            <Info className="w-3 h-3" />
                          </span>
                        </button>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {model.architecture}
                        </p>
                      </div>
                    </div>

                    {/* Metric Cards */}
                    <div className="space-y-2 text-xs font-mono-code">
                      {/* mAP Metric */}
                      {showMap && (
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-[11px]">COCO mAP 50-95</span>
                            <span className="font-bold text-sm text-sky-400">{model.map50_95}%</span>
                          </div>
                          {model.id !== baselineModelId && (
                            <div className={`text-[10px] font-semibold text-right ${parseFloat(mapDelta) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {parseFloat(mapDelta) >= 0 ? `+${mapDelta}% vs 기준` : `${mapDelta}% vs 기준`}
                            </div>
                          )}
                          {/* Mini Progress Bar */}
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-sky-500 h-1.5 rounded-full"
                              style={{ width: `${(model.map50_95 / 60) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Latency Metric */}
                      {showLatency && (
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-[11px]">Inference Latency</span>
                            <span className="font-bold text-sm text-amber-400">{latency.toFixed(1)} ms</span>
                          </div>
                          {model.id !== baselineModelId && (
                            <div className={`text-[10px] font-semibold text-right ${parseFloat(latDelta) <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {parseFloat(latDelta) <= 0 ? `${latDelta}ms (더 빠름)` : `+${latDelta}ms`}
                            </div>
                          )}
                        </div>
                      )}

                      {/* FPS Metric */}
                      {showFps && (
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-[11px]">실시간 처리량 (FPS)</span>
                            <span className="font-bold text-sm text-emerald-400">{fps} FPS</span>
                          </div>
                          {model.id !== baselineModelId && (
                            <div className={`text-[10px] font-semibold text-right ${fpsDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {fpsDelta >= 0 ? `+${fpsDelta} FPS` : `${fpsDelta} FPS`}
                            </div>
                          )}
                        </div>
                      )}

                      {/* NMS & Hardware Specs */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                        {showNms && (
                          <div className="p-1.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
                            <span className="text-slate-500 block">NMS 후처리</span>
                            <span className={`font-bold ${isNmsFree ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {isNmsFree ? 'NMS-Free' : '필요'}
                            </span>
                          </div>
                        )}
                        {showParams && (
                          <div className="p-1.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
                            <span className="text-slate-500 block">Params</span>
                            <span className="text-slate-200 font-bold">{model.params} M</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Strengths */}
                    <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1">
                      <span className="text-slate-400 block font-semibold">최적 적용 현장:</span>
                      <p className="text-slate-300 line-clamp-2 leading-relaxed">
                        {model.recommendedUse}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW STYLE 2: FULL SORTABLE MATRIX TABLE */}
      {viewStyle === 'matrix' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>선택된 {sortedModels.length}개 모델 상세 데이터 정렬 뷰</span>
            <div className="flex items-center gap-2">
              <span>정렬 기준:</span>
              <button
                onClick={() => {
                  if (sortBy === 'map') setSortDesc(!sortDesc);
                  else { setSortBy('map'); setSortDesc(true); }
                }}
                className={`px-2 py-1 rounded text-[11px] font-mono-code transition ${
                  sortBy === 'map' ? 'bg-sky-600 text-white font-bold' : 'bg-slate-950 text-slate-400'
                }`}
              >
                mAP {sortBy === 'map' && (sortDesc ? '↓' : '↑')}
              </button>
              <button
                onClick={() => {
                  if (sortBy === 'latency') setSortDesc(!sortDesc);
                  else { setSortBy('latency'); setSortDesc(false); }
                }}
                className={`px-2 py-1 rounded text-[11px] font-mono-code transition ${
                  sortBy === 'latency' ? 'bg-sky-600 text-white font-bold' : 'bg-slate-950 text-slate-400'
                }`}
              >
                Latency {sortBy === 'latency' && (sortDesc ? '↓' : '↑')}
              </button>
              <button
                onClick={() => {
                  if (sortBy === 'fps') setSortDesc(!sortDesc);
                  else { setSortBy('fps'); setSortDesc(true); }
                }}
                className={`px-2 py-1 rounded text-[11px] font-mono-code transition ${
                  sortBy === 'fps' ? 'bg-sky-600 text-white font-bold' : 'bg-slate-950 text-slate-400'
                }`}
              >
                FPS {sortBy === 'fps' && (sortDesc ? '↓' : '↑')}
              </button>
            </div>
          </div>

          {/* Conditional Warning Banner */}
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                <strong>조건부 서식:</strong> 지연시간 &gt; 30ms (30 FPS 미달 위험) 또는 mAP &lt; 0.70 (40.0% 미만) 항목은 주황색 경고로 하이라이트됩니다.
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono-code shrink-0">
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">⚠️ &gt;30ms 지연</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">⚠️ &lt;0.70 mAP</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 font-mono-code">
                  <th className="p-3">상태</th>
                  <th className="p-3">아키텍처 계열</th>
                  <th className="p-3">모델명</th>
                  {showMap && <th className="p-3 text-right">COCO mAP (%)</th>}
                  {showLatency && <th className="p-3 text-right">지연시간 (ms)</th>}
                  {showFps && <th className="p-3 text-right">실시간 FPS</th>}
                  {showParams && <th className="p-3 text-right">Params (M)</th>}
                  {showFlops && <th className="p-3 text-right">FLOPs (G)</th>}
                  {showNms && <th className="p-3 text-center">NMS 배제</th>}
                  <th className="p-3">권장 활용 분야</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-mono-code">
                {sortedModels.map((m) => {
                  const latency = getLatency(m);
                  const fps = getFps(m);
                  const isTopMap = m.map50_95 === maxMap;
                  const isTopFps = fps === maxFps;
                  const isLatencyWarning = latency > 30;
                  const isMapWarning = m.map50_95 < 40.0 || m.map50_95 < 0.70;
                  const hasWarning = isLatencyWarning || isMapWarning;

                  return (
                    <tr
                      key={m.id}
                      className={`transition ${
                        hasWarning
                          ? 'bg-amber-500/10 hover:bg-amber-500/20 border-l-4 border-l-amber-500 text-amber-100'
                          : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <td className="p-3 whitespace-nowrap">
                        {hasWarning ? (
                          <div className="flex items-center gap-1 text-amber-400" title="조건부 서식 경고 플래그">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="text-[10px] font-bold">주의</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="text-[10px] text-slate-500">적합</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getFamilyBadge(m.family)}`}>
                          {m.family}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-white whitespace-nowrap font-sans">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectModel?.(m)}
                            className="group/mrow flex items-center gap-1.5 hover:text-sky-400 text-left transition font-bold"
                            title="클릭하여 상세 아키텍처 및 하드웨어 사양 보기"
                          >
                            <span className="group-hover/mrow:underline decoration-sky-400/50">{m.name}</span>
                            <span className="p-0.5 rounded bg-slate-800/80 text-slate-500 group-hover/mrow:text-sky-300 group-hover/mrow:bg-sky-500/20 transition">
                              <Info className="w-3 h-3 shrink-0" />
                            </span>
                          </button>
                          {isTopMap && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] border border-amber-500/30">
                              최고정밀
                            </span>
                          )}
                          {isTopFps && !isTopMap && (
                            <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 text-[9px] border border-sky-500/30">
                              최고FPS
                            </span>
                          )}
                          {isLatencyWarning && (
                            <span className="px-1 py-0.2 rounded bg-amber-500/25 text-amber-300 text-[9px] border border-amber-500/40">
                              &gt;30ms
                            </span>
                          )}
                          {isMapWarning && (
                            <span className="px-1 py-0.2 rounded bg-amber-500/25 text-amber-300 text-[9px] border border-amber-500/40">
                              &lt;0.70
                            </span>
                          )}
                        </div>
                      </td>
                      {showMap && (
                        <td className="p-3 text-right font-bold whitespace-nowrap">
                          {isMapWarning ? (
                            <div className="inline-flex items-center gap-1 text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              <span>{m.map50_95}%</span>
                              <span className="text-[9px] text-amber-400">(&lt;0.70)</span>
                            </div>
                          ) : (
                            <span className="text-sky-400">{m.map50_95}%</span>
                          )}
                        </td>
                      )}
                      {showLatency && (
                        <td className="p-3 text-right font-bold whitespace-nowrap">
                          {isLatencyWarning ? (
                            <div className="inline-flex items-center gap-1 text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              <span>{latency.toFixed(1)}ms</span>
                              <span className="text-[9px] text-amber-400">(&gt;30ms)</span>
                            </div>
                          ) : (
                            <span className="text-amber-400">{latency.toFixed(1)}ms</span>
                          )}
                        </td>
                      )}
                      {showFps && (
                        <td className="p-3 text-right font-bold whitespace-nowrap">
                          <span className={fps < 30 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                            {fps} FPS
                          </span>
                        </td>
                      )}
                      {showParams && (
                        <td className="p-3 text-right text-slate-400 whitespace-nowrap">
                          {m.params} M
                        </td>
                      )}
                      {showFlops && (
                        <td className="p-3 text-right text-slate-400 whitespace-nowrap">
                          {m.flops} G
                        </td>
                      )}
                      {showNms && (
                        <td className="p-3 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.nmsRequired
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {m.nmsRequired ? '필요' : 'NMS-Free'}
                          </span>
                        </td>
                      )}
                      <td className="p-3 font-sans text-xs text-slate-400 max-w-xs truncate">
                        {m.recommendedUse}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Engineering Takeaway Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            초저지연 톨게이트 (0~3ms)
          </span>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            <strong>YOLOv10-N / YOLOv12-N:</strong> NMS-Free 및 하이브리드 블록으로 단일 프레임 1~2ms 이내 처리. 120 FPS 이상의 압도적 처리량 구현.
          </p>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
          <span className="font-bold text-white flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
            정보 유실 최소화 (PGI 혁신)
          </span>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            <strong>YOLOv9 (GELAN + PGI):</strong> 심층 레이어에서의 그래디언트 정보 유실을 완전히 복원하여 53~55.6%의 높은 mAP를 실현.
          </p>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            야간 반사광 & 간판 교란 극복
          </span>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            <strong>RT-DETR-R18/R50:</strong> 전역 셀프 어텐션 쿼리로 주변 도로 간판이나 헤드라이트 빛 번짐 속에서도 오탐지 0건에 도전.
          </p>
        </div>
      </div>
    </div>
  );
};
