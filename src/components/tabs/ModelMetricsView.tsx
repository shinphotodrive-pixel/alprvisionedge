import React, { useState } from 'react';
import {
  Eye,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Info,
  Search,
  ArrowUpDown,
  Filter,
  BarChart3,
  Sparkles,
  Columns3,
  Layers,
  TableProperties,
  TrendingUp
} from 'lucide-react';
import { DETECTION_MODELS, DetectionModel } from '../../data/alprData';
import { SideBySideComparisonTable } from './SideBySideComparisonTable';
import { ModelComparisonBarChart } from '../charts/ModelComparisonBarChart';
import { YoloEvolutionLineChart } from '../charts/YoloEvolutionLineChart';

interface ModelMetricsViewProps {
  activeDevice: 'jetson' | 'rk3588';
}

type SubTab = 'side_by_side' | 'evolution_trend' | 'visualizer_lab' | 'full_table';

export const ModelMetricsView: React.FC<ModelMetricsViewProps> = ({ activeDevice }) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('side_by_side');
  const [metricView, setMetricView] = useState<'map_latency' | 'params_flops'>('map_latency');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [distractorEnv, setDistractorEnv] = useState<'night_glare' | 'signboard' | 'occlusion'>('night_glare');

  // Filtered models
  const filteredModels = DETECTION_MODELS.filter((m) => {
    const matchesFamily = selectedFamily === 'all' || m.family === selectedFamily;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.architecture.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.recommendedUse.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFamily && matchesSearch;
  });

  // Distractor scores simulation
  const distractorScores = {
    night_glare: {
      title: '야간 헤드라이트 빔 직사 & 빛 번짐 노이즈',
      desc: '야간 직사광선으로 인해 번호판 영역 명암비가 급격히 역전되는 환경입니다.',
      yolo: { score: 78.4, detail: '국소 합성곱(CNN) 수용장 포화로 인한 번호판 엣지 소실' },
      rtdetr: { score: 94.2, detail: '글로벌 셀프 어텐션으로 차량 차체와 조명 노이즈를 명확히 분리' }
    },
    signboard: {
      title: '도로 안내 표지판 / 광고 간판 교란 배경',
      desc: '교차로 상공에 번호판과 유사한 직사각형 텍스트 간판이 산재한 환경입니다.',
      yolo: { score: 82.1, detail: '유사 텍스트 BBox 오탐지(False Positive) 유발 빈도 높음' },
      rtdetr: { score: 96.8, detail: '쿼리 기반 디코더가 차량 하부 위치 컨텍스트를 우선순위화' }
    },
    occlusion: {
      title: '이륜차 / 대형 화물차에 의한 번호판 40% 부분 가림',
      desc: '전방 화물차 범퍼나 이륜차 짐칸에 의해 번호판 일부가 은닉된 경우입니다.',
      yolo: { score: 71.5, detail: '특징 맵 일부 유실 시 IoU 임계값 미달로 드랍 발생' },
      rtdetr: { score: 91.0, detail: '멀티스케일 디포머블 어텐션으로 부분 가시 영역만으로 검출 복원' }
    }
  };

  const currentDistractor = distractorScores[distractorEnv];

  // Helper for latency based on active device
  const getLatency = (model: DetectionModel) => {
    return activeDevice === 'jetson' ? model.latencyOrin : model.latencyRK3588;
  };

  const getFps = (model: DetectionModel) => {
    return Math.round(1000 / getLatency(model));
  };

  return (
    <div className="space-y-6">
      {/* Intro Header & Sub-Tab Navigation Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                Section 2. 객체 인식 및 번호판 탐지
              </span>
              <span className="text-xs text-slate-400 font-mono-code">
                YOLOv8 / YOLOv9 / YOLOv10 / YOLOv11 / YOLOv12 / RT-DETR
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              차량 & 번호판 탐지(Detection) 모델 아키텍처 벤치마크 랩
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              YOLOv8부터 최신 YOLOv12까지의 진화 과정(PGI 정보 보존, NMS-Free 일관 이중 할당, 트랜스포머 하이브리드)과 전역 어텐션 기반 RT-DETR 간의 성능 지표를 다차원으로 비교합니다.
            </p>
          </div>
        </div>

        {/* Sub-Tab Navigation Switcher */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubTab('side_by_side')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition border ${
              activeSubTab === 'side_by_side'
                ? 'bg-sky-600 border-sky-500 text-white shadow-md shadow-sky-600/20'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Columns3 className="w-4 h-4 text-sky-200" />
            <span>나란히 비교표 (Side-by-Side Table)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 font-mono-code border border-sky-800">
              6개 계열
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('evolution_trend')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition border ${
              activeSubTab === 'evolution_trend'
                ? 'bg-sky-600 border-sky-500 text-white shadow-md shadow-sky-600/20 font-bold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>mAP 진화 추세 라인 차트</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono-code border border-emerald-800">
              v8→v12
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('visualizer_lab')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition border ${
              activeSubTab === 'visualizer_lab'
                ? 'bg-sky-600 border-sky-500 text-white shadow-md shadow-sky-600/20 font-bold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>차트 시각화 & 교란 실험실</span>
          </button>

          <button
            onClick={() => setActiveSubTab('full_table')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition border ${
              activeSubTab === 'full_table'
                ? 'bg-sky-600 border-sky-500 text-white shadow-md shadow-sky-600/20 font-bold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <TableProperties className="w-4 h-4 text-emerald-400" />
            <span>전체 모델 사양 데이터베이스</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: DEDICATED SIDE-BY-SIDE COMPARISON TABLE */}
      {activeSubTab === 'side_by_side' && (
        <SideBySideComparisonTable activeDevice={activeDevice} />
      )}

      {/* SUB-TAB 2: YOLO EVOLUTION LINE CHART */}
      {activeSubTab === 'evolution_trend' && (
        <YoloEvolutionLineChart />
      )}

      {/* SUB-TAB 3: VISUALIZER & DISTRACTOR LAB */}
      {activeSubTab === 'visualizer_lab' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Metric Comparison Visualizer Box */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-sky-400" />
                  {metricView === 'map_latency'
                    ? `mAP 50-95 정밀도 (%) vs 추론 지연시간 (${activeDevice === 'jetson' ? 'Jetson Orin NX ms' : 'RK3588 ms'})`
                    : '모델 파라미터 수 (M) vs 연산량 (GFLOPs)'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {metricView === 'map_latency'
                    ? '우상단일수록 정밀도가 높고, 좌측일수록 실시간성이 뛰어납니다.'
                    : '640x640 입력 텐서 기준 연산 복잡도 지표'}
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setMetricView('map_latency')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    metricView === 'map_latency'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  mAP vs Latency
                </button>
                <button
                  onClick={() => setMetricView('params_flops')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    metricView === 'params_flops'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Params vs FLOPs
                </button>
              </div>
            </div>

            {/* Recharts Interactive Bar Chart */}
            <ModelComparisonBarChart
              models={filteredModels}
              activeDevice={activeDevice}
              compact={true}
            />

            {/* Visual Bars List */}
            <div className="space-y-3">
              {filteredModels.map((m) => {
                const latency = getLatency(m);
                const fps = getFps(m);
                const mapWidth = (m.map50_95 / 60) * 100;
                const latencyWidth = (latency / 55) * 100;
                const paramsWidth = (m.params / 70) * 100;
                const flopsWidth = (m.flops / 260) * 100;

                return (
                  <div key={m.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{m.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono-code font-semibold ${
                          m.nmsRequired
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {m.nmsRequired ? 'NMS 필요' : 'NMS-Free'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono-code">
                        {metricView === 'map_latency' ? (
                          <>
                            <span className="text-sky-400 font-bold">mAP: {m.map50_95}%</span>
                            <span className="text-amber-400 font-bold">Lat: {latency.toFixed(1)}ms</span>
                            <span className="text-emerald-400 font-bold">{fps} FPS</span>
                          </>
                        ) : (
                          <>
                            <span className="text-indigo-400 font-bold">Params: {m.params}M</span>
                            <span className="text-emerald-400 font-bold">FLOPs: {m.flops}G</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Dual Bar Progress */}
                    {metricView === 'map_latency' ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="w-16 shrink-0 font-mono-code">mAP</span>
                          <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-sky-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${mapWidth}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="w-16 shrink-0 font-mono-code">Latency</span>
                          <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${latencyWidth}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="w-16 shrink-0 font-mono-code">Params</span>
                          <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${paramsWidth}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="w-16 shrink-0 font-mono-code">FLOPs</span>
                          <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${flopsWidth}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <span className="font-semibold text-slate-200 block flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                YOLOv9 vs YOLOv10 vs YOLOv12 아키텍처 핵심 시사점
              </span>
              <p className="text-[11px] leading-relaxed text-slate-400">
                <strong>YOLOv9</strong>은 GELAN과 PGI 구조로 심층 신경망 정보 병목을 해소하였으며, <strong>YOLOv10</strong>은 이중 할당(Dual Assignment)으로 NMS 지연을 없앴습니다. <strong>YOLOv12</strong>는 컨볼루션과 영역 트랜스포머의 융합으로 최고 수준의 윤곽선 식별율을 보유합니다.
              </p>
            </div>
          </div>

          {/* Distractor & Occlusion Robustness Lab Card */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-5 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  도로 교란 환경(Distractor) 내성 실험실
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  CNN 국소 수용장과 트랜스포머 전역 어텐션의 오인식 차이를 시뮬레이션합니다.
                </p>
              </div>

              {/* Distractor Environment Selector */}
              <div className="space-y-1.5 text-xs">
                <label className="text-slate-300 font-semibold block">교란 환경 시나리오 선택:</label>
                <div className="space-y-1.5">
                  {[
                    { id: 'night_glare', label: '야간 헤드라이트 빔 직사 / 빛번짐' },
                    { id: 'signboard', label: '도로 표지판 / 광고 간판 교란 배경' },
                    { id: 'occlusion', label: '차량 간 번호판 40% 부분 가림(Occlusion)' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setDistractorEnv(item.id as any)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition border ${
                        distractorEnv === item.id
                          ? 'bg-sky-500/15 border-sky-500/50 text-white font-semibold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulation Comparison Results Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="text-xs font-bold text-slate-200 pb-1 border-b border-slate-800/80">
                  {currentDistractor.title}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {currentDistractor.desc}
                </p>

                {/* YOLO Bar */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">YOLO (CNN Local Context):</span>
                    <span className="font-bold text-amber-400 font-mono-code">{currentDistractor.yolo.score}% 탐지</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-amber-400 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${currentDistractor.yolo.score}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    {currentDistractor.yolo.detail}
                  </span>
                </div>

                {/* RT-DETR Bar */}
                <div className="space-y-1.5 text-xs pt-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">RT-DETR (Global Attention):</span>
                    <span className="font-bold text-emerald-400 font-mono-code">{currentDistractor.rtdetr.score}% 탐지</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-400 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${currentDistractor.rtdetr.score}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    {currentDistractor.rtdetr.detail}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-sky-500/10 border border-sky-500/20 p-3.5 rounded-xl text-xs text-sky-300 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                아키텍처 적용 가이드
              </span>
              <p className="text-[11px] leading-relaxed text-sky-200/80">
                야간 반사광과 표지판 교란이 심한 다차선 간선도로에는 <strong>RT-DETR</strong>이 오경보를 극적으로 줄이며, 초고속 톨게이트에는 <strong>YOLOv10/v12</strong>가 최상의 처리량을 보장합니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: FULL DATABASE MATRIX */}
      {activeSubTab === 'full_table' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                탐지 모델 전체 기술 사양 및 필드 권장 매트릭스
              </h3>
              <span className="text-xs text-slate-500 font-mono-code">
                ({filteredModels.length}개 모델 등록됨)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="모델명/구조 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <select
                value={selectedFamily}
                onChange={(e) => setSelectedFamily(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500 cursor-pointer font-medium"
              >
                <option value="all">전체 계열</option>
                <option value="YOLOv8">YOLOv8</option>
                <option value="YOLOv9">YOLOv9 (GELAN/PGI)</option>
                <option value="YOLOv10">YOLOv10 (NMS-Free)</option>
                <option value="YOLOv11">YOLOv11</option>
                <option value="YOLOv12">YOLOv12 (Hybrid ViT)</option>
                <option value="RT-DETR">RT-DETR (Transformer)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/70 text-slate-400 font-semibold border-b border-slate-800">
                  <th className="p-3.5">모델 아키텍처</th>
                  <th className="p-3.5">Scale (Params / FLOPs)</th>
                  <th className="p-3.5">COCO mAP (%)</th>
                  <th className="p-3.5">NMS 후처리</th>
                  <th className="p-3.5">A100 지연</th>
                  <th className="p-3.5">{activeDevice === 'jetson' ? 'Jetson Orin 지연' : 'RK3588 지연'}</th>
                  <th className="p-3.5">FPS</th>
                  <th className="p-3.5">핵심 구조 및 최적 적용 현장</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredModels.map((m) => {
                  const latency = getLatency(m);
                  const fps = getFps(m);
                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-white whitespace-nowrap">
                        {m.name}
                      </td>
                      <td className="p-3.5 font-mono-code text-slate-400 whitespace-nowrap">
                        {m.params}M / {m.flops}G
                      </td>
                      <td className="p-3.5 font-mono-code font-bold text-sky-400 whitespace-nowrap">
                        {m.map50_95}%
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.nmsRequired
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {m.nmsRequired ? 'NMS 필수' : 'NMS-Free (제거)'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono-code text-slate-400 whitespace-nowrap">
                        {m.latencyA100.toFixed(2)}ms
                      </td>
                      <td className="p-3.5 font-mono-code font-bold text-amber-400 whitespace-nowrap">
                        {latency.toFixed(1)}ms
                      </td>
                      <td className="p-3.5 font-mono-code font-bold text-emerald-400 whitespace-nowrap">
                        {fps} FPS
                      </td>
                      <td className="p-3.5 text-xs text-slate-400">
                        <div className="font-medium text-slate-200">{m.recommendedUse}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{m.architecture}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
