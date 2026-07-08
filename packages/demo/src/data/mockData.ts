// Mock Inventory Data (50+ SKUs)
export const mockInventory = [
  // === Electronics (10 SKUs) ===
  { id: '1', sku: 'ELEC-BT-001', title: 'Wireless Bluetooth Earbuds (Black)', quantity: 0, reorderPoint: 20, costPerUnit: 24.99, location: 'Warehouse A', velocity: 'high' as const, category: 'Electronics', vendor: 'TechGear Direct' },
  { id: '2', sku: 'ELEC-CH-002', title: 'USB-C Fast Charger 65W', quantity: 12, reorderPoint: 15, costPerUnit: 18.50, location: 'Warehouse B', velocity: 'medium' as const, category: 'Electronics', vendor: 'TechGear Direct' },
  { id: '3', sku: 'ELEC-SB-003', title: 'Portable Bluetooth Speaker', quantity: 156, reorderPoint: 30, costPerUnit: 32.00, location: 'Warehouse A', velocity: 'high' as const, category: 'Electronics', vendor: 'AudioMax Supply' },
  { id: '4', sku: 'ELEC-MO-004', title: 'Wireless Mouse (Ergonomic)', quantity: 89, reorderPoint: 25, costPerUnit: 15.99, location: 'Warehouse A', velocity: 'medium' as const, category: 'Electronics', vendor: 'TechGear Direct' },
  { id: '5', sku: 'ELEC-KB-005', title: 'Mechanical Keyboard RGB', quantity: 3, reorderPoint: 10, costPerUnit: 45.00, location: 'Warehouse B', velocity: 'medium' as const, category: 'Electronics', vendor: 'TechGear Direct' },
  { id: '6', sku: 'ELEC-HD-006', title: 'Noise Cancelling Headphones', quantity: 234, reorderPoint: 50, costPerUnit: 89.99, location: 'Warehouse A', velocity: 'low' as const, category: 'Electronics', vendor: 'AudioMax Supply' },
  { id: '7', sku: 'ELEC-PB-007', title: 'Power Bank 20000mAh', quantity: 67, reorderPoint: 40, costPerUnit: 19.99, location: 'Warehouse A', velocity: 'medium' as const, category: 'Electronics', vendor: 'TechGear Direct' },
  { id: '8', sku: 'ELEC-CB-008', title: 'USB-C Hub 7-in-1', quantity: 12, reorderPoint: 15, costPerUnit: 34.99, location: 'Warehouse B', velocity: 'high' as const, category: 'Electronics', vendor: 'TechGear Direct' },
  { id: '9', sku: 'ELEC-WA-009', title: 'Smart Watch Band (Silicone)', quantity: 34, reorderPoint: 15, costPerUnit: 8.99, location: 'Warehouse A', velocity: 'medium' as const, category: 'Electronics', vendor: 'AccessoryHub' },
  { id: '10', sku: 'ELEC-CA-010', title: 'Webcam HD 1080p', quantity: 78, reorderPoint: 20, costPerUnit: 29.99, location: 'Warehouse A', velocity: 'low' as const, category: 'Electronics', vendor: 'TechGear Direct' },

  // === Clothing & Apparel (10 SKUs) ===
  { id: '11', sku: 'CLT-TEE-011', title: 'Classic Cotton Tee (White)', quantity: 312, reorderPoint: 60, costPerUnit: 8.50, location: 'Warehouse A', velocity: 'high' as const, category: 'Clothing', vendor: 'FabricFirst Co' },
  { id: '12', sku: 'CLT-JEAN-012', title: 'Slim Fit Denim Jeans', quantity: 45, reorderPoint: 20, costPerUnit: 22.00, location: 'Warehouse B', velocity: 'medium' as const, category: 'Clothing', vendor: 'FabricFirst Co' },
  { id: '13', sku: 'CLT-HOOD-013', title: 'Zip-Up Hoodie (Navy)', quantity: 156, reorderPoint: 30, costPerUnit: 32.00, location: 'Warehouse A', velocity: 'high' as const, category: 'Clothing', vendor: 'FabricFirst Co' },
  { id: '14', sku: 'CLT-CAP-014', title: 'Snapback Cap (Black)', quantity: 234, reorderPoint: 50, costPerUnit: 6.99, location: 'Warehouse A', velocity: 'low' as const, category: 'Clothing', vendor: 'AccessoryHub' },
  { id: '15', sku: 'CLT-SOCK-015', title: 'Athletic Crew Socks (3-Pack)', quantity: 456, reorderPoint: 100, costPerUnit: 4.50, location: 'Warehouse B', velocity: 'high' as const, category: 'Clothing', vendor: 'FabricFirst Co' },
  { id: '16', sku: 'CLT-JACK-016', title: 'Lightweight Windbreaker', quantity: 28, reorderPoint: 15, costPerUnit: 38.00, location: 'Warehouse A', velocity: 'medium' as const, category: 'Clothing', vendor: 'FabricFirst Co' },
  { id: '17', sku: 'CLT-SHO-017', title: 'Running Shorts (Black)', quantity: 189, reorderPoint: 40, costPerUnit: 14.00, location: 'Warehouse A', velocity: 'high' as const, category: 'Clothing', vendor: 'FabricFirst Co' },
  { id: '18', sku: 'CLT-BELT-018', title: 'Leather Belt (Brown)', quantity: 67, reorderPoint: 20, costPerUnit: 12.00, location: 'Warehouse B', velocity: 'low' as const, category: 'Clothing', vendor: 'AccessoryHub' },
  { id: '19', sku: 'CLT-GLOVE-019', title: 'Touchscreen Gloves (Winter)', quantity: 0, reorderPoint: 25, costPerUnit: 9.99, location: 'Warehouse A', velocity: 'medium' as const, category: 'Clothing', vendor: 'AccessoryHub' },
  { id: '20', sku: 'CLT-VEST-020', title: 'Puffer Vest (Olive)', quantity: 42, reorderPoint: 15, costPerUnit: 28.00, location: 'Warehouse B', velocity: 'medium' as const, category: 'Clothing', vendor: 'FabricFirst Co' },

  // === Footwear (8 SKUs) ===
  { id: '21', sku: 'FW-SNK-021', title: 'Aero Run Sneakers (White)', quantity: 45, reorderPoint: 25, costPerUnit: 42.00, location: 'Warehouse B', velocity: 'high' as const, category: 'Footwear', vendor: 'Global Footwear Inc' },
  { id: '22', sku: 'FW-BTS-022', title: 'Classic Chelsea Boots', quantity: 18, reorderPoint: 10, costPerUnit: 55.00, location: 'Warehouse A', velocity: 'medium' as const, category: 'Footwear', vendor: 'Global Footwear Inc' },
  { id: '23', sku: 'FW-SDL-023', title: 'Trail Running Sandals', quantity: 89, reorderPoint: 20, costPerUnit: 28.00, location: 'Warehouse A', velocity: 'medium' as const, category: 'Footwear', vendor: 'Global Footwear Inc' },
  { id: '24', sku: 'FW-CSL-024', title: 'Canvas Slip-Ons (Grey)', quantity: 156, reorderPoint: 30, costPerUnit: 18.00, location: 'Warehouse B', velocity: 'high' as const, category: 'Footwear', vendor: 'Global Footwear Inc' },
  { id: '25', sku: 'FW-HIK-025', title: 'Waterproof Hiking Boots', quantity: 8, reorderPoint: 12, costPerUnit: 68.00, location: 'Warehouse A', velocity: 'medium' as const, category: 'Footwear', vendor: 'Mountain Gear Supply' },
  { id: '26', sku: 'FW-FLP-026', title: 'Beach Flip Flops (Blue)', quantity: 278, reorderPoint: 60, costPerUnit: 5.50, location: 'Warehouse B', velocity: 'low' as const, category: 'Footwear', vendor: 'Global Footwear Inc' },
  { id: '27', sku: 'FW-LOG-027', title: 'Work Safety Boots', quantity: 34, reorderPoint: 10, costPerUnit: 72.00, location: 'Warehouse A', velocity: 'low' as const, category: 'Footwear', vendor: 'Mountain Gear Supply' },
  { id: '28', sku: 'FW-CAS-028', title: 'Canvas High-Tops (Red)', quantity: 62, reorderPoint: 20, costPerUnit: 22.00, location: 'Warehouse B', velocity: 'medium' as const, category: 'Footwear', vendor: 'Global Footwear Inc' },

  // === Food & Beverage (10 SKUs) ===
  { id: '29', sku: 'FDB-PRO-029', title: 'Organic Protein Powder (Vanilla)', quantity: 23, reorderPoint: 30, costPerUnit: 28.99, location: 'Warehouse A', velocity: 'high' as const, category: 'Food & Beverage', vendor: 'FreshSupply Co' },
  { id: '30', sku: 'FDB-GRN-030', title: 'Green Superfood Mix', quantity: 67, reorderPoint: 20, costPerUnit: 34.50, location: 'Warehouse A', velocity: 'medium' as const, category: 'Food & Beverage', vendor: 'FreshSupply Co' },
  { id: '31', sku: 'FDB-NUT-031', title: 'Mixed Nuts Trail Pack', quantity: 345, reorderPoint: 80, costPerUnit: 6.99, location: 'Warehouse B', velocity: 'high' as const, category: 'Food & Beverage', vendor: 'SnackNation' },
  { id: '32', sku: 'FDB-CFF-032', title: 'Single Origin Coffee Beans 1kg', quantity: 89, reorderPoint: 25, costPerUnit: 18.00, location: 'Warehouse A', velocity: 'high' as const, category: 'Food & Beverage', vendor: 'FreshSupply Co' },
  { id: '33', sku: 'FDB-TEA-033', title: 'Earl Grey Loose Leaf Tea', quantity: 156, reorderPoint: 40, costPerUnit: 12.00, location: 'Warehouse A', velocity: 'medium' as const, category: 'Food & Beverage', vendor: 'FreshSupply Co' },
  { id: '34', sku: 'FDB-CHC-034', title: 'Dark Chocolate Bars (12-Pack)', quantity: 45, reorderPoint: 20, costPerUnit: 15.00, location: 'Warehouse B', velocity: 'medium' as const, category: 'Food & Beverage', vendor: 'SnackNation' },
  { id: '35', sku: 'FDB-BAR-035', title: 'Energy Bars (Mixed)', quantity: 512, reorderPoint: 100, costPerUnit: 2.50, location: 'Warehouse A', velocity: 'high' as const, category: 'Food & Beverage', vendor: 'SnackNation' },
  { id: '36', sku: 'FDB-WTR-036', title: 'Sparkling Water 12-Pack', quantity: 18, reorderPoint: 40, costPerUnit: 8.99, location: 'Warehouse B', velocity: 'high' as const, category: 'Food & Beverage', vendor: 'FreshSupply Co' },
  { id: '37', sku: 'FDB-OLA-037', title: 'Granola Oats 500g', quantity: 92, reorderPoint: 30, costPerUnit: 7.50, location: 'Warehouse A', velocity: 'medium' as const, category: 'Food & Beverage', vendor: 'SnackNation' },
  { id: '38', sku: 'FDB-JCE-038', title: 'Cold Pressed Orange Juice', quantity: 5, reorderPoint: 25, costPerUnit: 4.99, location: 'Warehouse B', velocity: 'high' as const, category: 'Food & Beverage', vendor: 'FreshSupply Co' },

  // === Home & Garden (8 SKUs) ===
  { id: '39', sku: 'HMG-PLT-039', title: 'Ceramic Plant Pot (Large)', quantity: 123, reorderPoint: 30, costPerUnit: 14.99, location: 'Warehouse A', velocity: 'medium' as const, category: 'Home & Garden', vendor: 'HomeStyle Supply' },
  { id: '40', sku: 'HMG-LMP-040', title: 'LED Desk Lamp (Matte Black)', quantity: 56, reorderPoint: 15, costPerUnit: 24.00, location: 'Warehouse B', velocity: 'medium' as const, category: 'Home & Garden', vendor: 'HomeStyle Supply' },
  { id: '41', sku: 'HMG-CAN-041', title: 'Scented Candle Set (3-Pack)', quantity: 234, reorderPoint: 50, costPerUnit: 12.00, location: 'Warehouse A', velocity: 'high' as const, category: 'Home & Garden', vendor: 'HomeStyle Supply' },
  { id: '42', sku: 'HMG-TOOL-042', title: 'Multi-Tool Garden Set', quantity: 15, reorderPoint: 10, costPerUnit: 35.00, location: 'Warehouse B', velocity: 'low' as const, category: 'Home & Garden', vendor: 'Mountain Gear Supply' },
  { id: '43', sku: 'HMG-SHELF-043', title: 'Floating Wall Shelf (Oak)', quantity: 38, reorderPoint: 12, costPerUnit: 18.00, location: 'Warehouse A', velocity: 'low' as const, category: 'Home & Garden', vendor: 'HomeStyle Supply' },
  { id: '44', sku: 'HMG-MAT-044', title: 'Non-Slip Yoga Mat', quantity: 167, reorderPoint: 40, costPerUnit: 16.00, location: 'Warehouse B', velocity: 'high' as const, category: 'Home & Garden', vendor: 'Mountain Gear Supply' },
  { id: '45', sku: 'HMG-BOTTLE-045', title: 'Insulated Water Bottle 32oz', quantity: 98, reorderPoint: 30, costPerUnit: 14.99, location: 'Warehouse A', velocity: 'medium' as const, category: 'Home & Garden', vendor: 'HomeStyle Supply' },
  { id: '46', sku: 'HMG-ROLLER-046', title: 'Foam Roller for Recovery', quantity: 72, reorderPoint: 20, costPerUnit: 18.00, location: 'Warehouse A', velocity: 'medium' as const, category: 'Home & Garden', vendor: 'Mountain Gear Supply' },

  // === Sports & Outdoors (8 SKUs) ===
  { id: '47', sku: 'SPT-BAG-047', title: 'Tactical Backpack 40L', quantity: 89, reorderPoint: 20, costPerUnit: 48.00, location: 'Warehouse A', velocity: 'high' as const, category: 'Sports & Outdoors', vendor: 'Mountain Gear Supply' },
  { id: '48', sku: 'SPT-YOGA-048', title: 'Premium Yoga Block Set', quantity: 145, reorderPoint: 35, costPerUnit: 9.99, location: 'Warehouse B', velocity: 'medium' as const, category: 'Sports & Outdoors', vendor: 'Mountain Gear Supply' },
  { id: '49', sku: 'SPT-FRAME-049', title: 'Adjustable Dumbbell Set', quantity: 12, reorderPoint: 8, costPerUnit: 85.00, location: 'Warehouse A', velocity: 'medium' as const, category: 'Sports & Outdoors', vendor: 'Mountain Gear Supply' },
  { id: '50', sku: 'SPT-JUMP-050', title: 'Speed Jump Rope', quantity: 234, reorderPoint: 50, costPerUnit: 7.99, location: 'Warehouse B', velocity: 'high' as const, category: 'Sports & Outdoors', vendor: 'Mountain Gear Supply' },
  { id: '51', sku: 'SPT-CAMP-051', title: 'Compact Camping Tent (2P)', quantity: 22, reorderPoint: 10, costPerUnit: 75.00, location: 'Warehouse A', velocity: 'low' as const, category: 'Sports & Outdoors', vendor: 'Mountain Gear Supply' },
  { id: '52', sku: 'SPT-LTNT-052', title: 'LED Camping Lantern', quantity: 134, reorderPoint: 30, costPerUnit: 16.99, location: 'Warehouse B', velocity: 'medium' as const, category: 'Sports & Outdoors', vendor: 'Mountain Gear Supply' },
  { id: '53', sku: 'SPT-BOTTLE-053', title: 'Collapsible Water Bottle', quantity: 289, reorderPoint: 60, costPerUnit: 6.50, location: 'Warehouse A', velocity: 'high' as const, category: 'Sports & Outdoors', vendor: 'Mountain Gear Supply' },
  { id: '54', sku: 'SPT-VEST-054', title: 'Hydration Running Vest', quantity: 31, reorderPoint: 12, costPerUnit: 42.00, location: 'Warehouse B', velocity: 'medium' as const, category: 'Sports & Outdoors', vendor: 'Mountain Gear Supply' },
];

