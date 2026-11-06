import React, { useState } from 'react';
import { useInventoryEngine } from '../context/InventoryEngineContext';
import { HardwareCategory, InventoryItem } from '../types/inventory';
import {
  X,
  Plus,
  Smartphone,
  Laptop,
  Tablet,
  Server,
  Building,
  MapPin,
  Sliders,
} from 'lucide-react';

export const AddItemModal: React.FC = () => {
  const { isAddItemModalOpen, setIsAddItemModalOpen, addNewItem } = useInventoryEngine();

  const [category, setCategory] = useState<HardwareCategory>('computer');
  const [sku, setSku] = useState('CMP-DELL-5590');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Dell');
  const [modelNumber, setModelNumber] = useState('Latitude 5590');
  const [currentStock, setCurrentStock] = useState<number>(10);
  const [minThreshold, setMinThreshold] = useState<number>(8);
  const [criticalThreshold, setCriticalThreshold] = useState<number>(3);
  const [targetStock, setTargetStock] = useState<number>(25);
  const [unitCost, setUnitCost] = useState<number>(1450);
  
  // Specs
  const [processor, setProcessor] = useState('Intel Core Ultra 7 165H');
  const [ram, setRam] = useState('32GB DDR5');
  const [storage, setStorage] = useState('512GB PCIe NVMe SSD');
  const [displayOrFormFactor, setDisplayOrFormFactor] = useState('15.6" FHD IPS Anti-glare');
  const [operatingSystem, setOperatingSystem] = useState('Windows 11 Pro Enterprise');
  const [powerRating, setPowerRating] = useState('65W USB-C PD');

  // Location
  const [facility, setFacility] = useState('HQ Tech Hub Silicon Valley');
  const [zone, setZone] = useState('Staging Lab Bay 2');
  const [binOrRack, setBinOrRack] = useState('Rack B-12');

  // Supplier
  const [supplierName, setSupplierName] = useState('Dell Enterprise Direct');
  const [supplierEmail, setSupplierEmail] = useState('orders@dell.com');
  const [leadTimeDays, setLeadTimeDays] = useState<number>(5);

  if (!isAddItemModalOpen) return null;

  const handleCategoryChange = (cat: HardwareCategory) => {
    setCategory(cat);
    if (cat === 'mobile') {
      setSku(`MBL-NEW-${Math.floor(100 + Math.random() * 900)}`);
      setBrand('Apple');
      setName('Apple iPhone 16 Plus (128GB Black)');
      setModelNumber('A3289');
      setProcessor('Apple A18 Chip');
      setRam('8GB');
      setStorage('128GB');
      setDisplayOrFormFactor('6.7" OLED');
      setOperatingSystem('iOS 18');
      setUnitCost(899);
      setMinThreshold(10);
      setCriticalThreshold(4);
      setTargetStock(25);
    } else if (cat === 'computer') {
      setSku(`CMP-NEW-${Math.floor(100 + Math.random() * 900)}`);
      setBrand('Apple');
      setName('MacBook Air 15" M3 (16GB, 512GB)');
      setModelNumber('A3114');
      setProcessor('Apple M3 8-core CPU, 10-core GPU');
      setRam('16GB Unified Memory');
      setStorage('512GB SSD');
      setDisplayOrFormFactor('15.3" Liquid Retina');
      setOperatingSystem('macOS Sequoia');
      setUnitCost(1499);
      setMinThreshold(8);
      setCriticalThreshold(3);
      setTargetStock(20);
    } else if (cat === 'tablet') {
      setSku(`TAB-NEW-${Math.floor(100 + Math.random() * 900)}`);
      setBrand('Apple');
      setName('Apple iPad Air 13" (M2, 128GB Starlight)');
      setModelNumber('A2898');
      setProcessor('Apple M2 Chip');
      setRam('8GB');
      setStorage('128GB');
      setDisplayOrFormFactor('13" Liquid Retina IPS');
      setOperatingSystem('iPadOS 18');
      setUnitCost(799);
      setMinThreshold(6);
      setCriticalThreshold(2);
      setTargetStock(15);
    } else if (cat === 'server') {
      setSku(`SRV-NEW-${Math.floor(100 + Math.random() * 900)}`);
      setBrand('HPE');
      setName('HPE ProLiant DL360 Gen11 1U High-Density Rack Server');
      setModelNumber('P52560-B21');
      setProcessor('2x Intel Xeon Gold 5418Y (48 Cores Total)');
      setRam('128GB DDR5 ECC');
      setStorage('4x 1.92TB NVMe U.3 Read Intensive');
      setDisplayOrFormFactor('1U Rackmount Server');
      setOperatingSystem('RHEL 9 / VMware ESXi 8.0');
      setUnitCost(8500);
      setMinThreshold(4);
      setCriticalThreshold(2);
      setTargetStock(8);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    // Generate initial asset tags
    const assetTags = Array.from({ length: currentStock }).map(
      (_, i) => `AT-${category.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}${i + 1}`
    );

    addNewItem({
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      brand: brand.trim(),
      category,
      modelNumber: modelNumber.trim(),
      currentStock: Number(currentStock),
      allocatedStock: 0,
      inTransitStock: 0,
      minThreshold: Number(minThreshold),
      criticalThreshold: Number(criticalThreshold),
      targetStock: Number(targetStock),
      unitCost: Number(unitCost),
      location: {
        facility: facility.trim(),
        zone: zone.trim(),
        binOrRack: binOrRack.trim(),
      },
      specifications: {
        processor: processor.trim(),
        ram: ram.trim(),
        storage: storage.trim(),
        displayOrFormFactor: displayOrFormFactor.trim(),
        operatingSystem: operatingSystem.trim(),
        powerRating: powerRating.trim(),
      },
      assetTags,
      supplier: {
        name: supplierName.trim(),
        contactEmail: supplierEmail.trim(),
        leadTimeDays: Number(leadTimeDays),
        contractTier: 'Direct OEM',
      },
      lastRestockedAt: new Date().toISOString(),
      burnRatePerWeek: 2,
    });

    setIsAddItemModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
          onClick={() => setIsAddItemModalOpen(false)}
        />

        {/* Modal Window */}
        <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden text-xs">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-base font-semibold text-white font-display">
                  Intake New Hardware Asset SKU
                </h3>
                <p className="text-slate-400 text-xs">
                  Register mobile, computer, tablet, or server device with automated alert thresholds
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddItemModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="pt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {/* Category selection */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Hardware Category
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: 'mobile', label: 'Mobile Device', icon: <Smartphone className="w-4 h-4" /> },
                  { key: 'computer', label: 'Computer', icon: <Laptop className="w-4 h-4" /> },
                  { key: 'tablet', label: 'Tablet', icon: <Tablet className="w-4 h-4" /> },
                  { key: 'server', label: 'Server', icon: <Server className="w-4 h-4" /> },
                ].map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => handleCategoryChange(cat.key as HardwareCategory)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-colors font-medium ${
                      category === cat.key
                        ? 'bg-slate-800 border-cyan-500 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SKU, Name & Brand */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  SKU Code *
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono-data text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-slate-300 font-medium mb-1">
                  Hardware Title / Model Description *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. MacBook Pro 16-inch M3 Max"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Brand / OEM</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Model / Part Number</label>
                <input
                  type="text"
                  value={modelNumber}
                  onChange={(e) => setModelNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono-data text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>
            </div>

            {/* Thresholds & Stock Level Rules */}
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <span className="text-slate-200 font-medium flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Stock Levels & Automated Alert Thresholds
              </span>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Initial Stock Count
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={currentStock}
                    onChange={(e) => setCurrentStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono-data"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Warning Buffer (Min)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-amber-300 font-mono-data"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Critical Alert Buffer
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={criticalThreshold}
                    onChange={(e) => setCriticalThreshold(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-rose-300 font-mono-data"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Target Par Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={targetStock}
                    onChange={(e) => setTargetStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono-data"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Hardware Specifications */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Processor</label>
                <input
                  type="text"
                  value={processor}
                  onChange={(e) => setProcessor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">RAM</label>
                <input
                  type="text"
                  value={ram}
                  onChange={(e) => setRam(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Storage</label>
                <input
                  type="text"
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white"
                />
              </div>
            </div>

            {/* Location & Unit Cost */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Facility / Warehouse</label>
                <input
                  type="text"
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Bin / Rack Unit</label>
                <input
                  type="text"
                  value={binOrRack}
                  onChange={(e) => setBinOrRack(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs font-mono-data text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Unit Cost ($ USD)</label>
                <input
                  type="number"
                  min={1}
                  value={unitCost}
                  onChange={(e) => setUnitCost(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs font-mono-data text-white"
                />
              </div>
            </div>

            {/* Supplier */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Supplier Vendor</label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Lead Time (Days)</label>
                <input
                  type="number"
                  min={1}
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs font-mono-data text-white"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddItemModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Save & Enroll Hardware</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
