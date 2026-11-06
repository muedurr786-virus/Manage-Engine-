import React from 'react';
import { useInventoryEngine } from '../context/InventoryEngineContext';
import {
  X,
  Truck,
  CheckCircle2,
  Calendar,
  Building,
  DollarSign,
  PackageCheck,
} from 'lucide-react';

interface PurchaseOrdersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PurchaseOrdersDrawer: React.FC<PurchaseOrdersDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { purchaseOrders, receivePurchaseOrder } = useInventoryEngine();

  if (!isOpen) return null;

  const pendingPOs = purchaseOrders.filter((po) => po.status === 'submitted');
  const receivedPOs = purchaseOrders.filter((po) => po.status === 'received');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white font-display">
                  Inbound Purchase Orders & Restocks
                </h2>
                <p className="text-xs text-slate-400">
                  {pendingPOs.length} active supplier shipments pending delivery
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of Orders */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {purchaseOrders.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                No purchase orders generated yet. Use the alert center to create replenishment requisitions.
              </div>
            ) : (
              purchaseOrders.map((po) => {
                const isPending = po.status === 'submitted';
                const createdDate = new Date(po.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const estDelivery = new Date(po.expectedDelivery).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <div
                    key={po.id}
                    className={`rounded-xl border p-4 space-y-3 transition-colors ${
                      isPending
                        ? 'bg-slate-950/80 border-cyan-800/60'
                        : 'bg-slate-950/40 border-slate-800 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-data font-bold text-white text-xs">
                          {po.poNumber}
                        </span>
                        <span className="text-slate-500">·</span>
                        <span className="font-mono-data text-cyan-300 font-semibold">
                          {po.itemSku}
                        </span>
                      </div>

                      {isPending ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                          In Transit
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Received into Storage
                        </span>
                      )}
                    </div>

                    <h4 className="text-slate-200 font-medium">
                      {po.itemName}
                    </h4>

                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 space-y-1.5 text-slate-400">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-500" />
                          Supplier:
                        </span>
                        <span className="text-slate-200 font-medium">{po.supplierName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Quantity Ordered:</span>
                        <span className="font-mono-data font-bold text-white text-sm">
                          +{po.quantity} units
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>PO Valuation:</span>
                        <span className="font-mono-data text-slate-200 font-medium">
                          ${po.totalCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3 h-3" /> Ordered {createdDate}
                        </span>
                        <span className="text-cyan-300 font-medium">
                          Est. Delivery: {estDelivery}
                        </span>
                      </div>
                    </div>

                    {po.notes && (
                      <p className="text-[11px] text-slate-400 italic">
                        "{po.notes}"
                      </p>
                    )}

                    {isPending && (
                      <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                        <button
                          onClick={() => receivePurchaseOrder(po.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors shadow-sm"
                        >
                          <PackageCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Receive Shipment into Storage</span>
                        </button>
                      </div>
                    )}
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