// Purchase Orders
export const mockPurchaseOrders = [
  { id: 'PO-1042', vendor: 'TechGear Direct', items: 5, total: 2450.00, status: 'waiting' as const, eta: '2026-07-15' },
  { id: 'PO-1043', vendor: 'Global Footwear Inc', items: 3, total: 1890.00, status: 'ready' as const, eta: '2026-07-10' },
  { id: 'PO-1044', vendor: 'AccessoryHub', items: 8, total: 3200.00, status: 'done' as const, eta: '2026-07-01' },
  { id: 'PO-1045', vendor: 'FabricFirst Co', items: 12, total: 4750.00, status: 'waiting' as const, eta: '2026-07-20' },
  { id: 'PO-1046', vendor: 'FreshSupply Co', items: 6, total: 1280.00, status: 'ready' as const, eta: '2026-07-08' },
  { id: 'PO-1047', vendor: 'Mountain Gear Supply', items: 4, total: 2100.00, status: 'done' as const, eta: '2026-06-28' },
  { id: 'PO-1048', vendor: 'SnackNation', items: 15, total: 5890.00, status: 'waiting' as const, eta: '2026-07-22' },
  { id: 'PO-1049', vendor: 'HomeStyle Supply', items: 7, total: 1650.00, status: 'draft' as const, eta: '2026-07-25' },
  { id: 'PO-1050', vendor: 'AudioMax Supply', items: 3, total: 890.00, status: 'ready' as const, eta: '2026-07-09' },
  { id: 'PO-1051', vendor: 'TechGear Direct', items: 10, total: 3420.00, status: 'done' as const, eta: '2026-06-25' },
  { id: 'PO-1052', vendor: 'Global Footwear Inc', items: 6, total: 2780.00, status: 'waiting' as const, eta: '2026-07-18' },
  { id: 'PO-1053', vendor: 'FreshSupply Co', items: 4, total: 680.00, status: 'draft' as const, eta: '2026-07-28' },
];

