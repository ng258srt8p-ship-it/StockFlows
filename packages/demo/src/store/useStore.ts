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

export interface NotificationSettings {
  emailAlerts: boolean;
  pushNotifications: boolean;
  smsAlerts: boolean;
  alertFrequency: 'realtime' | 'hourly' | 'daily';
  lowStockThreshold: number;
  outOfStockAlerts: boolean;
  supplierDelayAlerts: boolean;
  forecastUpdates: boolean;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  currency: string;
  theme: 'dark' | 'light' | 'system';
  dateFormat: string;
  timeFormat: string;
  notifications: boolean;
  autoSave: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  lastPasswordChange: string;
  activeSessions: number;
  apiKeys: Array<{ id: string; name: string; created: string; lastUsed: string }>;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'invited' | 'disabled';
}

export interface Integration {
  id: string;
  name: string;
  connected: boolean;
  lastSync: string;
}

export interface BillingInfo {
  plan: string;
  billingCycle: string;
  nextBilling: string;
  amount: number;
  paymentMethod: string;
  skusUsed: number;
  skusLimit: number;
  ordersThisPeriod: number;
  apiCalls: number;
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

  // Tour
  tourActive: boolean;
  tourStep: number;
  tourCompleted: boolean;
  startTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  endTour: () => void;

  // Settings
  notificationSettings: NotificationSettings;
  userPreferences: UserPreferences;
  securitySettings: SecuritySettings;
  teamMembers: TeamMember[];
  integrations: Integration[];
  billingInfo: BillingInfo;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => void;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  removeTeamMember: (id: string) => void;
  updateTeamMemberRole: (id: string, role: TeamMember['role']) => void;
  toggleIntegration: (id: string) => void;

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

  // Tour
  tourActive: false,
  tourStep: 0,
  tourCompleted: localStorage.getItem('sf-tour-completed') === 'true',
  startTour: () => set({ tourActive: true, tourStep: 0 }),
  nextTourStep: () => set((state) => ({ tourStep: state.tourStep + 1 })),
  prevTourStep: () => set((state) => ({ tourStep: Math.max(0, state.tourStep - 1) })),
  endTour: () => {
    localStorage.setItem('sf-tour-completed', 'true');
    set({ tourActive: false, tourStep: 0, tourCompleted: true });
  },

  // Settings
  notificationSettings: {
    emailAlerts: true,
    pushNotifications: true,
    smsAlerts: false,
    alertFrequency: 'realtime',
    lowStockThreshold: 10,
    outOfStockAlerts: true,
    supplierDelayAlerts: true,
    forecastUpdates: true,
  },
  userPreferences: {
    language: 'en',
    timezone: 'America/New_York',
    currency: 'USD',
    theme: 'dark',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    notifications: true,
    autoSave: true,
  },
  securitySettings: {
    twoFactorAuth: true,
    lastPasswordChange: '2026-06-15',
    activeSessions: 2,
    apiKeys: [
      { id: 'key-1', name: 'Production API Key', created: '2026-03-01', lastUsed: '2026-07-08' },
      { id: 'key-2', name: 'Development API Key', created: '2026-05-15', lastUsed: '2026-07-07' },
    ],
  },
  teamMembers: [
    { id: 'tm-1', name: 'Alex Johnson', email: 'alex@stockflows.app', role: 'admin', status: 'active' },
    { id: 'tm-2', name: 'Sarah Chen', email: 'sarah@stockflows.app', role: 'editor', status: 'active' },
    { id: 'tm-3', name: 'Marcus Williams', email: 'marcus@stockflows.app', role: 'editor', status: 'active' },
    { id: 'tm-4', name: 'Priya Patel', email: 'priya@stockflows.app', role: 'viewer', status: 'active' },
  ],
  integrations: [
    { id: 'int-1', name: 'Shopify', connected: true, lastSync: '2026-07-08 01:00' },
    { id: 'int-2', name: 'ShipStation', connected: true, lastSync: '2026-07-07 18:30' },
    { id: 'int-3', name: 'QuickBooks', connected: false, lastSync: 'Never' },
    { id: 'int-4', name: 'WooCommerce', connected: false, lastSync: 'Never' },
  ],
  billingInfo: {
    plan: 'Starter',
    billingCycle: 'Monthly',
    nextBilling: '2026-08-01',
    amount: 29,
    paymentMethod: 'Visa ending in 4242',
    skusUsed: 156,
    skusLimit: 500,
    ordersThisPeriod: 23,
    apiCalls: 4521,
  },
  updateNotificationSettings: (settings) =>
    set((state) => ({
      notificationSettings: { ...state.notificationSettings, ...settings },
    })),
  updateUserPreferences: (prefs) =>
    set((state) => ({
      userPreferences: { ...state.userPreferences, ...prefs },
    })),
  updateSecuritySettings: (settings) =>
    set((state) => ({
      securitySettings: { ...state.securitySettings, ...settings },
    })),
  addTeamMember: (member) =>
    set((state) => ({
      teamMembers: [...state.teamMembers, { ...member, id: `tm-${Date.now()}` }],
    })),
  removeTeamMember: (id) =>
    set((state) => ({
      teamMembers: state.teamMembers.filter((m) => m.id !== id),
    })),
  updateTeamMemberRole: (id, role) =>
    set((state) => ({
      teamMembers: state.teamMembers.map((m) => (m.id === id ? { ...m, role } : m)),
    })),
  toggleIntegration: (id) =>
    set((state) => ({
      integrations: state.integrations.map((i) =>
        i.id === id
          ? { ...i, connected: !i.connected, lastSync: !i.connected ? new Date().toISOString().slice(0, 16).replace('T', ' ') : i.lastSync }
          : i
      ),
    })),

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
