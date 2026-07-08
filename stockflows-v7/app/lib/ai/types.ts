export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AICompletionResponse {
  id: string;
  choices: Array<{
    message: { content: string; role: string };
    finish_reason: string;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export interface InventoryContext {
  shopDomain: string;
  totalProducts: number;
  totalLocations: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  alerts: Array<{
    productName: string;
    location: string;
    currentStock: number;
    reorderPoint: number;
    urgency: string;
    recommendedQty: number;
  }>;
  topProducts: Array<{
    name: string;
    sku: string;
    quantity: number;
    reorderPoint: number;
    location: string;
  }>;
  forecastSummary?: {
    avgConfidence: number;
    productsWithForecast: number;
    avgDailyDemand: number;
  };
}

export interface AIInsight {
  id: string;
  type: "risk" | "opportunity" | "trend" | "recommendation";
  title: string;
  description: string;
  severity?: "high" | "medium" | "low";
  actionLabel?: string;
  actionUrl?: string;
}
