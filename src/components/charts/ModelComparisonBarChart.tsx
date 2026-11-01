import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import { DetectionModel } from '../../data/alprData';
import { Award, Zap, ShieldCheck, Info } from 'lucide-react';

interface ModelComparisonBarChartProps {
  models: DetectionModel[];
  activeDevice: 'jetson' | 'rk3588';
  compact?: boolean;
}

export const ModelComparisonBarChart: React.FC<ModelComparisonBarChartProps> = ({
  models,
  activeDevice,
  compact = false
}) => {
  const [metricMode, setMetricMode] = useState<'both' | 'map_only' | 'latency_only'>('both');
  const [sortBy, setSortBy] = useState<'default' | 'map' | 'latency'>('default');

  // Format data for Recharts
  const chartData = models.map((m) => {
    const latency = activeDevice === 'jetson' ? m.latencyOrin : m.latencyRK3588;
    const fps = Math.round(1000 / latency);
    return {
      id: m.id,
      name: m.name.replace('YOLOv', 'v').replace('RT-DETR-', 'DETR-'),
      fullName: m.name,
      family: m.family,
      map: m.map50_95,
      latency: parseFloat(latency.toFixed(1)),
      fps: fps,
      params: m.params,
      flops: m.flops,
      nmsRequired: m.nmsRequired,
      architecture: m.architecture,
      recommendedUse: m.recommendedUse
    };
  });

  // Sort data if requested
  const sortedData = [...chartData].sort((a, b) => {
    if (sortBy === 'map') return b.map - a.map;
    if (sortBy === 'latency') return a.latency - b.latency;
    return 0; // default order
  });

  // Color mapping per family for custom accents
  const getFamilyColor = (family: string) => {
    switch (family) {
      case 'YOLOv8': return '#3b82f6'; // blue
      case 'YOLOv9': return '#14b8a6'; // teal
      case 'YOLOv10': return '#10b981'; // emerald
      case 'YOLOv11': return '#06b6d4'; // cyan
      case 'YOLOv12': return '#6366f1'; // indigo
      case 'RT-DETR': return '#a855f7'; // purple
      default: return '#64748b';
    }
  };

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 border border-slate-800 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono-code space-y-2 min-w-[220px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-white font-sans">{data.fullName}</span>
            <span
              className="text-[10px] px-1.5 py-0.2 rounded font-bold"
              style={{
                backgroundColor: `${getFamilyColor(data.family)}20`,
                color: getFamilyColor(data.family),
                borderColor: `${getFamilyColor(data.family)}40`,
                borderWidth: '1px'
              }}
            >
              {data.family}
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">COCO mAP 50-95:</span>
              <span className="font-bold text-sky-400">{data.map}%</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Inference Latency:</span>
              <span className="font-bold text-amber-400">{data.latency} ms</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Throughput:</span>
              <span className="font-bold text-emerald-400">{data.fps} FPS</span>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
              <span className="text-slate-500">후처리 NMS:</span>
              <span className={`font-bold ${data.nmsRequired ? 'text-amber-400' : 'text-emerald-400'}`}>
                {data.nmsRequired ? 'NMS 필요' : 'NMS-Free'}
              </span>
            </div>
          </div>

          <div className="pt-1 text-[10px] text-slate-500 font-sans line-clamp-2">
            {data.recommendedUse}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-inner">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>모델별 정밀도(mAP) vs 추론 지연시간(Latency) Recharts 비교 바 차트</span>
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30 font-mono-code">
              {activeDevice === 'jetson' ? 'Jetson Orin NX (100T)' : 'Rockchip RK3588 (6T)'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            하늘색 바: COCO mAP (%) • 주황색 바: 지연시간 (ms, 낮을수록 우수) • 빨간 점선: 30 FPS 한계선 (33.3ms)
          </p>
        </div>

        {/* View & Sort Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Metric Mode */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setMetricMode('both')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                metricMode === 'both' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              mAP + Latency
            </button>
            <button
              onClick={() => setMetricMode('map_only')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                metricMode === 'map_only' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              mAP만
            </button>
            <button
              onClick={() => setMetricMode('latency_only')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                metricMode === 'latency_only' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Latency만
            </button>
          </div>

          {/* Sort Toggle */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSortBy('default')}
              className={`px-2 py-1 rounded-lg text-[10px] transition ${
                sortBy === 'default' ? 'bg-slate-800 text-white font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              계열순
            </button>
            <button
              onClick={() => setSortBy('map')}
              className={`px-2 py-1 rounded-lg text-[10px] transition ${
                sortBy === 'map' ? 'bg-slate-800 text-sky-400 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              mAP 높은순
            </button>
            <button
              onClick={() => setSortBy('latency')}
              className={`px-2 py-1 rounded-lg text-[10px] transition ${
                sortBy === 'latency' ? 'bg-slate-800 text-amber-400 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Latency 빠른순
            </button>
          </div>
        </div>
      </div>

      {/* Recharts Container */}
      <div className={`w-full ${compact ? 'h-64' : 'h-80 sm:h-96'}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            margin={{ top: 20, right: 30, left: 0, bottom: 25 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={35}
            />
            {/* Left Y-Axis: mAP (%) */}
            <YAxis
              yAxisId="map"
              orientation="left"
              stroke="#0284c7"
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
              tickLine={false}
              axisLine={{ stroke: '#0284c7' }}
              domain={[0, 65]}
              unit="%"
              label={{ value: 'mAP 50-95 (%)', angle: -90, position: 'insideLeft', fill: '#0284c7', fontSize: 10, offset: 10 }}
            />
            {/* Right Y-Axis: Latency (ms) */}
            <YAxis
              yAxisId="latency"
              orientation="right"
              stroke="#f59e0b"
              fontSize={11}
              fontFamily="JetBrains Mono, monospace"
              tickLine={false}
              axisLine={{ stroke: '#f59e0b' }}
              domain={[0, 55]}
              unit="ms"
              label={{ value: 'Latency (ms)', angle: 90, position: 'insideRight', fill: '#f59e0b', fontSize: 10, offset: 10 }}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
            <Legend
              wrapperStyle={{ paddingTop: 10 }}
              formatter={(value) => {
                if (value === 'map') return <span className="text-xs text-sky-400 font-mono-code">mAP (%)</span>;
                if (value === 'latency') return <span className="text-xs text-amber-400 font-mono-code">Latency (ms)</span>;
                return value;
              }}
            />

            {/* 30 FPS Latency Threshold Line (33.3ms) */}
            {(metricMode === 'both' || metricMode === 'latency_only') && (
              <ReferenceLine
                yAxisId="latency"
                y={33.3}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: '30 FPS 한계선 (33.3ms)',
                  position: 'top',
                  fill: '#f43f5e',
                  fontSize: 10,
                  fontFamily: 'Pretendard, sans-serif'
                }}
              />
            )}

            {/* Bar 1: mAP (%) */}
            {(metricMode === 'both' || metricMode === 'map_only') && (
              <Bar
                yAxisId="map"
                dataKey="map"
                name="map"
                fill="#0284c7"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              >
                {sortedData.map((entry, index) => (
                  <Cell
                    key={`map-cell-${index}`}
                    fill={entry.map >= 52 ? '#38bdf8' : '#0284c7'}
                    fillOpacity={0.9}
                  />
                ))}
              </Bar>
            )}

            {/* Bar 2: Latency (ms) */}
            {(metricMode === 'both' || metricMode === 'latency_only') && (
              <Bar
                yAxisId="latency"
                dataKey="latency"
                name="latency"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              >
                {sortedData.map((entry, index) => (
                  <Cell
                    key={`lat-cell-${index}`}
                    fill={entry.latency <= 5.0 ? '#10b981' : entry.latency > 33.3 ? '#f43f5e' : '#f59e0b'}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Visual Insight Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80 text-xs font-mono-code">
        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
          <Award className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px]">최고 정밀도 (Top mAP)</span>
            <span className="font-bold text-white text-[11px]">YOLOv9-E (55.6%) / YOLOv12-M (52.1%)</span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px]">최저 지연율 (Fastest Latency)</span>
            <span className="font-bold text-white text-[11px]">YOLOv8-N (0.99ms) / YOLOv12-N (1.20ms)</span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px]">지터 없는 NMS-Free</span>
            <span className="font-bold text-white text-[11px]">YOLOv10-N/S / RT-DETR-R18/R50</span>
          </div>
        </div>
      </div>
    </div>
  );
};
