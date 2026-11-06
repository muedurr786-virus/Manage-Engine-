import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  InventoryItem,
  HardwareCategory,
  StockStatus,
  StockTransaction,
  TransactionType,
  StockAlert,
  PurchaseOrder,
  AlertEngineSettings,
} from '../types/inventory';
import { INITIAL_HARDWARE_ITEMS } from '../data/mockHardware';
import { playAlertChime, playSuccessChime } from '../utils/soundAlert';

interface InventoryEngineContextType {
  // State
  items: InventoryItem[];
  transactions: StockTransaction[];
  alerts: StockAlert[];
  purchaseOrders: PurchaseOrder[];
  settings: AlertEngineSettings;
  isSimulationRunning: boolean;
  
  // Navigation & Filtering
  activeCategory: HardwareCategory | 'all';
  setActiveCategory: (cat: HardwareCategory | 'all') => void;
  activeStatus: StockStatus | 'all';
  setActiveStatus: (status: StockStatus | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Selected & Modal State
  selectedItemForDetail: InventoryItem | null;
  setSelectedItemForDetail: (item: InventoryItem | null) => void;
  isAlertsDrawerOpen: boolean;
  setIsAlertsDrawerOpen: (open: boolean) => void;
  isAuditTrailOpen: boolean;
  setIsAuditTrailOpen: (open: boolean) => void;
  isMovementModalOpen: boolean;
  setIsMovementModalOpen: (open: boolean) => void;
  movementTargetItem: InventoryItem | null;
  openStockMovementModal: (item: InventoryItem, defaultType?: TransactionType) => void;
  movementDefaultType: TransactionType;
  
  isPOModalOpen: boolean;
  setIsPOModalOpen: (open: boolean) => void;
  poTargetItem: InventoryItem | null;
  openPurchaseOrderModal: (item: InventoryItem) => void;

  isBarcodeModalOpen: boolean;
  setIsBarcodeModalOpen: (open: boolean) => void;
  barcodeTargetItem: InventoryItem | null;
  openBarcodeModal: (item: InventoryItem) => void;

  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
  isAddItemModalOpen: boolean;
  setIsAddItemModalOpen: (open: boolean) => void;

  // Core Stock Level Control Actions
  adjustStock: (
    itemId: string,
    type: TransactionType,
    quantity: number,
    reference: string,
    operator: string,
    notes?: string
  ) => void;
  
  addNewItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateItemThresholds: (
    itemId: string,
    minThreshold: number,
    criticalThreshold: number,
    targetStock: number
  ) => void;
  
  createPurchaseOrder: (itemId: string, quantity: number, notes?: string) => void;
  receivePurchaseOrder: (poId: string) => void;
  
  acknowledgeAlert: (alertId: string) => void;
  batchRestockAllLowStock: () => void;
  simulateRealTimeDeployment: () => void;
  toggleLiveSimulation: () => void;
  exportData: (format: 'json' | 'csv') => void;
  resetToDefaults: () => void;
  updateSettings: (newSettings: Partial<AlertEngineSettings>) => void;

  // Computed Summaries
  filteredItems: InventoryItem[];
  kpis: {
    totalSkus: number;
    totalStockInStorage: number;
    totalAllocated: number;
    totalInTransit: number;
    totalInventoryValuation: number;
    activeAlertsCount: number;
    criticalAlertsCount: number;
    warningAlertsCount: number;
    depletedAlertsCount: number;
    categoryCounts: Record<HardwareCategory, number>;
  };
}

const STORAGE_KEYS = {
  ITEMS: 'corepulse_inventory_items_v2',
  TRANSACTIONS: 'corepulse_inventory_tx_v2',
  POS: 'corepulse_inventory_pos_v2',
  SETTINGS: 'corepulse_inventory_settings_v2',
};

const DEFAULT_SETTINGS: AlertEngineSettings = {
  soundAlertsEnabled: true,
  autoReorderEnabled: false,
  notificationWebhook: 'https://hooks.slack.com/services/T00/B00/hardware-alerts',
  defaultEmailAlerts: true,
  leadTimeMultiplier: 1.2,
};

const InventoryEngineContext = createContext<InventoryEngineContextType | undefined>(undefined);

function calculateItemStatus(item: InventoryItem): StockStatus {
  if (item.currentStock <= 0) return 'out_of_stock';
  if (item.currentStock <= item.criticalThreshold) return 'critical';
  if (item.currentStock <= item.minThreshold) return 'low';
  return 'optimal';
}

export const InventoryEngineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State from LocalStorage
  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_HARDWARE_ITEMS;
  });

  const [transactions, setTransactions] = useState<StockTransaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    // Seed initial transactions
    return [
      {
        id: 'tx-init-01',
        itemId: 'cmp-001',
        itemSku: 'CMP-MBP16-M3M',
        itemName: 'Apple MacBook Pro 16" (M3 Max, 64GB, 1TB SSD)',
        category: 'computer',
        type: 'deploy',
        quantity: -4,
        previousStock: 7,
        newStock: 3,
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        operator: 'Sarah Jenkins (IT Lead)',
        reference: 'TICKET-ENG-4910',
        notes: 'Dispatched 4 units for Senior AI Research new hires batch',
      },
      {
        id: 'tx-init-02',
        itemId: 'srv-001',
        itemSku: 'SRV-R760-2U',
        itemName: 'Dell PowerEdge R760 2U Dual Xeon Platinum Server',
        category: 'server',
        type: 'deploy',
        quantity: -2,
        previousStock: 3,
        newStock: 1,
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        operator: 'Marcus Vance (Infra Ops)',
        reference: 'DC-RACK-USW-04',
        notes: 'Racked into Cluster Hall 3 Cage B',
      },
      {
        id: 'tx-init-03',
        itemId: 'mbl-001',
        itemSku: 'MBL-IP16P-256',
        itemName: 'Apple iPhone 16 Pro (256GB Natural Titanium)',
        category: 'mobile',
        type: 'deploy',
        quantity: -5,
        previousStock: 9,
        newStock: 4,
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        operator: 'David Zhang (Hardware Dispatch)',
        reference: 'TICKET-MOB-1102',
        notes: 'Issued to Executive Travel Contingent',
      },
    ];
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.POS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [
      {
        id: 'po-001',
        poNumber: 'PO-2026-8841',
        itemId: 'srv-001',
        itemSku: 'SRV-R760-2U',
        itemName: 'Dell PowerEdge R760 2U Dual Xeon Platinum Server',
        supplierName: 'Dell Enterprise Infrastructure Direct',
        quantity: 4,
        unitCost: 14250,
        totalCost: 57000,
        status: 'submitted',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        expectedDelivery: new Date(Date.now() + 86400000 * 6).toISOString(),
        notes: 'Priority air courier. DC expansion requisition.',
      },
      {
        id: 'po-002',
        poNumber: 'PO-2026-8842',
        itemId: 'cmp-001',
        itemSku: 'CMP-MBP16-M3M',
        itemName: 'Apple MacBook Pro 16" (M3 Max, 64GB, 1TB SSD)',
        supplierName: 'Apple Enterprise Direct',
        quantity: 10,
        unitCost: 3499,
        totalCost: 34990,
        status: 'submitted',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        expectedDelivery: new Date(Date.now() + 86400000 * 3).toISOString(),
        notes: 'Quarterly developer laptop replenishment.',
      },
    ];
  });

  const [settings, setSettings] = useState<AlertEngineSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  // UI state
  const [activeCategory, setActiveCategory] = useState<HardwareCategory | 'all'>('all');
  const [activeStatus, setActiveStatus] = useState<StockStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);

  // Modals & Drawers
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<InventoryItem | null>(null);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementTargetItem, setMovementTargetItem] = useState<InventoryItem | null>(null);
  const [movementDefaultType, setMovementDefaultType] = useState<TransactionType>('deploy');
  
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [poTargetItem, setPoTargetItem] = useState<InventoryItem | null>(null);

  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [barcodeTargetItem, setBarcodeTargetItem] = useState<InventoryItem | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  // Persist state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed saving items to localStorage', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.warn('Failed saving transactions to localStorage', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.POS, JSON.stringify(purchaseOrders));
    } catch (e) {
      console.warn('Failed saving POs to localStorage', e);
    }
  }, [purchaseOrders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed saving settings to localStorage', e);
    }
  }, [settings]);

  // 2. Automated Alerts Engine
  // Computes active alerts whenever items or purchaseOrders change
  const alerts: StockAlert[] = useMemo(() => {
    const list: StockAlert[] = [];

    for (const item of items) {
      const hasActivePO = purchaseOrders.some(
        (po) => po.itemId === item.id && po.status === 'submitted'
      );

      if (item.currentStock <= 0) {
        list.push({
          id: `alert-${item.id}-depleted`,
          itemId: item.id,
          itemSku: item.sku,
          itemName: item.name,
          category: item.category,
          severity: 'depleted',
          message: `CRITICAL DEPLETION: Zero units available in inventory!`,
          currentStock: item.currentStock,
          threshold: item.minThreshold,
          suggestedReorder: Math.max(item.targetStock - item.currentStock - item.inTransitStock, 1),
          createdAt: new Date().toISOString(),
          acknowledged: false,
          status: hasActivePO ? 'po_created' : 'active',
        });
      } else if (item.currentStock <= item.criticalThreshold) {
        list.push({
          id: `alert-${item.id}-crit`,
          itemId: item.id,
          itemSku: item.sku,
          itemName: item.name,
          category: item.category,
          severity: 'critical',
          message: `EMERGENCY BUFFER BREACH: Stock (${item.currentStock}) has dropped below critical minimum (${item.criticalThreshold} units)!`,
          currentStock: item.currentStock,
          threshold: item.criticalThreshold,
          suggestedReorder: Math.max(item.targetStock - item.currentStock - item.inTransitStock, 1),
          createdAt: new Date().toISOString(),
          acknowledged: false,
          status: hasActivePO ? 'po_created' : 'active',
        });
      } else if (item.currentStock <= item.minThreshold) {
        list.push({
          id: `alert-${item.id}-warn`,
          itemId: item.id,
          itemSku: item.sku,
          itemName: item.name,
          category: item.category,
          severity: 'warning',
          message: `LOW STOCK ADVISORY: Stock (${item.currentStock}) reached safety threshold (${item.minThreshold} units). Reorder recommended.`,
          currentStock: item.currentStock,
          threshold: item.minThreshold,
          suggestedReorder: Math.max(item.targetStock - item.currentStock - item.inTransitStock, 1),
          createdAt: new Date().toISOString(),
          acknowledged: false,
          status: hasActivePO ? 'po_created' : 'active',
        });
      }
    }

    return list;
  }, [items, purchaseOrders]);

  // Open Movement Modal helper
  const openStockMovementModal = useCallback((item: InventoryItem, defaultType: TransactionType = 'deploy') => {
    setMovementTargetItem(item);
    setMovementDefaultType(defaultType);
    setIsMovementModalOpen(true);
  }, []);

  // Open PO Modal helper
  const openPurchaseOrderModal = useCallback((item: InventoryItem) => {
    setPoTargetItem(item);
    setIsPOModalOpen(true);
  }, []);

  // Open Barcode Modal helper
  const openBarcodeModal = useCallback((item: InventoryItem) => {
    setBarcodeTargetItem(item);
    setIsBarcodeModalOpen(true);
  }, []);

  // 3. Core Stock Level Control Engine
  const adjustStock = useCallback(
    (
      itemId: string,
      type: TransactionType,
      quantity: number,
      reference: string,
      operator: string,
      notes?: string
    ) => {
      setItems((prevItems) => {
        const index = prevItems.findIndex((i) => i.id === itemId);
        if (index === -1) return prevItems;

        const currentItem = prevItems[index];
        const prevStock = currentItem.currentStock;
        let newStock = prevStock;
        let newAllocated = currentItem.allocatedStock;

        if (type === 'deploy') {
          const qty = Math.abs(quantity);
          newStock = Math.max(0, prevStock - qty);
          newAllocated += (prevStock - newStock);
        } else if (type === 'restock') {
          const qty = Math.abs(quantity);
          newStock = prevStock + qty;
        } else if (type === 'return') {
          const qty = Math.abs(quantity);
          newStock = prevStock + qty;
          newAllocated = Math.max(0, newAllocated - qty);
        } else if (type === 'audit_adjustment') {
          newStock = Math.max(0, quantity);
        } else if (type === 'decommission') {
          const qty = Math.abs(quantity);
          newStock = Math.max(0, prevStock - qty);
        }

        const updatedItem: InventoryItem = {
          ...currentItem,
          currentStock: newStock,
          allocatedStock: newAllocated,
          lastRestockedAt:
            type === 'restock' || type === 'return'
              ? new Date().toISOString()
              : currentItem.lastRestockedAt,
        };

        const updatedList = [...prevItems];
        updatedList[index] = updatedItem;

        // Log transaction
        const tx: StockTransaction = {
          id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          itemId: currentItem.id,
          itemSku: currentItem.sku,
          itemName: currentItem.name,
          category: currentItem.category,
          type,
          quantity: type === 'deploy' || type === 'decommission' ? -Math.abs(quantity) : Math.abs(quantity),
          previousStock: prevStock,
          newStock,
          timestamp: new Date().toISOString(),
          operator: operator || 'Hardware System Operator',
          reference: reference || 'MANUAL-ENTRY',
          notes: notes || '',
        };

        setTransactions((prevTx) => [tx, ...prevTx]);

        // Automated Alert Sound & Trigger Check
        if (settings.soundAlertsEnabled) {
          if (newStock <= currentItem.criticalThreshold && prevStock > currentItem.criticalThreshold) {
            playAlertChime('critical');
          } else if (newStock <= currentItem.minThreshold && prevStock > currentItem.minThreshold) {
            playAlertChime('warning');
          } else if (type === 'restock') {
            playSuccessChime();
          }
        }

        // Keep selectedItemForDetail in sync if currently viewing
        if (selectedItemForDetail && selectedItemForDetail.id === itemId) {
          setSelectedItemForDetail(updatedItem);
        }

        return updatedList;
      });
    },
    [selectedItemForDetail, settings.soundAlertsEnabled]
  );

  // Add New Hardware Item
  const addNewItem = useCallback((itemData: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `hw-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    };
    setItems((prev) => [newItem, ...prev]);

    // Log initial stock creation transaction
    const tx: StockTransaction = {
      id: `tx-init-${Date.now()}`,
      itemId: newItem.id,
      itemSku: newItem.sku,
      itemName: newItem.name,
      category: newItem.category,
      type: 'restock',
      quantity: newItem.currentStock,
      previousStock: 0,
      newStock: newItem.currentStock,
      timestamp: new Date().toISOString(),
      operator: 'Catalog Administrator',
      reference: 'ITEM-REGISTRATION',
      notes: 'Initial inventory catalog intake',
    };
    setTransactions((prev) => [tx, ...prev]);
    if (settings.soundAlertsEnabled) {
      playSuccessChime();
    }
  }, [settings.soundAlertsEnabled]);

  // Update item thresholds
  const updateItemThresholds = useCallback((
    itemId: string,
    minThreshold: number,
    criticalThreshold: number,
    targetStock: number
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            minThreshold,
            criticalThreshold,
            targetStock,
          };
        }
        return item;
      })
    );
  }, []);

  // Create Purchase Order
  const createPurchaseOrder = useCallback(
    (itemId: string, quantity: number, notes?: string) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const totalCost = quantity * item.unitCost;
      const leadTime = item.supplier?.leadTimeDays || 5;
      const expectedDelivery = new Date(Date.now() + leadTime * 86400000).toISOString();

      const newPo: PurchaseOrder = {
        id: `po-${Date.now()}`,
        poNumber,
        itemId: item.id,
        itemSku: item.sku,
        itemName: item.name,
        supplierName: item.supplier.name,
        quantity,
        unitCost: item.unitCost,
        totalCost,
        status: 'submitted',
        createdAt: new Date().toISOString(),
        expectedDelivery,
        notes: notes || 'Automated stock replenishment requisition generated by alert trigger.',
      };

      setPurchaseOrders((prev) => [newPo, ...prev]);

      // Update inTransitStock on the item
      setItems((prev) =>
        prev.map((i) => {
          if (i.id === itemId) {
            return {
              ...i,
              inTransitStock: i.inTransitStock + quantity,
            };
          }
          return i;
        })
      );

      // Log purchase order creation
      const tx: StockTransaction = {
        id: `tx-po-${Date.now()}`,
        itemId: item.id,
        itemSku: item.sku,
        itemName: item.name,
        category: item.category,
        type: 'restock',
        quantity: 0,
        previousStock: item.currentStock,
        newStock: item.currentStock,
        timestamp: new Date().toISOString(),
        operator: 'Automated Procurement Dispatcher',
        reference: poNumber,
        notes: `PO Requisition created for ${quantity} units (Est. Delivery: ${new Date(expectedDelivery).toLocaleDateString()})`,
      };
      setTransactions((prev) => [tx, ...prev]);

      if (settings.soundAlertsEnabled) {
        playSuccessChime();
      }
    },
    [items, settings.soundAlertsEnabled]
  );

  // Receive Purchase Order
  const receivePurchaseOrder = useCallback(
    (poId: string) => {
      const po = purchaseOrders.find((p) => p.id === poId);
      if (!po || po.status === 'received') return;

      // Update PO status
      setPurchaseOrders((prev) =>
        prev.map((p) => (p.id === poId ? { ...p, status: 'received' } : p))
      );

      // Add to currentStock and deduct from inTransitStock
      setItems((prev) =>
        prev.map((i) => {
          if (i.id === po.itemId) {
            return {
              ...i,
              currentStock: i.currentStock + po.quantity,
              inTransitStock: Math.max(0, i.inTransitStock - po.quantity),
              lastRestockedAt: new Date().toISOString(),
            };
          }
          return i;
        })
      );

      // Log transaction
      const tx: StockTransaction = {
        id: `tx-recv-${Date.now()}`,
        itemId: po.itemId,
        itemSku: po.itemSku,
        itemName: po.itemName,
        category: items.find((i) => i.id === po.itemId)?.category || 'server',
        type: 'restock',
        quantity: po.quantity,
        previousStock: items.find((i) => i.id === po.itemId)?.currentStock || 0,
        newStock: (items.find((i) => i.id === po.itemId)?.currentStock || 0) + po.quantity,
        timestamp: new Date().toISOString(),
        operator: 'Receiving Dock Logistics',
        reference: po.poNumber,
        notes: `PO ${po.poNumber} fulfilled and received into storage.`,
      };
      setTransactions((prev) => [tx, ...prev]);

      if (settings.soundAlertsEnabled) {
        playSuccessChime();
      }
    },
    [purchaseOrders, items, settings.soundAlertsEnabled]
  );

  // Acknowledge Alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    // In our computed alerts, we can set local acknowledged list if needed
  }, []);

  // Batch Restock All Low Stock Items in 1-Click
  const batchRestockAllLowStock = useCallback(() => {
    const lowStockItems = items.filter(
      (i) => i.currentStock <= i.minThreshold
    );

    if (lowStockItems.length === 0) return;

    setItems((prev) =>
      prev.map((item) => {
        if (item.currentStock <= item.minThreshold) {
          const replenishmentQty = Math.max(item.targetStock - item.currentStock, 5);
          return {
            ...item,
            currentStock: item.targetStock,
            inTransitStock: 0,
            lastRestockedAt: new Date().toISOString(),
          };
        }
        return item;
      })
    );

    // Record bulk transaction
    const tx: StockTransaction = {
      id: `tx-batch-${Date.now()}`,
      itemId: 'batch-all',
      itemSku: 'BATCH-RESTOCK',
      itemName: `Bulk Par Restock (${lowStockItems.length} SKUs replenished)`,
      category: 'server',
      type: 'restock',
      quantity: lowStockItems.reduce((acc, i) => acc + (i.targetStock - i.currentStock), 0),
      previousStock: 0,
      newStock: 0,
      timestamp: new Date().toISOString(),
      operator: 'Automated Replenishment Engine',
      reference: `BATCH-REQ-${Date.now().toString().slice(-4)}`,
      notes: `Restocked ${lowStockItems.map((i) => i.sku).join(', ')} to target par levels.`,
    };
    setTransactions((prev) => [tx, ...prev]);

    if (settings.soundAlertsEnabled) {
      playSuccessChime();
    }
  }, [items, settings.soundAlertsEnabled]);

  // Simulate a realistic live hardware deployment
  const simulateRealTimeDeployment = useCallback(() => {
    // Find an item that has stock
    const availableItems = items.filter((i) => i.currentStock > 0);
    if (availableItems.length === 0) return;

    // Pick random item
    const target = availableItems[Math.floor(Math.random() * availableItems.length)];
    const deployQty = Math.min(target.currentStock, Math.floor(Math.random() * 2) + 1);

    const operators = [
      'Alex Mercer (DevOps Lead)',
      'Elena Rostov (Mobile QA)',
      'Chen Wei (IT Provisioning)',
      'Maya Lin (Datacenter Tech)',
      'Kareem Abdul (SecOps Engineer)',
    ];
    const ticketRefs = [
      `TICKET-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
      `REQ-EXPANSION-${Math.floor(100 + Math.random() * 900)}`,
      `PROVISION-${Math.floor(5000 + Math.random() * 5000)}`,
    ];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    const reference = ticketRefs[Math.floor(Math.random() * ticketRefs.length)];

    adjustStock(
      target.id,
      'deploy',
      deployQty,
      reference,
      operator,
      `Simulated real-time hardware requisition for operational workload`
    );
  }, [items, adjustStock]);

  // Live simulation tick timer
  useEffect(() => {
    if (!isSimulationRunning) return;

    const timer = setInterval(() => {
      simulateRealTimeDeployment();
    }, 6000);

    return () => clearInterval(timer);
  }, [isSimulationRunning, simulateRealTimeDeployment]);

  const toggleLiveSimulation = useCallback(() => {
    setIsSimulationRunning((prev) => !prev);
  }, []);

  // Export inventory to JSON or CSV
  const exportData = useCallback(
    (format: 'json' | 'csv') => {
      if (format === 'json') {
        const data = {
          exportedAt: new Date().toISOString(),
          inventory: items,
          transactions,
          alerts,
          purchaseOrders,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `corepulse-inventory-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // CSV format
        const headers = [
          'SKU',
          'Name',
          'Category',
          'Brand',
          'Current Stock',
          'Allocated Stock',
          'In Transit',
          'Min Safety Threshold',
          'Critical Threshold',
          'Target Stock',
          'Unit Cost (USD)',
          'Total Valuation',
          'Status',
          'Facility',
          'Zone',
          'Bin / Rack',
        ];
        const rows = items.map((i) => [
          `"${i.sku}"`,
          `"${i.name.replace(/"/g, '""')}"`,
          i.category,
          `"${i.brand}"`,
          i.currentStock,
          i.allocatedStock,
          i.inTransitStock,
          i.minThreshold,
          i.criticalThreshold,
          i.targetStock,
          i.unitCost,
          i.currentStock * i.unitCost,
          calculateItemStatus(i),
          `"${i.location.facility}"`,
          `"${i.location.zone}"`,
          `"${i.location.binOrRack}"`,
        ]);
        const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `corepulse-inventory-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    },
    [items, transactions, alerts, purchaseOrders]
  );

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.ITEMS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.POS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    setItems(INITIAL_HARDWARE_ITEMS);
    setSettings(DEFAULT_SETTINGS);
    setIsSimulationRunning(false);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AlertEngineSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      // Status filter
      if (activeStatus !== 'all') {
        const status = calculateItemStatus(item);
        if (status !== activeStatus) return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchSku = item.sku.toLowerCase().includes(q);
        const matchName = item.name.toLowerCase().includes(q);
        const matchBrand = item.brand.toLowerCase().includes(q);
        const matchModel = item.modelNumber.toLowerCase().includes(q);
        const matchFacility = item.location.facility.toLowerCase().includes(q);
        const matchRack = item.location.binOrRack.toLowerCase().includes(q);
        const matchTags = item.assetTags.some((t) => t.toLowerCase().includes(q));
        if (!matchSku && !matchName && !matchBrand && !matchModel && !matchFacility && !matchRack && !matchTags) {
          return false;
        }
      }
      return true;
    });
  }, [items, activeCategory, activeStatus, searchQuery]);

  // Compute KPIs
  const kpis = useMemo(() => {
    let totalStockInStorage = 0;
    let totalAllocated = 0;
    let totalInTransit = 0;
    let totalInventoryValuation = 0;

    const categoryCounts: Record<HardwareCategory, number> = {
      mobile: 0,
      computer: 0,
      tablet: 0,
      server: 0,
    };

    items.forEach((item) => {
      totalStockInStorage += item.currentStock;
      totalAllocated += item.allocatedStock;
      totalInTransit += item.inTransitStock;
      totalInventoryValuation += item.currentStock * item.unitCost;
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    const criticalAlertsCount = alerts.filter((a) => a.severity === 'critical').length;
    const warningAlertsCount = alerts.filter((a) => a.severity === 'warning').length;
    const depletedAlertsCount = alerts.filter((a) => a.severity === 'depleted').length;

    return {
      totalSkus: items.length,
      totalStockInStorage,
      totalAllocated,
      totalInTransit,
      totalInventoryValuation,
      activeAlertsCount: alerts.length,
      criticalAlertsCount,
      warningAlertsCount,
      depletedAlertsCount,
      categoryCounts,
    };
  }, [items, alerts]);

  return (
    <InventoryEngineContext.Provider
      value={{
        items,
        transactions,
        alerts,
        purchaseOrders,
        settings,
        isSimulationRunning,
        activeCategory,
        setActiveCategory,
        activeStatus,
        setActiveStatus,
        searchQuery,
        setSearchQuery,
        selectedItemForDetail,
        setSelectedItemForDetail,
        isAlertsDrawerOpen,
        setIsAlertsDrawerOpen,
        isAuditTrailOpen,
        setIsAuditTrailOpen,
        isMovementModalOpen,
        setIsMovementModalOpen,
        movementTargetItem,
        openStockMovementModal,
        movementDefaultType,
        isPOModalOpen,
        setIsPOModalOpen,
        poTargetItem,
        openPurchaseOrderModal,
        isBarcodeModalOpen,
        setIsBarcodeModalOpen,
        barcodeTargetItem,
        openBarcodeModal,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        isAddItemModalOpen,
        setIsAddItemModalOpen,
        adjustStock,
        addNewItem,
        updateItemThresholds,
        createPurchaseOrder,
        receivePurchaseOrder,
        acknowledgeAlert,
        batchRestockAllLowStock,
        simulateRealTimeDeployment,
        toggleLiveSimulation,
        exportData,
        resetToDefaults,
        updateSettings,
        filteredItems,
        kpis,
      }}
    >
      {children}
    </InventoryEngineContext.Provider>
  );
};

export function useInventoryEngine(): InventoryEngineContextType {
  const context = useContext(InventoryEngineContext);
  if (!context) {
    throw new Error('useInventoryEngine must be used within an InventoryEngineProvider');
  }
  return context;
}
