import React, { useState, useEffect, useRef } from 'react';
import {
  SlidersHorizontal,
  Layers,
  Activity,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  Video,
  AlertTriangle,
  Car,
  Compass,
  Cpu,
  Sparkles
} from 'lucide-react';
import { DEEPSTREAM_NODES, DeepStreamNode } from '../../data/alprData';

interface SurveillanceChannel {
  id: string;
  name: string;
  location: string;
  fps: number;
  vehiclesCount: number;
  lastPlate: string;
  speedKmH: number;
  status: 'normal' | 'warning' | 'alert';
  alertMsg?: string;
}

export const DeepStreamAnalyticsView: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('streammux');
  const [isSimRunning, setIsSimRunning] = useState<boolean>(true);
  const [activeCamChannel, setActiveCamChannel] = useState<string>('ch1');

  // Re-ID simulation state
  const reidCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const carXRef = useRef<number>(-60);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);

  const selectedNode = DEEPSTREAM_NODES.find((n) => n.id === selectedNodeId) || DEEPSTREAM_NODES[0];

  // Surveillance channels data
  const channels: SurveillanceChannel[] = [
    {
      id: 'ch1',
      name: 'CH-01: 수도권 제1순환 톨게이트',
      location: '하이패스 1·2차로 (고속 통과)',
      fps: 59.8,
      vehiclesCount: 14,
      lastPlate: '370가 8294',
      speedKmH: 104,
      status: 'normal'
    },
    {
      id: 'ch2',
      name: 'CH-02: 경부고속도로 오버패스',
      location: '상행선 164.2km 과속 단속 지점',
      fps: 60.0,
      vehiclesCount: 18,
      lastPlate: '52나 1984',
      speedKmH: 128,
      status: 'alert',
      alertMsg: '제한속도 100km/h 초과 (128km/h) 위반 감지'
    },
    {
      id: 'ch3',
      name: 'CH-03: 테헤란로 중심 교차로',
      location: '강남역 사거리 남단 (다중 차선)',
      fps: 30.0,
      vehiclesCount: 22,
      lastPlate: '12가 3456',
      speedKmH: 42,
      status: 'warning',
      alertMsg: '정지선 위반 및 꼬리물기 주의보'
    },
    {
      id: 'ch4',
      name: 'CH-04: 공공청사 복합 주차 게이트',
      location: '지하 1층 진입 차단기',
      fps: 30.0,
      vehiclesCount: 3,
      lastPlate: '88구 7712',
      speedKmH: 18,
      status: 'normal'
    }
  ];

  // Run Re-ID canvas animation
  useEffect(() => {
    const canvas = reidCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = isSimRunning;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background asphalt road
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Lane separator lines
      ctx.strokeStyle = '#334155';
      ctx.setLineDash([14, 14]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Road shoulder line
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 15);
      ctx.lineTo(width, 15);
      ctx.moveTo(0, height - 15);
      ctx.lineTo(width, height - 15);
      ctx.stroke();

      // Blocking Cargo Truck in the middle lane
      const truckX = width * 0.45;
      const truckY = height * 0.35;
      const truckW = 120;
      const truckH = 65;

      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.fillRect(truckX, truckY, truckW, truckH);
      ctx.strokeRect(truckX, truckY, truckW, truckH);

      // Truck wheels
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(truckX + 15, truckY + truckH - 4, 25, 8);
      ctx.fillRect(truckX + truckW - 35, truckY + truckH - 4, 25, 8);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('대형 화물차 (Occlusion)', truckX + 8, truckY + 36);

      // Update target vehicle position
      if (running) {
        carXRef.current += 2.2;
        if (carXRef.current > width + 60) {
          carXRef.current = -60;
        }
      }

      const carX = carXRef.current;
      const carY = height * 0.45;
      const carW = 68;
      const carH = 34;

      // Target Car Body
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(carX, carY, carW, carH);

      // Car Windshield
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(carX + 40, carY + 4, 18, carH - 8);

      // Bounding Box on Target Car
      const blockedNow = carX + carW > truckX && carX < truckX + truckW;
      setIsBlocked(blockedNow);

      ctx.strokeStyle = blockedNow ? '#f43f5e' : '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(carX - 2, carY - 2, carW + 4, carH + 4);

      // Vehicle ID & Feature Vector label
      ctx.fillStyle = blockedNow ? '#fb7185' : '#38bdf8';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText('ID: #Veh-802', carX, carY - 6);

      if (running) {
        animFrameIdRef.current = requestAnimationFrame(render);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isSimRunning]);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                Section 5. DeepStream & 차량 Re-ID 관제
              </span>
              <span className="text-xs text-slate-400 font-mono-code">
                Zero-Copy VRAM · GStreamer Pipeline · Vehicle Re-ID Persistence
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              DeepStream 무복사 파이프라인 및 차량 외형 재식별(Re-ID) 융합 관제
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              호스트 CPU 메모리 복사 없이 VRAM 내부에서 모든 프레임 텐서를 직렬 파이프라이닝하는 NVIDIA DeepStream GStreamer 구조를 검사하고, 대형 트럭에 의해 번호판이 차폐(Occlusion)되어도 차량 외형 특징 벡터로 지속 추적하는 메커니즘을 시뮬레이션합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSimRunning(!isSimRunning)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              {isSimRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>일시 정지</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>애니메이션 재생</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* DeepStream Pipeline Diagram & Node Inspector */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-sky-400" />
            NVIDIA DeepStream SDK Zero-Copy GStreamer 파이프라인 노드 검사기
          </h3>
          <span className="text-xs text-slate-500 font-mono-code">노드를 클릭하여 내부 파라미터 확인</span>
        </div>

        {/* 6 Pipeline Nodes Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {DEEPSTREAM_NODES.map((node, idx) => {
            const isSelected = selectedNodeId === node.id;
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`cursor-pointer p-3.5 rounded-xl border text-left transition-all duration-200 space-y-2 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-sky-500 ring-1 ring-sky-500 shadow-md shadow-sky-500/10'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono-code font-bold text-slate-500">
                    N0{idx + 1}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-sky-400 animate-pulse' : 'bg-slate-700'}`} />
                </div>
                <div>
                  <h4 className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {node.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                    {node.role}
                  </p>
                </div>
                <div className="text-[9px] font-mono-code text-slate-500 pt-1 border-t border-slate-800/80 truncate">
                  {node.memoryType}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Node Details Inspector Box */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sky-400 text-sm">{selectedNode.name}</span>
              <span className="text-slate-400 font-mono-code">({selectedNode.gstreamerPlugin})</span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/30 font-mono-code">
              메모리 도메인: {selectedNode.memoryType}
            </span>
          </div>

          <p className="text-slate-300 leading-relaxed text-xs">
            {selectedNode.details}
          </p>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span><strong>엔지니어링 튜닝 가이드:</strong> {selectedNode.optimizationTips}</span>
          </div>
        </div>
      </div>

      {/* Vehicle Re-ID Occlusion Tracking Simulator */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Car className="w-4 h-4 text-indigo-400" />
              차량 재식별(Vehicle Re-ID) 가림(Occlusion) 극복 시뮬레이터
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              선행 대형 화물차에 의해 번호판 시야가 완전히 차단되어도, 차량 시각적 임베딩 특징(512-d Visual Fingerprint)으로 Track ID를 지속 유지합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono-code text-xs">
            <span className="text-slate-400">추적 상태:</span>
            <span className={`px-2.5 py-1 rounded-lg font-bold ${
              isBlocked
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {isBlocked ? '가림 발생 (Re-ID 유지)' : '정상 탐지 (OCR 일치)'}
            </span>
          </div>
        </div>

        {/* Simulation Canvas Area */}
        <div className="relative w-full h-44 bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
          <canvas
            ref={reidCanvasRef}
            width={720}
            height={170}
            className="w-full h-full block"
          />
        </div>

        {/* Real-time Tracking Signature Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase font-mono-code">차량 외형 특징 벡터 (Re-ID Fingerprint)</span>
            <span className="font-mono-code text-slate-200 font-bold block mt-1 truncate">
              [+0.824, -0.419, +0.951, -0.128, ...] (512-d)
            </span>
            <p className="text-[11px] text-slate-400 mt-1">차량 모델, 차체 색상, 루프랙 등 고유 임베딩</p>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase font-mono-code">번호판 가시성 상태</span>
            <span className={`font-bold block mt-1 ${isBlocked ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isBlocked ? '번호판 차폐됨 (OCR 텍스트 불가)' : '선명 (OCR: 370가 8294)'}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">1차 번호판 인지 후 Re-ID 시그니처 바인딩 완료</p>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase font-mono-code">코사인 유사도(Cosine Similarity) 신뢰도</span>
            <span className="font-mono-code font-bold text-sky-400 text-sm block mt-1">
              {isBlocked ? '96.8% (Re-ID 영속 유지)' : '99.4% Match'}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">사각지대 통과 후 재출현 시 동일 차량 자동 재연결</p>
          </div>
        </div>
      </div>

      {/* 4-Channel Live Surveillance Stream Simulator */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-emerald-400" />
              4채널 동시 지능형 교통 감시 모니터링 피드
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              DeepStream 동기화 배치(Batch Size = 4) 기반 실시간 이벤트 텔레메트리 피드
            </p>
          </div>
        </div>

        {/* 4 Camera Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {channels.map((cam) => {
            const isSelected = activeCamChannel === cam.id;
            return (
              <div
                key={cam.id}
                onClick={() => setActiveCamChannel(cam.id)}
                className={`cursor-pointer rounded-2xl border p-4 space-y-3 transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-sky-500 ring-1 ring-sky-500'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold text-white truncate">{cam.name}</span>
                  </div>
                  <span className="text-[10px] font-mono-code text-slate-400">{cam.fps} FPS</span>
                </div>

                {/* Simulated Camera Video Box */}
                <div className="relative h-28 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  
                  {/* Bounding box simulation */}
                  <div className="absolute w-24 h-14 border-2 border-emerald-400 rounded bg-emerald-500/10 flex flex-col justify-between p-1 text-[9px] font-mono-code text-emerald-300">
                    <span>Sedan 98%</span>
                    <span className="bg-emerald-950 px-1 py-0.5 rounded text-[8px]">{cam.lastPlate}</span>
                  </div>

                  <span className="absolute bottom-1.5 left-2 text-[10px] text-slate-400 font-mono-code">
                    {cam.location}
                  </span>
                </div>

                {/* Cam Telemetry Footer */}
                <div className="space-y-1 text-xs font-mono-code pt-1 border-t border-slate-800/80">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">통과 속도:</span>
                    <span className={`font-bold ${cam.speedKmH > 110 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {cam.speedKmH} km/h
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">인식 번호판:</span>
                    <span className="text-sky-400 font-bold">{cam.lastPlate}</span>
                  </div>
                  {cam.alertMsg && (
                    <div className="mt-1 p-1.5 bg-rose-500/10 border border-rose-500/30 rounded text-[10px] text-rose-300">
                      {cam.alertMsg}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
