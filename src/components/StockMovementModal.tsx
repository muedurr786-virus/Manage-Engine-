import React, { useState, useEffect } from 'react';
import { useInventoryEngine } from '../context/InventoryEngineContext';
import { TransactionType } from '../types/inventory';
import {
  X,
  MinusCircle,
  PlusCircle,
  RotateCcw,
  SlidersHorizontal,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const StockMovementModal: React.FC = () => {
  const {
    isMovementModalOpen,
    setIsMovementModalOpen,
    movementTargetItem,
    movementDefaultType,
    adjustStock,
  } = useInventoryEngine();

  const [type, setType] = useState<TransactionType>(movementDefaultType || 'deploy');
  const [quantity, setQuantity] = useState<number>(1);
  const [operator, setOperator] = useState<string>('Alex Chen (Hardware Ops)');
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (movementDefaultType) {
      setType(movementDefaultType);
    }
    if (movementTargetItem) {
      if (movementDefaultType === 'deploy') {
        setReference(`TICKET-DEP-${Math.floor(1000 + Math.random() * 9000)}`);
        setQuantity(1);
      } else if (movementDefaultType === 'restock') {
        const suggested = Math.max(1, movementTargetItem.targetStock - movementTargetItem.currentStock);
        setReference(`PO-RECV-${Math.floor(1000 + Math.random() * 9000)}`);
        setQuantity(suggested);
      }
    }
  }, [movementDefaultType, movementTargetItem, isMovementModalOpen]);

  if (!isMovementModalOpen || !movementTargetItem) return null;

  const currentStock = movementTargetItem.currentStock;
  let simulatedStock = currentStock;

  if (type === 'deploy' || type === 'decommission') {
    simulatedStock = Math.max(0, currentStock - (quantity || 0));
  } else if (type === 'restock' || type === 'return') {
    simulatedStock = currentStock + (quantity || 0);
  } else if (type === 'audit_adjustment') {
    simulatedStock = quantity || 0;
  }

  const willBreachCritical = simulatedStock <= movementTargetItem.criticalThreshold;
  const willBreachWarning = simulatedStock <= movementTargetItem.minThreshold && !willBreachCritical;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0 && type !== 'audit_adjustment') return;

    adjustStock(
      movementTargetItem.id,
      type,
      quantity,
      reference.trim() || 'MANUAL-DISPATCH',
      operator.trim() || 'IT Staff',
      notes.trim()
    );

    setIsMovementModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMovementModalOpen(false)}
        />

        {/* Modal Window */}
        <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono-data text-cyan-400 font-semibold">
                {movementTargetItem.sku}
              </span>
              <h3 className="text-base font-semibold text-white mt-0.5">
                Record Stock Movement
              </h3>
            </div>
            <button
              onClick={() => setIsMovementModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {/* Target Item summary */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs">
              <span className="text-slate-300 font-medium block truncate">
                {movementTargetItem.name}
              </span>
              <div className="flex items-center justify-between text-slate-400 mt-2">
                <span>Current In Storage: <strong className="font-mono-data text-white">{currentStock}</strong></span>
                <span>Safety Threshold: <strong className="font-mono-data text-slate-300">{movementTargetItem.minThreshold}</strong></span>
                <span>Par: <strong className="font-mono-data text-slate-300">{movementTargetItem.targetStock}</strong></span>
              </div>
            </div>

            {/* Movement Type Tabs */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Movement Action
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setType('deploy')}
                  className={`py-2 px-1 text-center font-medium rounded-md transition-colors flex flex-col items-center gap-1 ${
                    type === 'deploy'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MinusCircle className="w-3.5 h-3.5" />
                  <span>Deploy</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('restock')}
                  className={`py-2 px-1 text-center font-medium rounded-md transition-colors flex flex-col items-center gap-1 ${
                    type === 'restock'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Restock</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('return')}
                  className={`py-2 px-1 text-center font-medium rounded-md transition-colors flex flex-col items-center gap-1 ${
                    type === 'return'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Return</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('audit_adjustment')}
                  className={`py-2 px-1 text-center font-medium rounded-md transition-colors flex flex-col items-center gap-1 ${
                    type === 'audit_adjustment'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Reconcile</span>
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="font-medium text-slate-300">
                  {type === 'audit_adjustment' ? 'Exact Reconciled Physical Count' : 'Quantity Units'}
                </label>
                {type === 'deploy' && (
                  <span className="text-slate-400">
                    Max Deployable: <strong className="font-mono-data text-white">{currentStock}</strong>
                  </span>
                )}
              </div>
              <input
                type="number"
                min={type === 'audit_adjustment' ? 0 : 1}
                max={type === 'deploy' ? currentStock : 9999}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm font-mono-data text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                required
              />
            </div>

            {/* Operator & Reference */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Operator / Handler
                </label>
                <input
                  type="text"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  placeholder="e.g. David Zhang"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Reference Ticket / Rack
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  placeholder="e.g. TICKET-4910"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Discharge / Intake Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                placeholder="e.g. Issued to Senior Data Scientist for ML cluster testing"
              />
            </div>

            {/* Live Stock Level Preview & Automated Alert Warning */}
            <div className="p-3.5 rounded-xl border bg-slate-950/80 border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Calculated Stock Level After Movement:</span>
                <div className="flex items-center gap-2 font-mono-data">
                  <span className="text-slate-400">{currentStock}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span
                    className={`font-bold text-sm ${
                      willBreachCritical
                        ? 'text-rose-400'
                        : willBreachWarning
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {simulatedStock} units
                  </span>
                </div>
              </div>

              {/* Threshold warning message */}
              {willBreachCritical ? (
                <div className="flex items-center gap-2 text-rose-300 bg-rose-950/40 p-2 rounded-lg border border-rose-900/60">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>
                    Warning: This action will breach the critical minimum buffer ({movementTargetItem.criticalThreshold} units) and immediately trigger a high-severity alert.
                  </span>
                </div>
              ) : willBreachWarning ? (
                <div className="flex items-center gap-2 text-amber-300 bg-amber-950/40 p-2 rounded-lg border border-amber-900/60">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    Advisory: Resulting stock will reach safety threshold ({movementTargetItem.minThreshold} units) and trigger an automated reorder notification.
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Supplies will remain above safety threshold levels.</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsMovementModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors"
              >
                Confirm Movement & Apply
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
