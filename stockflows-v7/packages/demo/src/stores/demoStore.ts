import { create } from 'zustand';
import {
  mockInventory,
  mockPurchaseOrders,
  mockForecasts,
  mockVendors,
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

// ---- State Interface ----

export interface DemoStoreState {
  // Data
  inventory: InventoryItem[];
  purchaseOrders: PurchaseOrder[];
  forecasts: Forecast[];
  vendors: Vendor[];

  // UI state
  searchQuery: string;
  selectedLocation: string;
  sidebarOpen: boolean;
  tourActive: boolean;
  tourStep: number;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedLocation: (location: string) => void;
  toggleSidebar: () => void;
  startTour: () => void;
  nextTourStep: () => void;
  endTour: () => void;
}

// ---- Store ----

export const useDemoStore = create<DemoStoreState>((set) => ({
  // Data — seeded from mock data
  inventory: mockInventory as InventoryItem[],
  purchaseOrders: mockPurchaseOrders as PurchaseOrder[],
  forecasts: mockForecasts as Forecast[],
  vendors: mockVendors as Vendor[],

  // UI state — defaults
  searchQuery: '',
  selectedLocation: 'all',
  sidebarOpen: true,
  tourActive: false,
  tourStep: 0,

  // Actions
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedLocation: (location: string) => set({ selectedLocation: location }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  startTour: () => set({ tourActive: true, tourStep: 0 }),
  nextTourStep: () => set((state) => ({ tourStep: state.tourStep + 1 })),
  endTour: () => set({ tourActive: false, tourStep: 0 }),
}));
