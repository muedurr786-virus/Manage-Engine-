import React, { useState, useEffect } from 'react';
import { useInventoryEngine } from '../context/InventoryEngineContext';
import {
  X,
  ShoppingCart,
  Building,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle,
} from 'lucide-react';

export const PurchaseOrderModal: React.FC = () => {
  const {
    isPOModalOpen,
    setIsPOModalOpen,
    poTargetItem,
    createPurchaseOrder,
  } = useInventoryEngine();

  const [quantity, setQuantity] = useState<number>(10);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (poTargetItem) {
      const suggested = Math.max(
        1,
        poTargetItem.targetStock - poTargetItem.currentStock - poTargetItem.inTransitStock
      );
      setQuantity(suggested);
      setNotes(`Automated replenishment to achieve target par stock of ${poTargetItem.targetStock} units.`);
    }
  }, [poTargetItem, isPOModalOpen]);

  if (!isPOModalOpen || !poTargetItem) return null;

  const totalCost = (quantity || 0) * poTargetItem.unitCost;
  const leadDays = poTargetItem.supplier?.leadTimeDays || 4;
  const deliveryDate = new Date(Date.now() + leadDays * 86400000).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    createPurchaseOrder(poTargetItem.id, quantity, notes.trim());
    setIsPOModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
          onClick={() => setIsPOModalOpen(false)}
        />

        {/* Modal Window */}
        <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono-data text-cyan-400 font-semibold">
                  {poTargetItem.sku}
                </span>
                <h3 className="text-base font-semibold text-white">
                  Automated Purchase Order Requisition
                </h3>
              </div>
            </div>
            <button
              onClick={() => setIsPOModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
            {/* Item Details */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
              <span className="text-white font-semibold text-sm block">
                {poTargetItem.name}
              </span>
              <div className="grid grid-cols-3 gap-2 text-slate-400 pt-1">
                <div>
                  <span className="text-[11px] block">Current Storage:</span>
                  <strong className="text-slate-200 font-mono-data">{poTargetItem.currentStock} units</strong>
                </div>
                <div>
                  <span className="text-[11px] block">Inbound POs:</span>
                  <strong className="text-cyan-300 font-mono-data">+{poTargetItem.inTransitStock} units</strong>
                </div>
                <div>
                  <span className="text-[11px] block">Target Par Stock:</span>
                  <strong className="text-slate-200 font-mono-data">{poTargetItem.targetStock} units</strong>
                </div>
              </div>
            </div>

            {/* Supplier Info */}
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-slate-200 font-medium block">
                    {poTargetItem.supplier.name}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {poTargetItem.supplier.contactEmail} · {poTargetItem.supplier.contractTier}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Lead Time:</span>
                <span className="text-slate-200 font-mono-data">{leadDays} days</span>
              </div>
            </div>

            {/* Quantity Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-medium text-slate-300">
                  Requisition Order Quantity
                </label>
                <span className="text-slate-400">
                  Suggested Par Replenishment: <strong className="text-cyan-300 font-mono-data">+{Math.max(1, poTargetItem.targetStock - poTargetItem.currentStock - poTargetItem.inTransitStock)}</strong>
                </span>
              </div>
              <input
                type="number"
                min={1}
                max={500}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm font-mono-data text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                required
              />
            </div>

            {/* Financial Summary */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span>Unit Cost:</span>
                <span className="font-mono-data text-slate-200">
                  ${poTargetItem.unitCost.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Total PO Valuation:</span>
                <span className="font-mono-data text-base font-bold text-cyan-300">
                  ${totalCost.toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Estimated Delivery:
                </span>
                <span className="font-mono-data text-slate-200">{deliveryDate}</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Requisition Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsPOModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Submit Purchase Order</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
