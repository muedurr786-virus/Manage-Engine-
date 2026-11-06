import React from 'react';
import { useInventoryEngine } from '../context/InventoryEngineContext';
import { AlertTriangle, ShieldAlert, ArrowRight, RotateCcw } from 'lucide-react';

export const ActiveAlertBanner: React.FC = () => {
  const { alerts, kpis, setIsAlertsDrawerOpen, batchRestockAllLowStock } = useInventoryEngine();

  if (alerts.length === 0) return null;

  const urgentAlerts = alerts.filter((a) => a.severity === 'critical' || a.severity === 'depleted');
  const leadAlert = urgentAlerts.length > 0 ? urgentAlerts[0] : alerts[0];

  const isUrgent = leadAlert.severity === 'critical' || leadAlert.severity === 'depleted';

  return (
    <div
      className={`mb-6 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
        isUrgent
          ? 'bg-rose-950/25 border-rose-800/80 text-rose-200'
          : 'bg-amber-950/25 border-amber-800/80 text-amber-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg shrink-0 ${
            isUrgent ? 'bg-rose-900/60 text-rose-300 animate-pulse' : 'bg-amber-900/60 text-amber-300'
          }`}
        >
          {isUrgent ? <ShieldAlert className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wide uppercase text-[11px]">
              {isUrgent ? 'Automated Critical Supply Alert' : 'Automated Low-Stock Alert'}
            </span>
            <span className="text-slate-400">·</span>
            <span className="font-mono-data text-white font-semibold">
              {alerts.length} {alerts.length === 1 ? 'device SKU' : 'device SKUs'} below threshold
            </span>
          </div>
          <p className="text-slate-300 mt-0.5">
            <strong>{leadAlert.itemSku}:</strong> {leadAlert.message} Suggested Par Reorder: <span className="font-mono-data text-white font-bold">+{leadAlert.suggestedReorder} units</span>.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <button
          onClick={batchRestockAllLowStock}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          title="Instantly restock all depleted & low stock SKUs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Replenish All</span>
        </button>

        <button
          onClick={() => setIsAlertsDrawerOpen(true)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors ${
            isUrgent
              ? 'bg-rose-500 hover:bg-rose-400 text-white'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
          }`}
        >
          <span>Open Alert Center</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
