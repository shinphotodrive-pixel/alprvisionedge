import React from 'react';
import {
  Menu,
  Download,
  Play,
  RotateCcw,
  Sparkles,
  Server,
  Layers,
  Eye,
  Cpu,
  SlidersHorizontal,
  Activity
} from 'lucide-react';
import { NavTabId, NAV_ITEMS } from './Sidebar';

interface HeaderProps {
  activeTab: NavTabId;
  isCollapsed: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onRunPipeline: () => void;
  onResetPipeline: () => void;
  isSimulating: boolean;
  onOpenExport: () => void;
  activeDevice: 'jetson' | 'rk3588';
  setActiveDevice: (device: 'jetson' | 'rk3588') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  isCollapsed,
  setIsMobileOpen,
  onRunPipeline,
  onResetPipeline,
  isSimulating,
  onOpenExport,
  activeDevice,
  setActiveDevice
}) => {
  const currentNav = NAV_ITEMS.find((item) => item.id === activeTab) || NAV_ITEMS[0];

  const getTabIcon = () => {
    switch (activeTab) {
      case 'overview':
        return <Activity className="w-4 h-4 text-sky-400" />;
      case 'model-metrics':
        return <Eye className="w-4 h-4 text-indigo-400" />;
      case 'ocr-performance':
        return <Layers className="w-4 h-4 text-emerald-400" />;
      case 'edge-quantization':
        return <Cpu className="w-4 h-4 text-amber-400" />;
      case 'deepstream-analytics':
        return <SlidersHorizontal className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          aria-label="메뉴 열기"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hidden sm:flex items-center justify-center">
            {getTabIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                {currentNav.label}
              </h1>
              <span className="text-[11px] text-slate-400 hidden md:inline">
                / {currentNav.subLabel}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              지능형 교통 감시 & 번호판 인식 추론 엔진 종합 벤치마크
            </p>
          </div>
        </div>
      </div>

      {/* Right: Quick Controls, Device Switcher, Pipeline Actions, Export */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs">
        {/* Device quick selector pill */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800">
          <Server className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-400 text-[11px]">엣지 하드웨어:</span>
          <select
            value={activeDevice}
            onChange={(e) => setActiveDevice(e.target.value as 'jetson' | 'rk3588')}
            className="bg-transparent text-slate-200 font-semibold text-[11px] focus:outline-none cursor-pointer"
          >
            <option value="jetson" className="bg-slate-900 text-white">NVIDIA Jetson Orin NX (100T)</option>
            <option value="rk3588" className="bg-slate-900 text-white">Rockchip RK3588 (6 TOPS)</option>
          </select>
        </div>

        {/* Global Pipeline Run Button (useful in overview & anytime) */}
        {activeTab === 'overview' && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onRunPipeline}
              disabled={isSimulating}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-sm ${
                isSimulating
                  ? 'bg-sky-600/50 text-sky-200 cursor-not-allowed'
                  : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20'
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">파이프라인</span> Run
            </button>
            <button
              onClick={onResetPipeline}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="파이프라인 초기화"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Technical Report Export Modal Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-medium px-3 py-1.5 rounded-xl transition shadow-md shadow-indigo-600/20"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">엔지니어링 리포트</span>
          <span className="sm:hidden">리포트</span>
        </button>
      </div>
    </header>
  );
};
