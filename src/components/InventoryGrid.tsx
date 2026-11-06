import React from 'react';
import { useInventoryEngine } from '../context/InventoryEngineContext';
import { InventoryItem } from '../types/inventory';
import {
  Smartphone,
  Laptop,
  Tablet,
  Server,
  MinusCircle,
  PlusCircle,
  QrCode,
  ShoppingCart,
  Cpu,
  Layers,
  HardDrive,
  Clock,
  ShieldAlert,
} from 'lucide-react';

export const InventoryGrid: React.FC = () => {
  const {
    filteredItems,
    openStockMovementModal,
    openPurchaseOrderModal,
    openBarcodeModal,
    setSelectedItemForDetail,
  } = useInventoryEngine();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mobile':
        return <Smartphone className="w-4 h-4 text-cyan-400" />;
      case 'computer':
        return <Laptop className="w-4 h-4 text-blue-400" />;
      case 'tablet':
        return <Tablet className="w-4 h-4 text-violet-400" />;
      case 'server':
        return <Server className="w-4 h-4 text-emerald-400" />;
      default:
        return null;
    }
  };

  if (filteredItems.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
        <p className="text-slate-400 text-sm">No hardware items match your current search and filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredItems.map((item) => {
        const isLowStock = item.currentStock <= item.minThreshold;
        const isCritical = item.currentStock <= item.criticalThreshold;
        const isDepleted = item.currentStock <= 0;
        const percentage = Math.min(100, Math.round((item.currentStock / item.targetStock) * 100));

        return (
          <div
            key={item.id}
            onClick={() => setSelectedItemForDetail(item)}
            className={`bg-slate-900 border rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all cursor-pointer group shadow-sm ${
              isDepleted
                ? 'border-rose-900/60 bg-rose-950/10'
                : isCritical
                ? 'border-rose-800/50 bg-rose-950/10'
                : isLowStock
                ? 'border-amber-800/50 bg-amber-950/5'
                : 'border-slate-800'
            }`}
          >
            {/* Header: SKU, Category & Status */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-800 rounded-lg">
                    {getCategoryIcon(item.category)}
                  </div>
                  <span className="font-mono-data font-semibold text-xs text-cyan-300">
                    {item.sku}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400 text-[11px] uppercase tracking-wider">
                    {item.brand}
                  </span>
                </div>

                {/* Status indicator */}
                {isDepleted ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
                    Depleted (0)
                  </span>
                ) : isCritical ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40 animate-pulse">
                    <ShieldAlert className="w-3 h-3" />
                    Critical Buffer
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                    Low Stock
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-emerald-400">
                    Optimal
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold text-slate-100 mt-2.5 line-clamp-1 group-hover:text-cyan-200 transition-colors">
                {item.name}
              </h3>

              {/* Hardware Technical Specs snippet */}
              <div className="mt-3 space-y-1.5 text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                {item.specifications.processor && (
                  <div className="flex items-center gap-2 truncate">
                    <Cpu className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{item.specifications.processor}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-[11px]">
                  {item.specifications.ram && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{item.specifications.ram}</span>
                    </div>
                  )}
                  {item.specifications.storage && (
                    <div className="flex items-center gap-1.5 truncate">
                      <HardDrive className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{item.specifications.storage}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Middle: Stock Levels & Progress */}
            <div className="my-3.5 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400">Stock In Storage</span>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`font-mono-data text-base font-bold ${
                      isCritical
                        ? 'text-rose-400'
                        : isLowStock
                        ? 'text-amber-400'
                        : 'text-white'
                    }`}
                  >
                    {item.currentStock}
                  </span>
                  <span className="text-slate-500 text-xs font-mono-data">/ {item.targetStock} Par</span>
                </div>
              </div>

              {/* Stock Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 relative overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isCritical
                      ? 'bg-rose-500'
                      : isLowStock
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                <span>Allocated: <strong className="font-mono-data text-slate-200">{item.allocatedStock}</strong></span>
                <span>Buffer: <strong className="font-mono-data text-slate-200">{item.minThreshold}</strong></span>
                <span>Location: <strong className="font-mono-data text-slate-200">{item.location.binOrRack}</strong></span>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div
              className="pt-3 border-t border-slate-800/80 flex items-center justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Lead: {item.supplier.leadTimeDays}d</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openStockMovementModal(item, 'deploy')}
                  disabled={item.currentStock <= 0}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 hover:text-white rounded text-xs transition-colors flex items-center gap-1"
                  title="Deploy / Check Out"
                >
                  <MinusCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Deploy</span>
                </button>

                <button
                  onClick={() => openStockMovementModal(item, 'restock')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded text-xs transition-colors flex items-center gap-1"
                  title="Restock / Check In"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Restock</span>
                </button>

                <button
                  onClick={() => openBarcodeModal(item)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  title="Asset Barcode"
                >
                  <QrCode className="w-4 h-4" />
                </button>

                {isLowStock && (
                  <button
                    onClick={() => openPurchaseOrderModal(item)}
                    className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded border border-amber-500/40 transition-colors"
                    title="Generate Purchase Order Requisition"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
