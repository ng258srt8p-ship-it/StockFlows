export interface SKUItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  supplier: string;
  onHand: number;
  reserved: number;
  available: number;
  minStock: number;
  maxStock: number;
  dailyVelocity: number;
  leadTimeDays: number;
  barcode: string;
}

export interface TransferDoc {
  id: string;
  type: "TRF" | "REC" | "DEL" | "ADJ";
  origin: string;
  destination: string;
  itemsCount: number;
  status: "Draft" | "Waiting" | "Ready" | "Done";
  createdAt: string;
}

export interface Toast {
  id: number;
  message: string;
  type: "success" | "info";
}

export const INITIAL_SKUS: SKUItem[] = [
  { id: "1", name: "Premium Wool Knit Sweater", sku: "SWE-WOL-001", category: "Apparel", supplier: "Apex Loom Textiles", onHand: 142, reserved: 18, available: 124, minStock: 150, maxStock: 400, dailyVelocity: 8.4, leadTimeDays: 14, barcode: "400129481" },
  { id: "2", name: "Classic Indigo Denim Jeans", sku: "DEN-IND-002", category: "Apparel", supplier: "Denim Craft Co.", onHand: 84, reserved: 12, available: 72, minStock: 100, maxStock: 300, dailyVelocity: 5.1, leadTimeDays: 10, barcode: "400129482" },
  { id: "3", name: "Waterproof Shell Jacket", sku: "JKT-WPR-003", category: "Outerwear", supplier: "Apex Loom Textiles", onHand: 28, reserved: 4, available: 24, minStock: 60, maxStock: 150, dailyVelocity: 3.8, leadTimeDays: 21, barcode: "400129483" },
  { id: "4", name: "Activewear Breathable Tee", sku: "TEE-ACT-004", category: "Apparel", supplier: "Denim Craft Co.", onHand: 310, reserved: 45, available: 265, minStock: 200, maxStock: 600, dailyVelocity: 14.2, leadTimeDays: 7, barcode: "400129484" },
  { id: "5", name: "Minimalist Leather Boots", sku: "BTS-LTH-005", category: "Footwear", supplier: "Heritage Leatherworks", onHand: 19, reserved: 3, available: 16, minStock: 30, maxStock: 80, dailyVelocity: 1.9, leadTimeDays: 25, barcode: "400129485" },
];

export const INITIAL_TRANSFERS: TransferDoc[] = [
  { id: "TRF-0012", type: "TRF", origin: "Main Distribution Center", destination: "Downtown Storefront", itemsCount: 45, status: "Done", createdAt: "2026-03-01 14:32" },
  { id: "REC-0098", type: "REC", origin: "Apex Loom Supplier", destination: "Main Distribution Center", itemsCount: 120, status: "Ready", createdAt: "2026-03-03 09:15" },
  { id: "TRF-0014", type: "TRF", origin: "Main Distribution Center", destination: "Westside Hub", itemsCount: 30, status: "Waiting", createdAt: "2026-03-04 11:00" },
  { id: "ADJ-0045", type: "ADJ", origin: "Downtown Storefront", destination: "Audit Adjustment", itemsCount: 4, status: "Draft", createdAt: "2026-03-04 16:45" },
];

export type DemoView = "landing" | "demo";
export type DemoTab = "dashboard" | "transfers" | "replenishment" | "stocky" | "barcode";
export type TransferType = "TRF" | "REC" | "DEL" | "ADJ";
export type TransferStatus = "Draft" | "Waiting" | "Ready" | "Done";
export type MigrationStatus = "idle" | "importing" | "success";
