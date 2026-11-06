import React from 'react';
import { useInventoryEngine } from '../context/InventoryEngineContext';
import { HardwareCategory, StockStatus } from '../types/inventory';
import {
  Search,
  LayoutGrid,
  List,
  Smartphone,
  Laptop,
  Tablet,
  Server,
  Zap,
} from 'lucide-react';

interface CategoryFilterBarProps {
  viewMode: 'table' | 'grid';
  setViewMode: (mode: 'table' | 'grid') => void;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  viewMode,
  setViewMode,
}) => {
  const {
    activeCategory,
    setActiveCategory,
    activeStatus,
    setActiveStatus,
    searchQuery,
    setSearchQuery,
    simulateRealTimeDeployment,
  } = useInventoryEngine();

  const categories: { key: HardwareCategory | 'all'; label: string; icon?: React.ReactNode }[] = [
    { key: 'all', label: 'All Hardware' },
    { key: 'mobile', label: 'Mobile Devices', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { key: 'computer', label: 'Computers', icon: <Laptop className="w-3.5 h-3.5" /> },
    { key: 'tablet', label: 'Tablets', icon: <Tablet className="w-3.5 h-3.5" /> },
    { key: 'server', label: 'Servers', icon: <Server className="w-3.5 h-3.5" /> },
  ];

  const statuses: { key: StockStatus | 'all'; label: string }[] = [
    { key: 'all', label: 'All Levels' },
    { key: 'optimal', label: 'Optimal' },
    { key: 'low', label: 'Low Stock (< Buffer)' },
    { key: 'critical', label: 'Critical Buffer' },
    { key: 'out_of_stock', label: 'Depleted (0)' },
  ];

  return (
    <div className="space-y-3 mb-5">
      {/* Top row: Category segmented buttons + View Toggle & Simulation trigger */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right tools: Fast Checkout Simulator & View Switcher */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <button
            onClick={simulateRealTimeDeployment}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/40 border border-cyan-800/60 hover:bg-cyan-900/40 rounded-lg transition-colors whitespace-nowrap"
            title="Deploy hardware immediately to test automated alert threshold breaches"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulate 1 Checkout</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Technical Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Hardware Spec Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Second row: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU, brand, model, facility, rack, or asset tag..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          )}
        </div>

        {/* Stock Level Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-500 text-[11px] whitespace-nowrap">Filter Status:</span>
          {statuses.map((st) => {
            const isActive = activeStatus === st.key;
            return (
              <button
                key={st.key}
                onClick={() => setActiveStatus(st.key)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-800/70'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800/80 hover:bg-slate-850'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
