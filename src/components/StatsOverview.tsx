import React from 'react';
import { useInventoryEngine } from '../context/InventoryEngineContext';
import {
  Smartphone,
  Laptop,
  Tablet,
  Server,
  AlertTriangle,
  Boxes,
  Truck,
  RotateCcw,
} from 'lucide-react';

export const StatsOverview: React.FC = () => {
  const { kpis, batchRestockAllLowStock, setIsAlertsDrawerOpen } = useInventoryEngine();

  const formattedValuation = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(kpis.totalInventoryValuation);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Metric 1: Total SKUs & Category Distribution */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Active Catalog</span>
          <Boxes className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono-data text-white">
            {kpis.totalSkus}
          </span>
          <span className="text-xs text-slate-400">tracked hardware models</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Smartphone className="w-3 h-3 text-cyan-400" />
            <strong className="font-mono-data text-slate-200">{kpis.categoryCounts.mobile}</strong>
          </span>
          <span className="flex items-center gap-1">
            <Laptop className="w-3 h-3 text-blue-400" />
            <strong className="font-mono-data text-slate-200">{kpis.categoryCounts.computer}</strong>
          </span>
          <span className="flex items-center gap-1">
            <Tablet className="w-3 h-3 text-violet-400" />
            <strong className="font-mono-data text-slate-200">{kpis.categoryCounts.tablet}</strong>
          </span>
          <span className="flex items-center gap-1">
            <Server className="w-3 h-3 text-emerald-400" />
            <strong className="font-mono-data text-slate-200">{kpis.categoryCounts.server}</strong>
          </span>
        </div>
      </div>

      {/* Metric 2: Live Stock in Storage */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Available in Storage</span>
          <span className="text-xs text-emerald-400 font-medium">Ready to Deploy</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono-data text-emerald-400">
            {kpis.totalStockInStorage}
          </span>
          <span className="text-xs text-slate-400">units in warehouses</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Allocated:{' '}
            <strong className="font-mono-data text-slate-200">{kpis.totalAllocated}</strong>
          </span>
          <span className="flex items-center gap-1">
            <Truck className="w-3 h-3 text-cyan-400" />
            Inbound: <strong className="font-mono-data text-cyan-300">{kpis.totalInTransit}</strong>
          </span>
        </div>
      </div>

      {/* Metric 3: Automated Supply Alerts */}
      <div
        className={`border rounded-xl p-4 flex flex-col justify-between transition-colors ${
          kpis.criticalAlertsCount > 0
            ? 'bg-rose-950/20 border-rose-800/60'
            : kpis.warningAlertsCount > 0
            ? 'bg-amber-950/20 border-amber-800/60'
            : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between text-xs">
          <span className={kpis.criticalAlertsCount > 0 ? 'text-rose-300' : 'text-slate-400'}>
            Low-Stock Alerts
          </span>
          <AlertTriangle
            className={`w-4 h-4 ${
              kpis.criticalAlertsCount > 0
                ? 'text-rose-400'
                : kpis.warningAlertsCount > 0
                ? 'text-amber-400'
                : 'text-slate-500'
            }`}
          />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono-data ${
                kpis.criticalAlertsCount > 0
                  ? 'text-rose-400'
                  : kpis.warningAlertsCount > 0
                  ? 'text-amber-400'
                  : 'text-slate-200'
              }`}
            >
              {kpis.activeAlertsCount}
            </span>
            <span className="text-xs text-slate-400">threshold triggers</span>
          </div>
          {kpis.activeAlertsCount > 0 && (
            <button
              onClick={() => setIsAlertsDrawerOpen(true)}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
            >
              Review Alerts
            </button>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="text-slate-400 flex gap-2">
            {kpis.criticalAlertsCount > 0 && (
              <span className="text-rose-400 font-medium">
                {kpis.criticalAlertsCount} Critical
              </span>
            )}
            {kpis.warningAlertsCount > 0 && (
              <span className="text-amber-400 font-medium">
                {kpis.warningAlertsCount} Warning
              </span>
            )}
            {kpis.activeAlertsCount === 0 && (
              <span className="text-emerald-400">All supplies nominal</span>
            )}
          </div>
          {kpis.activeAlertsCount > 0 && (
            <button
              onClick={batchRestockAllLowStock}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded transition-colors"
              title="Restock all alert items to target stock levels"
            >
              <RotateCcw className="w-3 h-3 text-cyan-400" />
              <span>Par Restock</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric 4: Inventory Valuation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Storage Valuation</span>
          <span className="text-xs text-slate-400">USD</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono-data text-white">
            {formattedValuation}
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Asset Value At Par</span>
          <span className="text-slate-300 font-mono-data text-[11px]">Enterprise Hardware</span>
        </div>
      </div>
    </div>
  );
};
