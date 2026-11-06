import React, { useState } from 'react';
import { useInventoryEngine } from '../context/InventoryEngineContext';
import { TransactionType } from '../types/inventory';
import {
  X,
  History,
  FileSpreadsheet,
  MinusCircle,
  PlusCircle,
  RotateCcw,
  SlidersHorizontal,
  ArrowRight,
  Search,
} from 'lucide-react';

export const AuditTrailDrawer: React.FC = () => {
  const {
    isAuditTrailOpen,
    setIsAuditTrailOpen,
    transactions,
  } = useInventoryEngine();

  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isAuditTrailOpen) return null;

  const filteredTransactions = transactions.filter((tx) => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matchSku = tx.itemSku.toLowerCase().includes(q);
      const matchName = tx.itemName.toLowerCase().includes(q);
      const matchOp = tx.operator.toLowerCase().includes(q);
      const matchRef = tx.reference.toLowerCase().includes(q);
      if (!matchSku && !matchName && !matchOp && !matchRef) return false;
    }
    return true;
  });

  const getTxTypeBadge = (type: TransactionType) => {
    switch (type) {
      case 'deploy':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60 font-mono-data">
            <MinusCircle className="w-3 h-3 text-rose-400" />
            DEPLOY OUT
          </span>
        );
      case 'restock':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 font-mono-data">
            <PlusCircle className="w-3 h-3 text-emerald-400" />
            RESTOCK IN
          </span>
        );
      case 'return':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60 font-mono-data">
            <RotateCcw className="w-3 h-3 text-blue-400" />
            RETURN
          </span>
        );
      case 'audit_adjustment':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60 font-mono-data">
            <SlidersHorizontal className="w-3 h-3 text-purple-400" />
            RECONCILE
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-mono-data text-slate-300">
            {type}
          </span>
        );
    }
  };

  const exportLedgerCSV = () => {
    const headers = ['Timestamp', 'Type', 'SKU', 'Item Name', 'Delta Qty', 'Prev Stock', 'New Stock', 'Operator', 'Reference', 'Notes'];
    const rows = filteredTransactions.map((tx) => [
      `"${tx.timestamp}"`,
      tx.type,
      `"${tx.itemSku}"`,
      `"${tx.itemName.replace(/"/g, '""')}"`,
      tx.quantity,
      tx.previousStock,
      tx.newStock,
      `"${tx.operator}"`,
      `"${tx.reference}"`,
      `"${(tx.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-audit-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsAuditTrailOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white font-display">
                  Stock Movement & Audit Ledger
                </h2>
                <p className="text-xs text-slate-400">
                  Immutable chronological record of all hardware ins and outs
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAuditTrailOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter & Search Bar */}
          <div className="p-4 bg-slate-850 border-b border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by SKU, ticket #, or operator..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <button
                onClick={exportLedgerCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                title="Export this ledger view as CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export Ledger</span>
              </button>
            </div>

            {/* Type buttons */}
            <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
              {(['all', 'deploy', 'restock', 'return', 'audit_adjustment'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-2.5 py-1 rounded font-medium capitalize whitespace-nowrap transition-colors ${
                    typeFilter === t
                      ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t === 'all' ? 'All Movements' : t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Ledger List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                No transactions found matching your criteria.
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const dateFormatted = new Date(tx.timestamp).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                return (
                  <div
                    key={tx.id}
                    className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTxTypeBadge(tx.type)}
                        <span className="font-mono-data font-semibold text-cyan-300 text-xs">
                          {tx.itemSku}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono-data">
                        {dateFormatted}
                      </span>
                    </div>

                    <h4 className="text-slate-200 font-medium">
                      {tx.itemName}
                    </h4>

                    {/* Numbers: Delta and resulting balance */}
                    <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">Ref:</span>
                        <span className="font-mono-data font-semibold text-slate-200 text-xs">
                          {tx.reference}
                        </span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400 text-[11px]">{tx.operator}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`font-mono-data font-bold text-sm ${
                            tx.quantity < 0 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity} units
                        </span>

                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono-data">
                          <span>({tx.previousStock}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span className="text-slate-300 font-bold">{tx.newStock})</span>
                        </div>
                      </div>
                    </div>

                    {tx.notes && (
                      <p className="text-[11px] text-slate-400 italic">
                        "{tx.notes}"
                      </p>
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
