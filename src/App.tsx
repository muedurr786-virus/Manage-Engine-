import React, { useState } from 'react';
import { InventoryEngineProvider, useInventoryEngine } from './context/InventoryEngineContext';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { ActiveAlertBanner } from './components/ActiveAlertBanner';
import { CategoryFilterBar } from './components/CategoryFilterBar';
import { InventoryTable } from './components/InventoryTable';
import { InventoryGrid } from './components/InventoryGrid';
import { AlertsDrawer } from './components/AlertsDrawer';
import { StockMovementModal } from './components/StockMovementModal';
import { PurchaseOrderModal } from './components/PurchaseOrderModal';
import { BarcodeModal } from './components/BarcodeModal';
import { ItemDetailModal } from './components/ItemDetailModal';
import { AuditTrailDrawer } from './components/AuditTrailDrawer';
import { AddItemModal } from './components/AddItemModal';
import { AlertSettingsModal } from './components/AlertSettingsModal';
import { PurchaseOrdersDrawer } from './components/PurchaseOrdersDrawer';
import { Truck } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isPODrawerOpen, setIsPODrawerOpen] = useState(false);
  const { purchaseOrders } = useInventoryEngine();

  const pendingPOCount = purchaseOrders.filter((po) => po.status === 'submitted').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top KPI & Operational Stats */}
        <StatsOverview />

        {/* Dynamic Automated Alert Banner (shows when any SKU crosses safety thresholds) */}
        <ActiveAlertBanner />

        {/* Operational Section Bar */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white font-display">
              Enterprise Hardware Stock Control
            </h1>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400">
              Live storage levels, deployment tracking & threshold alerts
            </span>
          </div>

          <button
            onClick={() => setIsPODrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white rounded-lg transition-colors whitespace-nowrap"
          >
            <Truck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Inbound POs</span>
            {pendingPOCount > 0 && (
              <span className="bg-cyan-500/20 text-cyan-300 font-mono-data px-1.5 py-0.2 rounded text-[11px] font-semibold border border-cyan-500/30">
                {pendingPOCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Controls: Category, Status, Search, and View Mode */}
        <CategoryFilterBar viewMode={viewMode} setViewMode={setViewMode} />

        {/* Primary Inventory View: Table or Technical Grid */}
        {viewMode === 'table' ? <InventoryTable /> : <InventoryGrid />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>CorePulse Hardware Stock Control Engine · Automated Supply Chain Replenishment</span>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Mobile Devices</span>
            <span>·</span>
            <span>Computers & Workstations</span>
            <span>·</span>
            <span>Enterprise Tablets</span>
            <span>·</span>
            <span>Rack & Blade Servers</span>
          </div>
        </div>
      </footer>

      {/* Modals & Slide-overs */}
      <AlertsDrawer />
      <StockMovementModal />
      <PurchaseOrderModal />
      <BarcodeModal />
      <ItemDetailModal />
      <AuditTrailDrawer />
      <AddItemModal />
      <AlertSettingsModal />
      <PurchaseOrdersDrawer isOpen={isPODrawerOpen} onClose={() => setIsPODrawerOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <InventoryEngineProvider>
      <DashboardContent />
    </InventoryEngineProvider>
  );
}
