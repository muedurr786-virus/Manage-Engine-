export type HardwareCategory = 'mobile' | 'computer' | 'tablet' | 'server';

export type StockStatus = 'optimal' | 'low' | 'critical' | 'out_of_stock';

export type AlertSeverity = 'critical' | 'warning' | 'depleted';

export interface HardwareLocation {
  facility: string; // e.g. "Main DC East", "HQ Tech Hub", "SF Depot"
  zone: string;     // e.g. "Cage B", "Row 4", "Secured Vault"
  binOrRack: string;// e.g. "Rack R18-U22", "Shelf M-03"
}

export interface HardwareSpecs {
  processor?: string;
  ram?: string;
  storage?: string;
  displayOrFormFactor?: string;
  operatingSystem?: string;
  networkOrPorts?: string;
  powerRating?: string;
}

export interface SupplierInfo {
  name: string;
  contactEmail: string;
  leadTimeDays: number;
  contractTier: 'Tier 1 Prime' | 'Direct OEM' | 'Enterprise Reseller';
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: HardwareCategory;
  modelNumber: string;
  currentStock: number;       // Available unallocated in warehouse/depot
  allocatedStock: number;     // Currently deployed in production/staff
  inTransitStock: number;     // Currently ordered / inbound from supplier
  minThreshold: number;       // Safety buffer threshold (triggers Warning alert)
  criticalThreshold: number;  // Emergency threshold (triggers Critical alert)
  targetStock: number;        // Par replenishment capacity
  unitCost: number;           // Unit acquisition cost in USD
  location: HardwareLocation;
  specifications: HardwareSpecs;
  assetTags: string[];        // Serial numbers or RFID tags
  supplier: SupplierInfo;
  lastRestockedAt: string;
  burnRatePerWeek: number;    // Average weekly deployment rate
}

export type TransactionType = 'restock' | 'deploy' | 'return' | 'audit_adjustment' | 'decommission';

export interface StockTransaction {
  id: string;
  itemId: string;
  itemSku: string;
  itemName: string;
  category: HardwareCategory;
  type: TransactionType;
  quantity: number; // positive for restock/return, negative for deploy/decommission
  previousStock: number;
  newStock: number;
  timestamp: string;
  operator: string;
  reference: string; // e.g. "TICKET-7821", "PO-9942", "RACK-DC1-U12", "EMP-410"
  notes?: string;
}

export interface StockAlert {
  id: string;
  itemId: string;
  itemSku: string;
  itemName: string;
  category: HardwareCategory;
  severity: AlertSeverity;
  message: string;
  currentStock: number;
  threshold: number;
  suggestedReorder: number;
  createdAt: string;
  acknowledged: boolean;
  status: 'active' | 'po_created' | 'resolved';
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  itemId: string;
  itemSku: string;
  itemName: string;
  supplierName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  status: 'submitted' | 'received';
  createdAt: string;
  expectedDelivery: string;
  notes: string;
}

export interface AlertEngineSettings {
  soundAlertsEnabled: boolean;
  autoReorderEnabled: boolean;
  notificationWebhook: string;
  defaultEmailAlerts: boolean;
  leadTimeMultiplier: number;
}
