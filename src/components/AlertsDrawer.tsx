import React from 'react';
import { useInventoryEngine } from '../context/InventoryEngineContext';
import { StockAlert } from '../types/inventory';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  ShoppingCart,
  RotateCcw,
  Clock,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
} from 'lucide-react';

export const AlertsDrawer: React.FC = () => {
  const {
    alerts,
    items,
    isAlertsDrawerOpen,
    setIsAlertsDrawerOpen,
    openPurchaseOrderModal,
    openStockMovementModal,
    batchRestockAllLowStock,
    purchaseOrders,
  } = useInventoryEngine();

  if (!isAlertsDrawerOpen) return null;

  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const poCreatedAlerts = alerts.filter((a) => a.status === 'po_created');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsAlertsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white font-display">
                  Automated Supply Alerts
                </h2>
                <p className="text-xs text-slate-400">
                  {alerts.length} hardware {alerts.length === 1 ? 'item requires' : 'items require'} replenishment
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAlertsDrawerOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Batch Actions Toolbar */}
          {alerts.length > 0 && (
            <div className="px-5 py-3 bg-slate-850 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Action required on <strong className="text-white font-mono-data">{activeAlerts.length}</strong> SKUs
              </span>
              <button
                onClick={batchRestockAllLowStock}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Restock All to Par</span>
              </button>
            </div>
          )}

          {/* Alert Cards List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-white">All Stock Levels Nominal</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Every mobile device, computer, tablet, and server is above minimum safety thresholds.
                </p>
              </div>
            ) : (
              alerts.map((alert) => {
                const item = items.find((i) => i.id === alert.itemId);
                if (!item) return null;

                const isDepleted = alert.severity === 'depleted';
                const isCritical = alert.severity === 'critical';
                const weeklyBurn = item.burnRatePerWeek || 2;
                const daysRunway =
                  item.currentStock > 0
                    ? Math.max(1, Math.round((item.currentStock / (weeklyBurn / 7))))
                    : 0;

                const hasPendingPO = purchaseOrders.some(
                  (po) => po.itemId === item.id && po.status === 'submitted'
                );

                return (
                  <div
                    key={alert.id}
                    className={`rounded-xl border p-4 space-y-3 transition-colors ${
                      isDepleted
                        ? 'bg-rose-950/20 border-rose-800/80'
                        : isCritical
                        ? 'bg-rose-950/15 border-rose-800/60'
                        : 'bg-amber-950/15 border-amber-800/60'
                    }`}
                  >
                    {/* Top alert badge & SKU */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isDepleted ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-rose-300 bg-rose-900/60 px-2 py-0.5 rounded border border-rose-700">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            STOCK DEPLETED
                          </span>
                        ) : isCritical ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-rose-300 bg-rose-900/50 px-2 py-0.5 rounded border border-rose-700/80">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            CRITICAL MINIMUM BREACH
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-900/40 px-2 py-0.5 rounded border border-amber-700/70">
                            <TrendingDown className="w-3.5 h-3.5" />
                            LOW STOCK ADVISORY
                          </span>
                        )}
                        <span className="text-xs font-mono-data text-cyan-300 font-semibold">
                          {item.sku}
                        </span>
                      </div>

                      {hasPendingPO && (
                        <span className="text-[11px] font-medium text-cyan-400 bg-cyan-950/70 border border-cyan-800 px-2 py-0.5 rounded">
                          PO Submitted
                        </span>
                      )}
                    </div>

                    {/* Item Name */}
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Location: {item.location.facility} · {item.location.binOrRack}
                      </p>
                    </div>

                    {/* Telemetry numbers comparison */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Current Stock</span>
                        <span
                          className={`font-mono-data text-base font-bold ${
                            isDepleted || isCritical ? 'text-rose-400' : 'text-amber-400'
                          }`}
                        >
                          {item.currentStock} units
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">Safety Buffer</span>
                        <span className="font-mono-data text-slate-300">
                          {item.minThreshold} units
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">Est. Runway</span>
                        <span className="font-mono-data text-slate-300">
                          {isDepleted ? '0 days' : `~${daysRunway} days`}
                        </span>
                      </div>
                    </div>

                    {/* Reorder Recommendation Box */}
                    <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          Supplier: <strong className="text-slate-200">{item.supplier.name}</strong> ({item.supplier.leadTimeDays}d lead)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 text-[11px]">Recommended Par Reorder:</span>
                        <span className="font-mono-data font-bold text-white ml-1.5">
                          +{alert.suggestedReorder} units
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
                      <button
                        onClick={() => openStockMovementModal(item, 'restock')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        Manual Check-in
                      </button>

                      <button
                        onClick={() => openPurchaseOrderModal(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Order PO ({alert.suggestedReorder} units)</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
