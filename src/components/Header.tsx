import React from 'react';
import { useInventoryEngine } from '../context/InventoryEngineContext';
import {
  Bell,
  Activity,
  History,
  Plus,
  Play,
  Square,
  Settings,
  FileSpreadsheet,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    kpis,
    alerts,
    setIsAlertsDrawerOpen,
    setIsAuditTrailOpen,
    setIsAddItemModalOpen,
    setIsSettingsModalOpen,
    isSimulationRunning,
    toggleLiveSimulation,
    exportData,
  } = useInventoryEngine();

  const hasUrgentAlerts = kpis.criticalAlertsCount > 0 || kpis.depletedAlertsCount > 0;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark with category scope */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-sm font-bold text-sm tracking-tighter">
              CP
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold tracking-tight text-white font-display whitespace-nowrap">
                CorePulse Hardware Hub
              </span>
              <span className="text-xs text-slate-400 whitespace-nowrap">
                Mobile · Computer · Tablet · Server
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation & Status Action Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button
              onClick={() => setIsAuditTrailOpen(true)}
              className="flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap text-xs"
            >
              <History className="w-4 h-4 text-slate-400" />
              <span>Audit Ledger</span>
            </button>

            <button
              onClick={() => exportData('csv')}
              className="flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap text-xs"
              title="Export Inventory as CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-400" />
              <span>Export CSV</span>
            </button>

            {/* Live Demand Simulator Control */}
            <button
              onClick={toggleLiveSimulation}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                isSimulationRunning
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700'
              }`}
              title="Simulate continuous live hardware deployments and test automated alerts"
            >
              {isSimulationRunning ? (
                <>
                  <Square className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                  <span>Stop Simulation</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                  <span>Simulate Real-Time Load</span>
                </>
              )}
            </button>
          </nav>

          {/* Zone 3: Alerts Trigger & Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Automated Alerts Trigger */}
            <button
              onClick={() => setIsAlertsDrawerOpen(true)}
              className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                hasUrgentAlerts
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-200 hover:bg-rose-500/30'
                  : kpis.activeAlertsCount > 0
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-200 hover:bg-amber-500/30'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Bell className={`w-4 h-4 ${hasUrgentAlerts ? 'text-rose-400 animate-bounce' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Alerts</span>
              {kpis.activeAlertsCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[11px] font-bold font-mono-data ${
                    hasUrgentAlerts ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                  }`}
                >
                  {kpis.activeAlertsCount}
                </span>
              )}
            </button>

            {/* Settings button */}
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Threshold Rules & Notification Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => setIsAddItemModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Intake Hardware</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
