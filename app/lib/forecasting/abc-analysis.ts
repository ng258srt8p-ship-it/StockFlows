/**
 * ABC Analysis — classifies inventory items by their revenue contribution
 * following the Pareto principle.
 *
 * Categories:
 *   A — Top 80% of revenue (typically ~20% of items)
 *   B — Next 15% of revenue (typically ~30% of items)
 *   C — Remaining 5% of revenue (typically ~50% of items)
 *
 * Usage:
 *   const categories = classifyABC(items);
 *   // items in `A` should get the tightest forecasting and reorder policies
 */

import { logger } from "~/lib/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ABCItem {
  id: string;
  title: string;
  sku: string | null;
  quantity: number;
  costPerUnit: number | null;
  /** Total revenue over the analysis period */
  revenue: number;
}

export interface ABCResult {
  id: string;
  title: string;
  sku: string | null;
  quantity: number;
  revenue: number;
  cumulativeRevenue: number;
  cumulativePercent: number;
  category: "A" | "B" | "C";
}

export interface ABCSummary {
  categories: ABCResult[];
  totals: {
    A: { count: number; revenue: number; percentRevenue: number };
    B: { count: number; revenue: number; percentRevenue: number };
    C: { count: number; revenue: number; percentRevenue: number };
  };
  totalRevenue: number;
  totalItems: number;
}

// ---------------------------------------------------------------------------
// ABC classification
// ---------------------------------------------------------------------------

/**
 * Classify inventory items into ABC categories based on revenue contribution.
 *
 * @param items - Array of inventory items with revenue data
 * @returns Summary with each item classified as A, B, or C
 */
export function classifyABC(items: ABCItem[]): ABCSummary {
  if (items.length === 0) {
    return {
      categories: [],
      totals: {
        A: { count: 0, revenue: 0, percentRevenue: 0 },
        B: { count: 0, revenue: 0, percentRevenue: 0 },
        C: { count: 0, revenue: 0, percentRevenue: 0 },
      },
      totalRevenue: 0,
      totalItems: 0,
    };
  }

  // Sort by revenue descending
  const sorted = [...items]
    .filter((i) => i.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = sorted.reduce((sum, i) => sum + i.revenue, 0);

  // Assign categories based on cumulative revenue thresholds
  let cumulativeRevenue = 0;
  const categories: ABCResult[] = sorted.map((item) => {
    cumulativeRevenue += item.revenue;
    const cumulativePercent = totalRevenue > 0
      ? (cumulativeRevenue / totalRevenue) * 100
      : 0;

    let category: "A" | "B" | "C";
    if (cumulativePercent <= 80) {
      category = "A";
    } else if (cumulativePercent <= 95) {
      category = "B";
    } else {
      category = "C";
    }

    return {
      id: item.id,
      title: item.title,
      sku: item.sku,
      quantity: item.quantity,
      revenue: item.revenue,
      cumulativeRevenue,
      cumulativePercent: Math.round(cumulativePercent * 100) / 100,
      category,
    };
  });

  // Include zero-revenue items as C
  const zeroRevenue = items
    .filter((i) => i.revenue <= 0)
    .map((item): ABCResult => ({
      id: item.id,
      title: item.title,
      sku: item.sku,
      quantity: item.quantity,
      revenue: 0,
      cumulativeRevenue,
      cumulativePercent: 100,
      category: "C",
    }));

  const allCategories = [...categories, ...zeroRevenue];

  // Compute totals
  const countA = allCategories.filter((i) => i.category === "A");
  const countB = allCategories.filter((i) => i.category === "B");
  const countC = allCategories.filter((i) => i.category === "C");

  const totalRev = totalRevenue || 1; // avoid division by zero

  return {
    categories: allCategories,
    totals: {
      A: {
        count: countA.length,
        revenue: countA.reduce((s, i) => s + i.revenue, 0),
        percentRevenue: Math.round(
          (countA.reduce((s, i) => s + i.revenue, 0) / totalRev) * 100
        ),
      },
      B: {
        count: countB.length,
        revenue: countB.reduce((s, i) => s + i.revenue, 0),
        percentRevenue: Math.round(
          (countB.reduce((s, i) => s + i.revenue, 0) / totalRev) * 100
        ),
      },
      C: {
        count: countC.length,
        revenue: countC.reduce((s, i) => s + i.revenue, 0),
        percentRevenue: Math.round(
          (countC.reduce((s, i) => s + i.revenue, 0) / totalRev) * 100
        ),
      },
    },
    totalRevenue,
    totalItems: allCategories.length,
  };
}

/**
 * Get recommended reorder policies per ABC category.
 */
export function getReorderPolicy(category: "A" | "B" | "C"): {
  reviewFrequency: string;
  safetyStockMultiplier: number;
  serviceLevel: number;
} {
  switch (category) {
    case "A":
      return {
        reviewFrequency: "Daily",
        safetyStockMultiplier: 2.0,
        serviceLevel: 0.99,
      };
    case "B":
      return {
        reviewFrequency: "Weekly",
        safetyStockMultiplier: 1.5,
        serviceLevel: 0.95,
      };
    case "C":
      return {
        reviewFrequency: "Monthly",
        safetyStockMultiplier: 1.0,
        serviceLevel: 0.90,
      };
  }
}