// Forecasts
export const mockForecasts = [
  { sku: 'ELEC-BT-001', title: 'Wireless Bluetooth Earbuds (Black)', forecast: 120, confidence: 0.92, model: 'ETS' },
  { sku: 'CLT-TEE-011', title: 'Classic Cotton Tee (White)', forecast: 200, confidence: 0.88, model: 'Linear Regression' },
  { sku: 'FW-SNK-021', title: 'Aero Run Sneakers (White)', forecast: 45, confidence: 0.85, model: 'Moving Average' },
  { sku: 'FDB-BAR-035', title: 'Energy Bars (Mixed)', forecast: 500, confidence: 0.94, model: 'ETS' },
  { sku: 'SPT-BAG-047', title: 'Tactical Backpack 40L', forecast: 35, confidence: 0.78, model: 'Linear Regression' },
  { sku: 'ELEC-CB-008', title: 'USB-C Hub 7-in-1', forecast: 80, confidence: 0.91, model: 'ETS' },
  { sku: 'CLT-HOOD-013', title: 'Zip-Up Hoodie (Navy)', forecast: 60, confidence: 0.82, model: 'Moving Average' },
  { sku: 'FDB-CFF-032', title: 'Single Origin Coffee Beans 1kg', forecast: 150, confidence: 0.89, model: 'Linear Regression' },
  { sku: 'SPT-YOGA-048', title: 'Premium Yoga Block Set', forecast: 70, confidence: 0.86, model: 'ETS' },
  { sku: 'HMG-CAN-041', title: 'Scented Candle Set (3-Pack)', forecast: 95, confidence: 0.80, model: 'Moving Average' },
  { sku: 'ELEC-SB-003', title: 'Portable Bluetooth Speaker', forecast: 110, confidence: 0.87, model: 'ETS' },
  { sku: 'FDB-WTR-036', title: 'Sparkling Water 12-Pack', forecast: 180, confidence: 0.93, model: 'Linear Regression' },
];

