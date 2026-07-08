import { create } from 'zustand';
import {
  mockInventory,
  mockPurchaseOrders,
  mockForecasts,
  mockVendors,
  mockTransfers,
  mockLocations,
  mockAlerts,
  mockActivity,
} from '../data/mockData';

// ---- Types ----

export interface InventoryItem {
  id: string;
  sku: string;
  title: string;
  quantity: number;
  reorderPoint: number;
  costPerUnit: number;
  location: string;
  velocity: 'high' | 'medium' | 'low';
  category: string;
  vendor: string;
}

export interface PurchaseOrder {
  id: string;
  vendor: string;
  items: number;
  total: number;
  status: 'draft' | 'waiting' | 'ready' | 'done' | 'cancelled';
  eta: string;
}

export interface Forecast {
  sku: string;
  title: string;
  forecast: number;
  confidence: number;
  model: string;
}

export interface Vendor {
  id: string;
  name: string;
  contact: string;
  leadTime: number;
  onTimeDelivery: number;
  qualityScore: number;
  totalOrders: number;
  category: string;
}

export interface Transfer {
  id: string;
  from: string;
  to: string;
  sku: string;
  quantity: number;
  status: 'completed' | 'in_transit' | 'pending';
  date: string;
}

export interface Location {
  id: string;
  name: string;
  type: 'warehouse' | 'retail';
  capacity: number;
  used: number;
  skus: number;
  manager: string;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
  user: string;
}

// ---- State Interface ----

interface DemoState {
  // Navigation
  activeRoute: string;
  setActiveRoute: (route: string) => void;

  // Inventory
  inventory: InventoryItem[];
  adjustStock: (id: string, delta: number, reason: string) => void;

  // Purchase Orders
  purchaseOrders: PurchaseOrder[];

  // Forecasts
  forecasts: Forecast[];

  // Vendors
  vendors: Vendor[];

  // Transfers
  transfers: Transfer[];

  // Locations
  locations: Location[];

  // Alerts
  alerts: Alert[];

  // Activity
  activity: ActivityItem[];

  // Computed helpers
  totalStockValue: () => number;
  outOfStockCount: () => number;
  lowStockCount: () => number;
  categoryCount: () => Record<string, number>;
}

// ---- Store ----

export const useDemoStore = create<DemoState>((set, get) => ({
  // Navigation
  activeRoute: 'dashboard',
  setActiveRoute: (route) => set({ activeRoute: route }),

  // Inventory — seeded from mock data
  inventory: mockInventory as InventoryItem[],

  adjustStock: (id, delta, reason) =>
    set((state) => ({
      inventory: state.inventory.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      ),
      activity: [
        {
          id: `act-${Date.now()}`,
          action: 'Stock adjustment',
          detail: `${reason} — ${delta > 0 ? '+' : ''}${delta} units (manual)`,
          timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
          user: 'Demo User',
        },
        ...state.activity,
      ],
    })),

  // Purchase Orders
  purchaseOrders: mockPurchaseOrders as PurchaseOrder[],

  // Forecasts
  forecasts: mockForecasts as Forecast[],

  // Vendors
  vendors: mockVendors as Vendor[],

  // Transfers
  transfers: mockTransfers as Transfer[],

  // Locations
  locations: mockLocations as Location[],

  // Alerts
  alerts: mockAlerts as Alert[],

  // Activity
  activity: mockActivity as ActivityItem[],

  // ---- Computed helpers ----
  totalStockValue: () =>
    get().inventory.reduce((sum, item) => sum + item.quantity * item.costPerUnit, 0),

  outOfStockCount: () =>
    get().inventory.filter((item) => item.quantity === 0).length,

  lowStockCount: () =>
    get().inventory.filter((item) => item.quantity > 0 && item.quantity <= item.reorderPoint).length,

  categoryCount: () =>
    get().inventory.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
}));
