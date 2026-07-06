export interface Product {
  id: string;
  sku: string;
  name: string;
  location: string;
  onHand: number;
  committed: number;
  incoming: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  productType: string;
  vendor: string;
}

export interface Forecast {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  abcClass: 'A' | 'B' | 'C';
  method: 'Linear' | 'Ensemble' | 'ETS';
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  accuracy?: number;
  forecastData: { week: number; value: number }[];
  predicted: number;
  predictedDemand?: number;
  current: number;
  currentStock?: number;
  daysOfStock?: number;
  reorderPoint?: number;
  safetyStock?: number;
}

export interface AbcItem {
  category: 'A' | 'B' | 'C';
  product: string;
  sku: string;
  revenue: number;
  cumulativePercentage: number;
  stock: number;
  reviewFrequency: 'Daily' | 'Weekly' | 'Monthly';
}

export interface AbcAnalysis {
  summary: {
    totalRevenue: number;
    categories: {
      A: { count: number; revenuePercentage: number; reviewFrequency: 'Daily' };
      B: { count: number; revenuePercentage: number; reviewFrequency: 'Weekly' };
      C: { count: number; revenuePercentage: number; reviewFrequency: 'Monthly' };
    };
  };
  items: AbcItem[];
}

export interface MovementSummary {
  inbound: { units: number; label: string; color: string; bgColor: string; borderColor: string };
  outbound: { units: number; label: string; color: string; bgColor: string; borderColor: string };
  adjustments: { units: number; label: string; color: string; bgColor: string; borderColor: string };
}

export interface InventoryValuationItem {
  product: string;
  sku: string;
  quantity: number;
  unitCost: number;
  totalValue: number;
}

export interface ReportsData {
  summary: {
    totalInventoryValue: number;
    totalItems: number;
    totalMovements: number;
    movements: MovementSummary;
  };
  inventoryValuation: InventoryValuationItem[];
}

export interface SettingsData {
  notifications: {
    emailAlerts: boolean;
    slackEnabled: boolean;
    smsEnabled: boolean;
  };
  alertThresholds: {
    lowStockThreshold: number;
    criticalStockThreshold: number;
    safetyStockMultiplier: number;
  };
  forecasting: {
    forecastHorizonDays: number;
  };
  aiFeatures: {
    enableAiInsights: boolean;
    enableForecastExplanations: boolean;
  };
  general: {
    currency: string;
  };
}

export type Page = 'dashboard' | 'products' | 'variants' | 'locations' | 'reports' | 'settings';

export interface NavigationItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
}