// Vendors
export const mockVendors = [
  { id: '1', name: 'TechGear Direct', contact: 'orders@techgearn.com', leadTime: 14, onTimeDelivery: 94, qualityScore: 98, totalOrders: 47, category: 'Electronics' },
  { id: '2', name: 'Global Footwear Inc', contact: 'purchasing@globalfoot.com', leadTime: 21, onTimeDelivery: 87, qualityScore: 92, totalOrders: 32, category: 'Footwear' },
  { id: '3', name: 'AccessoryHub', contact: 'stock@accessoryhub.com', leadTime: 7, onTimeDelivery: 96, qualityScore: 95, totalOrders: 28, category: 'Accessories' },
  { id: '4', name: 'Mountain Gear Supply', contact: 'orders@mountaingear.com', leadTime: 18, onTimeDelivery: 82, qualityScore: 89, totalOrders: 15, category: 'Sports & Outdoors' },
  { id: '5', name: 'FabricFirst Co', contact: 'supply@fabricfirst.com', leadTime: 10, onTimeDelivery: 91, qualityScore: 93, totalOrders: 38, category: 'Clothing' },
  { id: '6', name: 'FreshSupply Co', contact: 'wholesale@freshsupply.com', leadTime: 5, onTimeDelivery: 97, qualityScore: 96, totalOrders: 52, category: 'Food & Beverage' },
  { id: '7', name: 'SnackNation', contact: 'bulk@snacknation.com', leadTime: 3, onTimeDelivery: 95, qualityScore: 94, totalOrders: 41, category: 'Food & Beverage' },
  { id: '8', name: 'HomeStyle Supply', contact: 'orders@homestyle.com', leadTime: 12, onTimeDelivery: 89, qualityScore: 90, totalOrders: 22, category: 'Home & Garden' },
  { id: '9', name: 'AudioMax Supply', contact: 'sales@audiomax.com', leadTime: 9, onTimeDelivery: 93, qualityScore: 97, totalOrders: 19, category: 'Electronics' },
];

