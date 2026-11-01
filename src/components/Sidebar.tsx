import React from 'react';
import {
  Activity,
  Layers,
  Cpu,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Server,
  Zap,
  X
} from 'lucide-react';

export type NavTabId = 'overview' | 'model-metrics' | 'ocr-performance' | 'edge-quantization' | 'deepstream-analytics';

interface SidebarProps {
  activeTab: NavTabId;
  setActiveTab: (tab: NavTabId) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  activeDevice: 'jetson' | 'rk3588';
  setActiveDevice: (device: 'jetson' | 'rk3588') => void;
}

interface NavItem {
  id: NavTabId;
  label: string;
  subLabel: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ElementType;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'overview',
    label: 'Pipeline Overview',
    subLabel: '종단간 E2E 파이프라인',
    badge: '5단계',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    icon: Activity
  },
  {
    id: 'model-metrics',
    label: 'Model Metrics',
    subLabel: 'YOLOv8~v12 & RT-DETR',
    badge: 'SOTA',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    icon: Eye
  },
  {
    id: 'ocr-performance',
    label: 'OCR Performance',
    subLabel: 'SVTR · PARSeq · STN 복원',
    badge: 'Lab',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: Layers
  },
  {
    id: 'edge-quantization',
    label: 'Edge Quantization',
    subLabel: 'PTQ/QAT & 물리 오차 계산',
    badge: 'INT8',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: Cpu
  },
  {
    id: 'deepstream-analytics',
    label: 'DeepStream Analytics',
    subLabel: 'Zero-Copy & 차량 Re-ID',
    badge: 'Live',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    icon: SlidersHorizontal
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  activeDevice,
  setActiveDevice
}) => {
  const handleNavClick = (id: NavTabId) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
        `}
      >
        {/* Brand / Logo Section */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-sky-500/20 shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight text-white truncate">
                    ALPR Vision Edge
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/80 shrink-0">
                    v2.5
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 truncate">
                  지능형 관제 분석 벤치마크
                </span>
              </div>
            )}
          </div>

          {/* Close Button on Mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="사이드바 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          <div className={`px-3 mb-2 text-[10px] font-semibold tracking-wider uppercase text-slate-500 ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? 'NAV' : 'Core Modules'}
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? `${item.label} (${item.subLabel})` : undefined}
                className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-r from-sky-600/20 to-indigo-600/10 text-white font-medium border border-sky-500/30 shadow-sm shadow-sky-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }
                  ${isCollapsed ? 'justify-center px-0' : ''}
                `}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-sky-500" />
                )}

                <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                    : 'bg-slate-800 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-700'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>

                {!isCollapsed && (
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <div className="truncate">
                      <div className={`text-xs truncate ${isActive ? 'font-semibold text-white' : 'font-normal'}`}>
                        {item.label}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {item.subLabel}
                      </div>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono-code font-semibold shrink-0 ml-1.5 ${item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}

          {/* Quick Hardware Switcher */}
          {!isCollapsed && (
            <div className="pt-5 pb-2">
              <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider uppercase text-slate-500 flex items-center justify-between">
                <span>Target Hardware</span>
                <Server className="w-3 h-3 text-slate-500" />
              </div>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveDevice('jetson')}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition flex flex-col items-center text-center ${
                    activeDevice === 'jetson'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="font-bold">Jetson Orin</span>
                  <span className="text-[9px] opacity-80">100 TOPS</span>
                </button>
                <button
                  onClick={() => setActiveDevice('rk3588')}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition flex flex-col items-center text-center ${
                    activeDevice === 'rk3588'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="font-bold">Rockchip RK3588</span>
                  <span className="text-[9px] opacity-80">6 TOPS</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* System Health / Target Metric Footer Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50">
          {!isCollapsed ? (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>실시간 관제 요구규격</span>
                </div>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono-code pt-1 border-t border-slate-800/80">
                <div>
                  <span className="text-slate-500 block">목표 지연율</span>
                  <span className="font-bold text-sky-400">&lt; 33.3ms</span>
                </div>
                <div>
                  <span className="text-slate-500 block">권장 프레임</span>
                  <span className="font-bold text-emerald-400">30~60 FPS</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="실시간 관제 정상 동작 중">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
          )}

          {/* Desktop Collapse Toggle Button */}
          <div className="hidden lg:flex items-center justify-between pt-2">
            {!isCollapsed && (
              <span className="text-[10px] text-slate-500">사이드바 접기</span>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition mx-auto lg:mx-0"
              aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
