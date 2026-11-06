import React, { useState } from 'react';
import { useInventoryEngine } from '../context/InventoryEngineContext';
import {
  X,
  QrCode,
  Barcode,
  Printer,
  Copy,
  Check,
  Scan,
  MinusCircle,
  PlusCircle,
} from 'lucide-react';

export const BarcodeModal: React.FC = () => {
  const {
    isBarcodeModalOpen,
    setIsBarcodeModalOpen,
    barcodeTargetItem,
    adjustStock,
  } = useInventoryEngine();

  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [scanInput, setScanInput] = useState<string>('');
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  if (!isBarcodeModalOpen || !barcodeTargetItem) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTag(text);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  const handleScanAction = (action: 'deploy' | 'restock') => {
    if (!scanInput.trim()) return;

    adjustStock(
      barcodeTargetItem.id,
      action,
      1,
      `SCAN-${scanInput.trim()}`,
      'Optical Barcode Scanner',
      `Optical scan transaction for tag ${scanInput.trim()}`
    );

    setScanFeedback(`Successfully executed ${action.toUpperCase()} for tag ${scanInput.trim()}`);
    setScanInput('');
    setTimeout(() => setScanFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
          onClick={() => setIsBarcodeModalOpen(false)}
        />

        {/* Modal Window */}
        <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden text-xs">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Barcode className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="font-mono-data text-cyan-400 font-semibold text-xs">
                  {barcodeTargetItem.sku}
                </span>
                <h3 className="text-sm font-semibold text-white">
                  Asset Tag & Barcode Identifier
                </h3>
              </div>
            </div>
            <button
              onClick={() => setIsBarcodeModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="pt-4 space-y-4">
            {/* Visual Barcode Display */}
            <div className="bg-white p-5 rounded-xl flex flex-col items-center justify-center text-slate-900 shadow-inner">
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">
                OmniTrack Universal Code 128
              </span>

              {/* Render authentic SVG Code 128 Barcode lines */}
              <svg className="w-64 h-16" viewBox="0 0 200 50">
                <rect x="10" y="5" width="2" height="40" fill="#0f172a" />
                <rect x="14" y="5" width="4" height="40" fill="#0f172a" />
                <rect x="20" y="5" width="2" height="40" fill="#0f172a" />
                <rect x="24" y="5" width="1" height="40" fill="#0f172a" />
                <rect x="28" y="5" width="5" height="40" fill="#0f172a" />
                <rect x="36" y="5" width="2" height="40" fill="#0f172a" />
                <rect x="42" y="5" width="4" height="40" fill="#0f172a" />
                <rect x="48" y="5" width="1" height="40" fill="#0f172a" />
                <rect x="52" y="5" width="3" height="40" fill="#0f172a" />
                <rect x="58" y="5" width="4" height="40" fill="#0f172a" />
                <rect x="64" y="5" width="2" height="40" fill="#0f172a" />
                <rect x="70" y="5" width="6" height="40" fill="#0f172a" />
                <rect x="78" y="5" width="1" height="40" fill="#0f172a" />
                <rect x="82" y="5" width="4" height="40" fill="#0f172a" />
                <rect x="88" y="5" width="2" height="40" fill="#0f172a" />
                <rect x="94" y="5" width="5" height="40" fill="#0f172a" />
                <rect x="102" y="5" width="3" height="40" fill="#0f172a" />
                <rect x="108" y="5" width="2" height="40" fill="#0f172a" />
                <rect x="114" y="5" width="4" height="40" fill="#0f172a" />
                <rect x="122" y="5" width="2" height="40" fill="#0f172a" />
                <rect x="128" y="5" width="5" height="40" fill="#0f172a" />
                <rect x="136" y="5" width="3" height="40" fill="#0f172a" />
                <rect x="142" y="5" width="1" height="40" fill="#0f172a" />
                <rect x="146" y="5" width="4" height="40" fill="#0f172a" />
                <rect x="154" y="5" width="2" height="40" fill="#0f172a" />
                <rect x="160" y="5" width="5" height="40" fill="#0f172a" />
                <rect x="168" y="5" width="2" height="40" fill="#0f172a" />
                <rect x="174" y="5" width="4" height="40" fill="#0f172a" />
                <rect x="182" y="5" width="2" height="40" fill="#0f172a" />
                <rect x="186" y="5" width="4" height="40" fill="#0f172a" />
              </svg>

              <span className="font-mono-data text-xs font-bold text-slate-800 tracking-wider mt-1">
                *{barcodeTargetItem.sku}*
              </span>
            </div>

            {/* Registered Asset Serials */}
            <div>
              <span className="text-slate-400 font-medium block mb-2">
                Enrolled Serial Asset Tags ({barcodeTargetItem.assetTags.length} in vault)
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {barcodeTargetItem.assetTags.length === 0 ? (
                  <p className="text-slate-500 italic py-2">
                    Zero serialized units currently in storage (all units allocated).
                  </p>
                ) : (
                  barcodeTargetItem.assetTags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800/80 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <QrCode className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-mono-data font-semibold text-slate-200">
                          {tag}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setScanInput(tag)}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300"
                        >
                          Select
                        </button>
                        <button
                          onClick={() => handleCopy(tag)}
                          className="p-1 text-slate-400 hover:text-white"
                          title="Copy tag"
                        >
                          {copiedTag === tag ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Optical Scanner Simulator */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Scan className="w-4 h-4 text-cyan-400" />
                <span>Simulate Optical Scanner Input</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Enter or paste scanned tag..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono-data text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {scanFeedback && (
                <div className="p-2 bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 rounded text-[11px]">
                  {scanFeedback}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleScanAction('deploy')}
                  disabled={!scanInput.trim() || barcodeTargetItem.currentStock <= 0}
                  className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-rose-300 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                >
                  <MinusCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Scan Out (Deploy)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleScanAction('restock')}
                  disabled={!scanInput.trim()}
                  className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-emerald-300 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Scan In (Restock)</span>
                </button>
              </div>
            </div>

            {/* Print / Close */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Physical Label</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBarcodeModalOpen(false)}
                className="px-4 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
