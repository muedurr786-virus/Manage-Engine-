import React, { useState } from 'react';
import { useInventoryEngine } from '../context/InventoryEngineContext';
import {
  X,
  Cpu,
  Layers,
  HardDrive,
  Monitor,
  Zap,
  Globe,
  MapPin,
  Building,
  MinusCircle,
  PlusCircle,
  ShoppingCart,
  QrCode,
  Sliders,
  Check,
} from 'lucide-react';

export const ItemDetailModal: React.FC = () => {
  const {
    selectedItemForDetail,
    setSelectedItemForDetail,
    openStockMovementModal,
    openPurchaseOrderModal,
    openBarcodeModal,
    updateItemThresholds,
    transactions,
  } = useInventoryEngine();

  const [isEditingThresholds, setIsEditingThresholds] = useState(false);
  const [minThresholdInput, setMinThresholdInput] = useState(0);
  const [criticalThresholdInput, setCriticalThresholdInput] = useState(0);
  const [targetStockInput, setTargetStockInput] = useState(0);

  if (!selectedItemForDetail) return null;
  const item = selectedItemForDetail;

  const itemTransactions = transactions.filter((tx) => tx.itemId === item.id);

  const startEditingThresholds = () => {
    setMinThresholdInput(item.minThreshold);
    setCriticalThresholdInput(item.criticalThreshold);
    setTargetStockInput(item.targetStock);
    setIsEditingThresholds(true);
  };

  const saveThresholds = () => {
    updateItemThresholds(
      item.id,
      Number(minThresholdInput),
      Number(criticalThresholdInput),
      Number(targetStockInput)
    );
    setIsEditingThresholds(false);
  };

  const isLowStock = item.currentStock <= item.minThreshold;
  const isCritical = item.currentStock <= item.criticalThreshold;
  const isDepleted = item.currentStock <= 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedItemForDetail(null)}
        />

        {/* Modal Window */}
        <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden text-xs">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono-data text-cyan-400 font-semibold text-xs">
                  {item.sku}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400 uppercase tracking-wider text-[11px]">
                  {item.brand}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400 capitalize">{item.category}</span>
              </div>
              <h2 className="text-lg font-bold text-white font-display mt-1">
                {item.name}
              </h2>
              <span className="text-slate-400 text-xs">
                Model: <strong className="font-mono-data text-slate-300">{item.modelNumber}</strong>
              </span>
            </div>

            <button
              onClick={() => setSelectedItemForDetail(null)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="pt-4 space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            {/* Top Stat Gauges */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">In Storage</span>
                <span
                  className={`font-mono-data text-xl font-bold ${
                    isDepleted || isCritical
                      ? 'text-rose-400'
                      : isLowStock
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {item.currentStock}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Allocated</span>
                <span className="font-mono-data text-xl font-bold text-slate-200">
                  {item.allocatedStock}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">In Transit PO</span>
                <span className="font-mono-data text-xl font-bold text-cyan-300">
                  +{item.inTransitStock}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Unit Value</span>
                <span className="font-mono-data text-xl font-bold text-slate-200">
                  ${item.unitCost.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Threshold & Par Settings Config */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  Automated Threshold Rules & Par Targets
                </span>
                {!isEditingThresholds ? (
                  <button
                    onClick={startEditingThresholds}
                    className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
                  >
                    Adjust Thresholds
                  </button>
                ) : (
                  <button
                    onClick={saveThresholds}
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save Rule Changes
                  </button>
                )}
              </div>

              {isEditingThresholds ? (
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Critical Threshold (Emergency)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={criticalThresholdInput}
                      onChange={(e) => setCriticalThresholdInput(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono-data"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Min Threshold (Warning)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={minThresholdInput}
                      onChange={(e) => setMinThresholdInput(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono-data"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Target Par Stock
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={targetStockInput}
                      onChange={(e) => setTargetStockInput(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono-data"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 text-slate-400 text-xs">
                  <div>
                    <span>Critical Alert Trigger:</span>
                    <strong className="block font-mono-data text-rose-400 text-sm mt-0.5">
                      ≤ {item.criticalThreshold} units
                    </strong>
                  </div>
                  <div>
                    <span>Warning Alert Trigger:</span>
                    <strong className="block font-mono-data text-amber-400 text-sm mt-0.5">
                      ≤ {item.minThreshold} units
                    </strong>
                  </div>
                  <div>
                    <span>Par Replenishment Target:</span>
                    <strong className="block font-mono-data text-slate-200 text-sm mt-0.5">
                      {item.targetStock} units
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {/* Hardware Technical Specifications */}
            <div>
              <h4 className="text-slate-300 font-semibold mb-2">
                Hardware Specifications Sheet
              </h4>
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                {item.specifications.processor && (
                  <div className="flex items-start gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-slate-400 block">Compute / Processor</span>
                      <span className="text-slate-200">{item.specifications.processor}</span>
                    </div>
                  </div>
                )}
                {item.specifications.ram && (
                  <div className="flex items-start gap-2">
                    <Layers className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-slate-400 block">System Memory (RAM)</span>
                      <span className="text-slate-200">{item.specifications.ram}</span>
                    </div>
                  </div>
                )}
                {item.specifications.storage && (
                  <div className="flex items-start gap-2">
                    <HardDrive className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-slate-400 block">Internal Storage / NVMe</span>
                      <span className="text-slate-200">{item.specifications.storage}</span>
                    </div>
                  </div>
                )}
                {item.specifications.displayOrFormFactor && (
                  <div className="flex items-start gap-2">
                    <Monitor className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-slate-400 block">Form Factor / Chassis</span>
                      <span className="text-slate-200">{item.specifications.displayOrFormFactor}</span>
                    </div>
                  </div>
                )}
                {item.specifications.operatingSystem && (
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-slate-400 block">Operating System / Image</span>
                      <span className="text-slate-200">{item.specifications.operatingSystem}</span>
                    </div>
                  </div>
                )}
                {item.specifications.powerRating && (
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-slate-400 block">Power / PSU Rating</span>
                      <span className="text-slate-200">{item.specifications.powerRating}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location & Supplier */}
            <div className="grid grid-cols-2 gap-3">
              {/* Location */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block mb-1">
                  Assigned Warehouse & Bin
                </span>
                <div className="flex items-center gap-2 text-slate-200">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">{item.location.facility}</span>
                </div>
                <div className="mt-1 text-slate-400 pl-6">
                  {item.location.zone} · <strong className="text-cyan-300 font-mono-data">{item.location.binOrRack}</strong>
                </div>
              </div>

              {/* Supplier */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block mb-1">
                  Procurement Vendor
                </span>
                <div className="flex items-center gap-2 text-slate-200">
                  <Building className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">{item.supplier.name}</span>
                </div>
                <div className="mt-1 text-slate-400 pl-6">
                  {item.supplier.contactEmail} · Lead: <strong className="font-mono-data text-white">{item.supplier.leadTimeDays}d</strong>
                </div>
              </div>
            </div>

            {/* Movement Transaction History for this Item */}
            <div>
              <h4 className="text-slate-300 font-semibold mb-2">
                Recent SKU Movement History ({itemTransactions.length})
              </h4>
              <div className="bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-800/80 max-h-36 overflow-y-auto">
                {itemTransactions.length === 0 ? (
                  <p className="p-3 text-slate-500 italic text-center">No recent stock movements recorded.</p>
                ) : (
                  itemTransactions.map((tx) => (
                    <div key={tx.id} className="p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold uppercase text-[10px] px-1.5 py-0.2 rounded font-mono-data ${
                              tx.type === 'deploy'
                                ? 'bg-rose-950 text-rose-300'
                                : 'bg-emerald-950 text-emerald-300'
                            }`}
                          >
                            {tx.type}
                          </span>
                          <span className="text-slate-300 font-mono-data">{tx.reference}</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-400">{tx.operator}</span>
                        </div>
                        {tx.notes && <p className="text-[11px] text-slate-500 mt-0.5">{tx.notes}</p>}
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-mono-data font-bold ${
                            tx.quantity < 0 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Bal: {tx.newStock}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Bottom Actions Toolbar */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => openBarcodeModal(item)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Barcode & Tags</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedItemForDetail(null);
                  openStockMovementModal(item, 'deploy');
                }}
                disabled={item.currentStock <= 0}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-rose-300 rounded-lg transition-colors"
              >
                <MinusCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Deploy Out</span>
              </button>

              <button
                onClick={() => {
                  setSelectedItemForDetail(null);
                  openStockMovementModal(item, 'restock');
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Restock In</span>
              </button>

              <button
                onClick={() => {
                  setSelectedItemForDetail(null);
                  openPurchaseOrderModal(item);
                }}
                className="flex items-center gap-1 px-3.5 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold rounded-lg transition-colors shadow-sm"
              >
                <ShoppingCart className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Order PO</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
