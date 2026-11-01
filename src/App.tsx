import React, { useState, useEffect, useRef } from 'react';
import { Sidebar, NavTabId } from './components/Sidebar';
import { Header } from './components/Header';
import { PipelineView } from './components/tabs/PipelineView';
import { ModelMetricsView } from './components/tabs/ModelMetricsView';
import { OcrPerformanceView } from './components/tabs/OcrPerformanceView';
import { EdgeQuantizationView } from './components/tabs/EdgeQuantizationView';
import { DeepStreamAnalyticsView } from './components/tabs/DeepStreamAnalyticsView';
import { ReportExportModal } from './components/ReportExportModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('model-metrics');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [activeDevice, setActiveDevice] = useState<'jetson' | 'rk3588'>('jetson');

  // Pipeline simulation state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const simulationIntervalRef = useRef<number | null>(null);

  // Export Modal state
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  const runPipelineSimulation = () => {
    setIsSimulating(true);
    let step = 1;
    setCurrentStep(1);

    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }

    simulationIntervalRef.current = window.setInterval(() => {
      step += 1;
      if (step > 5) {
        if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
        setIsSimulating(false);
      } else {
        setCurrentStep(step);
      }
    }, 1200);
  };

  const resetPipelineSimulation = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }
    setIsSimulating(false);
    setCurrentStep(1);
  };

  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Responsive Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        activeDevice={activeDevice}
        setActiveDevice={setActiveDevice}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          isCollapsed={isCollapsed}
          setIsMobileOpen={setIsMobileOpen}
          onRunPipeline={runPipelineSimulation}
          onResetPipeline={resetPipelineSimulation}
          isSimulating={isSimulating}
          onOpenExport={() => setIsExportOpen(true)}
          activeDevice={activeDevice}
          setActiveDevice={setActiveDevice}
        />

        {/* Tab Body View */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'overview' && (
            <PipelineView
              currentStep={currentStep}
              onSelectStep={setCurrentStep}
              onRunSimulation={runPipelineSimulation}
              onResetSimulation={resetPipelineSimulation}
              isSimulating={isSimulating}
              activeDevice={activeDevice}
            />
          )}

          {activeTab === 'model-metrics' && (
            <ModelMetricsView activeDevice={activeDevice} />
          )}

          {activeTab === 'ocr-performance' && (
            <OcrPerformanceView />
          )}

          {activeTab === 'edge-quantization' && (
            <EdgeQuantizationView
              activeDevice={activeDevice}
              setActiveDevice={setActiveDevice}
            />
          )}

          {activeTab === 'deepstream-analytics' && (
            <DeepStreamAnalyticsView />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 px-4 sm:px-6 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <span className="font-semibold text-slate-200">ALPR Vision Edge SOTA v2.5</span>
              <span className="hidden sm:inline mx-2 text-slate-600">|</span>
              <span className="text-[11px] text-slate-400">
                차량 객체 검출 · 번호판 OCR · 엣지 양자화(PTQ/QAT) · DeepStream 융합 분석
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono-code">
              Target: NVIDIA Jetson Orin NX (100T) / Rockchip RK3588 (6T)
            </div>
          </div>
        </footer>
      </div>

      {/* Technical Export Modal */}
      <ReportExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        activeDevice={activeDevice}
      />
    </div>
  );
}
