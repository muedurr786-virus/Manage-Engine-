import React from 'react';
import { useInventoryEngine } from '../context/InventoryEngineContext';
import { InventoryItem, StockStatus } from '../types/inventory';
import {
  Smartphone,
  Laptop,
  Tablet,
  Server,
  MinusCircle,
  PlusCircle,
  QrCode,
  ShoppingCart,
  MapPin,
  ChevronRight,
} from 'lucide-react';

export const InventoryTable: React.FC = () => {
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

  const getStatusBadge = (item: InventoryItem) => {
    if (item.currentStock <= 0) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Depleted (0)
        </span>
      );
    }
    if (item.currentStock <= item.criticalThreshold) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          Critical Buffer
        </span>
      );
    }
    if (item.currentStock <= item.minThreshold) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        Optimal
      </span>
    );
  };

  if (filteredItems.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
        <p className="text-slate-400 text-sm">No hardware items match your current search and filters.</p>
        <span className="text-xs text-slate-500 mt-1 block">
          Try resetting the status filter or clearing your search term.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-medium">
            <tr>
              <th scope="col" className="py-3 px-4">Hardware SKU & Model</th>
              <th scope="col" className="py-3 px-4">Storage Location</th>
              <th scope="col" className="py-3 px-4">Stock Level & Buffer</th>
              <th scope="col" className="py-3 px-3 text-right">In Storage</th>
              <th scope="col" className="py-3 px-3 text-right">Allocated</th>
              <th scope="col" className="py-3 px-3 text-right">Inbound PO</th>
              <th scope="col" className="py-3 px-4">Status Alert</th>
              <th scope="col" className="py-3 px-4 text-right">Quick Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredItems.map((item) => {
              const isLowStock = item.currentStock <= item.minThreshold;
              const isCritical = item.currentStock <= item.criticalThreshold;
              const percentage = Math.min(100, Math.round((item.currentStock / item.targetStock) * 100));

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-850/60 transition-colors group cursor-pointer ${
                    isCritical
                      ? 'bg-rose-950/10'
                      : isLowStock
                      ? 'bg-amber-950/5'
                      : ''
                  }`}
                  onClick={() => setSelectedItemForDetail(item)}
                >
                  {/* Column 1: SKU & Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-800 rounded-lg shrink-0 mt-0.5">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-data font-semibold text-cyan-300">
                            {item.sku}
                          </span>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-400 text-[11px] uppercase tracking-wider">
                            {item.brand}
                          </span>
                        </div>
                        <p className="text-slate-200 font-medium text-xs mt-0.5 line-clamp-1 group-hover:text-cyan-200 transition-colors">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                          <span>Model {item.modelNumber}</span>
                          <span>·</span>
                          <span>Par: {item.targetStock} units</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Storage Location */}
                  <td className="py-3.5 px-4 text-slate-300">
                    <div className="flex items-center gap-1.5 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-medium text-slate-200">{item.location.facility}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 pl-5">
                      {item.location.zone} · <span className="font-mono-data text-cyan-400/90">{item.location.binOrRack}</span>
                    </div>
                  </td>

                  {/* Column 3: Stock Gauge Visual */}
                  <td className="py-3.5 px-4 min-w-[160px]">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">
                          Capacity ({percentage}%)
                        </span>
                        <span className="text-slate-400 font-mono-data">
                          Buffer: {item.minThreshold}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 relative overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            item.currentStock <= item.criticalThreshold
                              ? 'bg-rose-500'
                              : item.currentStock <= item.minThreshold
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Column 4: In Storage */}
                  <td className="py-3.5 px-3 text-right">
                    <span
                      className={`font-mono-data text-sm font-bold ${
                        item.currentStock <= item.criticalThreshold
                          ? 'text-rose-400'
                          : item.currentStock <= item.minThreshold
                          ? 'text-amber-400'
                          : 'text-slate-100'
                      }`}
                    >
                      {item.currentStock}
                    </span>
                  </td>

                  {/* Column 5: Allocated */}
                  <td className="py-3.5 px-3 text-right">
                    <span className="font-mono-data text-xs text-slate-300">
                      {item.allocatedStock}
                    </span>
                  </td>

                  {/* Column 6: Inbound PO */}
                  <td className="py-3.5 px-3 text-right">
                    {item.inTransitStock > 0 ? (
                      <span className="font-mono-data text-xs text-cyan-400 font-medium bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/50">
                        +{item.inTransitStock}
                      </span>
                    ) : (
                      <span className="text-slate-600 font-mono-data">—</span>
                    )}
                  </td>

                  {/* Column 7: Status Alert */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(item)}
                  </td>

                  {/* Column 8: Quick Action Buttons */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Deploy / Checkout Button */}
                      <button
                        onClick={() => openStockMovementModal(item, 'deploy')}
                        disabled={item.currentStock <= 0}
                        className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        title="Deploy / Check out hardware (-)"
                      >
                        <MinusCircle className="w-4 h-4 text-slate-400 hover:text-rose-400" />
                      </button>

                      {/* Restock Button */}
                      <button
                        onClick={() => openStockMovementModal(item, 'restock')}
                        className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                        title="Restock / Check in hardware (+)"
                      >
                        <PlusCircle className="w-4 h-4 text-slate-400 hover:text-emerald-400" />
                      </button>

                      {/* Barcode / Tag Button */}
                      <button
                        onClick={() => openBarcodeModal(item)}
                        className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                        title="Generate Barcode / Asset Tags"
                      >
                        <QrCode className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
                      </button>

                      {/* 1-Click Purchase Order if low stock */}
                      {isLowStock && (
                        <button
                          onClick={() => openPurchaseOrderModal(item)}
                          className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[11px] font-medium transition-colors"
                          title="Generate Automated Purchase Order"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>Reorder</span>
                        </button>
                      )}

                      <ChevronRight className="w-4 h-4 text-slate-600 ml-1 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