// Stock Transfers
export const mockTransfers = [
  { id: 'TR-001', from: 'Warehouse A', to: 'Retail Store 1', sku: 'ELEC-SB-003', quantity: 50, status: 'completed' as const, date: '2026-07-01' },
  { id: 'TR-002', from: 'Warehouse B', to: 'Retail Store 2', sku: 'CLT-TEE-011', quantity: 100, status: 'in_transit' as const, date: '2026-07-05' },
  { id: 'TR-003', from: 'Warehouse A', to: 'Distribution Center', sku: 'FDB-BAR-035', quantity: 200, status: 'pending' as const, date: '2026-07-06' },
  { id: 'TR-004', from: 'Warehouse B', to: 'Retail Store 1', sku: 'FW-SNK-021', quantity: 25, status: 'completed' as const, date: '2026-06-28' },
  { id: 'TR-005', from: 'Warehouse A', to: 'Warehouse B', sku: 'ELEC-HD-006', quantity: 30, status: 'in_transit' as const, date: '2026-07-04' },
  { id: 'TR-006', from: 'Warehouse A', to: 'Retail Store 2', sku: 'HMG-CAN-041', quantity: 40, status: 'pending' as const, date: '2026-07-07' },
];

// Locations
export const mockLocations = [
  { id: '1', name: 'Warehouse A', type: 'warehouse' as const, capacity: 5000, used: 3200, skus: 32, manager: 'Alice Johnson' },
  { id: '2', name: 'Warehouse B', type: 'warehouse' as const, capacity: 3500, used: 2100, skus: 22, manager: 'Bob Smith' },
  { id: '3', name: 'Retail Store 1', type: 'retail' as const, capacity: 800, used: 520, skus: 18, manager: 'Carol White' },
  { id: '4', name: 'Retail Store 2', type: 'retail' as const, capacity: 600, used: 380, skus: 15, manager: 'Dave Brown' },
];

// Alerts
export const mockAlerts = [
  { id: '1', type: 'critical' as const, message: 'ELEC-BT-001 (Wireless Bluetooth Earbuds) out of stock at Warehouse A', timestamp: '2026-07-07 09:15' },
  { id: '2', type: 'warning' as const, message: 'FDB-PRO-029 (Organic Protein Powder) below reorder point — 23 units remaining', timestamp: '2026-07-07 08:30' },
  { id: '3', type: 'warning' as const, message: 'CLT-GLOVE-019 (Touchscreen Gloves) out of stock at Warehouse A', timestamp: '2026-07-07 08:00' },
  { id: '4', type: 'info' as const, message: 'Forecast generated for 54 SKUs — 12 items recommended for reorder', timestamp: '2026-07-07 06:00' },
  { id: '5', type: 'critical' as const, message: 'ELEC-KB-005 (Mechanical Keyboard RGB) critically low — 3 units remaining', timestamp: '2026-07-06 16:45' },
  { id: '6', type: 'info' as const, message: 'PO-1050 (AudioMax Supply) shipped — ETA 2026-07-09', timestamp: '2026-07-06 14:20' },
];

// Activity Log
export const mockActivity = [
  { id: '1', action: 'Stock transfer completed', detail: 'TR-001 — 50 units of ELEC-SB-003 to Retail Store 1', timestamp: '2026-07-07 09:00', user: 'System' },
  { id: '2', action: 'Purchase order placed', detail: 'PO-1053 — FreshSupply Co — $680.00', timestamp: '2026-07-07 08:30', user: 'Alice Johnson' },
  { id: '3', action: 'Stock adjustment', detail: 'ELEC-HD-006 — +10 units (Inventory count)', timestamp: '2026-07-07 08:15', user: 'Bob Smith' },
  { id: '4', action: 'Forecast updated', detail: '12 SKUs re-forecasted with latest sales data', timestamp: '2026-07-07 06:00', user: 'System' },
  { id: '5', action: 'New vendor added', detail: 'AudioMax Supply — Electronics supplier', timestamp: '2026-07-06 15:30', user: 'Alice Johnson' },
  { id: '6', action: 'Alert resolved', detail: 'ELEC-PB-007 restocked — now at 67 units', timestamp: '2026-07-06 14:00', user: 'System' },
  { id: '7', action: 'Integration synced', detail: 'Shopify inventory synced — 47 products updated', timestamp: '2026-07-06 12:00', user: 'System' },
  { id: '8', action: 'Report generated', detail: 'Weekly Inventory Summary exported to CSV', timestamp: '2026-07-06 09:00', user: 'Carol White' },
];
