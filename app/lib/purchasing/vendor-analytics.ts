/**
 * Vendor Performance Analytics
 *
 * Provides comprehensive vendor performance metrics including:
 * - Delivery time tracking and scoring
 * - Quality metrics (damage rates from receiving)
 * - Cost comparison over time
 * - Performance scoring and ranking
 *
 * Follows existing patterns from vendor.ts and auto-reorder.ts
 */

import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DeliveryMetrics {
  vendorId: string;
  vendorName: string;
  totalOrders: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  earlyDeliveries: number;
  averageLeadTimeDays: number;
  medianLeadTimeDays: number;
  leadTimeStdDev: number;
  onTimeRate: number; // 0-1
  reliabilityScore: number; // 0-1
}

interface QualityIssue {
  date: Date;
  poId: string;
  lineItemId: string;
  issueType: "DAMAGE" | "WRONG_ITEM" | "SHORTAGE" | "QUALITY";
  quantity: number;
  notes?: string;
}
export interface QualityMetrics {
  vendorId: string;
  vendorName: string;
  totalReceivedUnits: number;
  damagedUnits: number;
  damagedRate: number; // 0-1
  returnRate: number; // 0-1
  qualityScore: number; // 0-1
  qualityIssues: QualityIssue[];
}

export interface CostMetrics {
  vendorId: string;
  vendorName: string;
  totalOrders: number;
  totalSpend: number;
  averageOrderValue: number;
  averageUnitCost: number;
  costTrend: "increasing" | "decreasing" | "stable";
  costTrendPercentage: number;
  savingsOpportunities: Array<{
    itemId: string;
    itemTitle: string;
    currentCost: number;
    marketAverage: number;
    potentialSavings: number;
  }>;
}

export interface VendorScorecard {
  vendorId: string;
  vendorName: string;
  overallScore: number; // 0-100
  deliveryScore: number; // 0-100
  qualityScore: number; // 0-100
  costScore: number; // 0-100
  rank: number;
  totalOrders: number;
  totalSpend: number;
  trend: "improving" | "declining" | "stable";
  lastOrderDate: Date | null;
  riskLevel: "low" | "medium" | "high" | "critical";
  recommendations: string[];
}

export interface VendorComparison {
  vendors: Array<{
    vendorId: string;
    vendorName: string;
    onTimeRate: number;
    qualityScore: number;
    averageUnitCost: number;
    reliabilityScore: number;
    totalSpend: number;
    score: number; // composite score
  }>;
  bestVendor: string; // vendorId
  worstVendor: string; // vendorId
  savingsPotential: number;
}

// ---------------------------------------------------------------------------
// Delivery Time Analytics
// ---------------------------------------------------------------------------

/**
 * Calculate delivery performance metrics for a vendor
 *
 * @param vendorId - Vendor to analyze
 * @param daysBack - Number of days to look back (default 365)
 * @returns Delivery metrics including on-time rate, average lead time, etc.
 */
export async function getDeliveryMetrics(
  vendorId: string,
  daysBack: number = 365,
): Promise<DeliveryMetrics> {
  logger.info({ vendorId, daysBack }, "getDeliveryMetrics: starting");

  const since = new Date();
  since.setDate(since.getDate() - daysBack);

  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { id: true, name: true },
  });

  if (!vendor) {
    throw new Error(`Vendor ${vendorId} not found`);
  }

  // Get all received POs for this vendor
  const receivedPOs = await prisma.purchaseOrder.findMany({
    where: {
      vendorId,
      status: { in: ["RECEIVED", "PARTIALLY_RECEIVED"] },
      receivedDate: { gte: since },
    },
    include: {
      receivingEvents: true,
    },
  });

  if (receivedPOs.length === 0) {
    return {
      vendorId,
      vendorName: vendor.name,
      totalOrders: 0,
      onTimeDeliveries: 0,
      lateDeliveries: 0,
      earlyDeliveries: 0,
      averageLeadTimeDays: 0,
      medianLeadTimeDays: 0,
      leadTimeStdDev: 0,
      onTimeRate: 0,
      reliabilityScore: 1.0, // Default to perfect if no history
    };
  }

  // Calculate lead times for each received PO
  const leadTimes: number[] = [];
  let onTimeDeliveries = 0;
  let lateDeliveries = 0;
  let earlyDeliveries = 0;

  for (const po of receivedPOs) {
    if (!po.receivedDate || !po.expectedDate) continue;

    const expectedDate = new Date(po.expectedDate);
    const receivedDate = new Date(po.receivedDate);
    const leadTimeDays = Math.ceil(
      (receivedDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    leadTimes.push(leadTimeDays);

    // On-time if received on or before expected date
    if (receivedDate <= expectedDate) {
      onTimeDeliveries++;
    } else if (receivedDate.getTime() - expectedDate.getTime() < 24 * 60 * 60 * 1000) {
      // Within 1 day considered on-time
      onTimeDeliveries++;
    } else {
      lateDeliveries++;
    }
  }

  // Calculate statistics
  const sortedLeadTimes = [...leadTimes].sort((a, b) => a - b);
  const medianLeadTimeDays =
    sortedLeadTimes.length > 0
      ? sortedLeadTimes[Math.floor(sortedLeadTimes.length / 2)]
      : 0;

  const averageLeadTimeDays =
    leadTimes.length > 0
      ? leadTimes.reduce((sum, lt) => sum + lt, 0) / leadTimes.length
      : 0;

  const leadTimeStdDev =
    leadTimes.length > 1
      ? Math.sqrt(
          leadTimes.reduce((sum, lt) => sum + Math.pow(lt - averageLeadTimeDays, 2), 0) /
            leadTimes.length
        )
      : 0;

  const onTimeRate =
    receivedPOs.length > 0 ? onTimeDeliveries / receivedPOs.length : 0;

  // Reliability score combines on-time rate and consistency
  const reliabilityScore = onTimeRate * (1 - Math.min(leadTimeStdDev / 30, 0.5));

  const metrics: DeliveryMetrics = {
    vendorId,
    vendorName: vendor.name,
    totalOrders: receivedPOs.length,
    onTimeDeliveries,
    lateDeliveries,
    earlyDeliveries,
    averageLeadTimeDays: Math.round(averageLeadTimeDays * 10) / 10,
    medianLeadTimeDays,
    leadTimeStdDev: Math.round(leadTimeStdDev * 10) / 10,
    onTimeRate: Math.round(onTimeRate * 100) / 100,
    reliabilityScore: Math.round(reliabilityScore * 100) / 100,
  };

  logger.info({ vendorId: metrics.vendorId, totalOrders: metrics.totalOrders, onTimeRate: metrics.onTimeRate }, "getDeliveryMetrics: done");
  return metrics;
}

/**
 * Get delivery metrics for all vendors in a shop
 */
export async function getAllVendorsDeliveryMetrics(
  shopId: string,
  daysBack: number = 365,
): Promise<DeliveryMetrics[]> {
  const vendors = await prisma.vendor.findMany({
    where: { shopId, isActive: true },
    select: { id: true, name: true },
  });

  return Promise.all(
    vendors.map((v) => getDeliveryMetrics(v.id, daysBack))
  );
}

// ---------------------------------------------------------------------------
// Quality Metrics
// ---------------------------------------------------------------------------

/**
 * Calculate quality metrics for a vendor based on receiving events
 */
export async function getQualityMetrics(
  vendorId: string,
  daysBack: number = 365,
): Promise<QualityMetrics> {
  logger.info({ vendorId, daysBack }, "getQualityMetrics: starting");

  const since = new Date();
  since.setDate(since.getDate() - daysBack);

  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { id: true, name: true },
  });

  if (!vendor) {
    throw new Error(`Vendor ${vendorId} not found`);
  }

  // Get receiving events for this vendor's POs
  const receivingEvents = await prisma.receivingEvent.findMany({
    where: {
      purchaseOrder: { vendorId },
      createdAt: { gte: since },
    },
    include: {
      purchaseOrder: {
        include: {
          lineItems: {
            include: { inventoryItem: { select: { id: true, title: true } } },
          },
        },
      },
    },
  });

  let totalReceivedUnits = 0;
  let damagedUnits = 0;
  let returnedUnits = 0;
  const qualityIssues: QualityMetrics["qualityIssues"] = [];

  for (const event of receivingEvents) {
    const lineItems = event.lineItems as Record<string, number>;

    for (const [lineItemId, quantity] of Object.entries(lineItems)) {
      const lineItem = event.purchaseOrder.lineItems.find(
        (li) => li.id === lineItemId
      );

      if (!lineItem) continue;

      totalReceivedUnits += quantity;

      // Check notes for quality issues
      const notes = event.notes?.toLowerCase() || "";
      if (notes.includes("damage") || notes.includes("damaged")) {
            damagedUnits += quantity;
            qualityIssues.push({
              date: event.createdAt,
              poId: event.purchaseOrder.id ?? "",
              lineItemId,
              issueType: "DAMAGE",
              quantity,
              notes: event.notes ?? undefined,
            });
          } else if (notes.includes("wrong") || notes.includes("incorrect")) {
            returnedUnits += quantity;
            qualityIssues.push({
              date: event.createdAt,
              poId: event.purchaseOrder.id ?? "",
              lineItemId,
              issueType: "WRONG_ITEM",
              quantity,
              notes: event.notes ?? undefined,
            });
          } else if (notes.includes("short") || notes.includes("shortage")) {
            qualityIssues.push({
              date: event.createdAt,
              poId: event.purchaseOrder.id ?? "",
              lineItemId,
              issueType: "SHORTAGE",
              quantity,
              notes: event.notes ?? undefined,
            });
          } else if (notes.includes("quality")) {
            qualityIssues.push({
              date: event.createdAt,
              poId: event.purchaseOrder.id ?? "",
              lineItemId,
              issueType: "QUALITY",
              quantity,
              notes: event.notes ?? undefined,
            });
          }
    }
  }

  const damagedRate = totalReceivedUnits > 0 ? damagedUnits / totalReceivedUnits : 0;
  const returnRate = totalReceivedUnits > 0 ? returnedUnits / totalReceivedUnits : 0;
  const qualityScore = Math.max(0, 1 - damagedRate - returnRate * 0.5);

  return {
    vendorId,
    vendorName: vendor.name,
    totalReceivedUnits,
    damagedUnits,
    damagedRate: Math.round(damagedRate * 10000) / 100, // as percentage with 2 decimals
    returnRate: Math.round(returnRate * 10000) / 100,
    qualityScore: Math.round(qualityScore * 100) / 100,
    qualityIssues,
  };
}

// ---------------------------------------------------------------------------
// Cost Metrics
// ---------------------------------------------------------------------------

/**
 * Calculate cost metrics and trends for a vendor
 */
export async function getCostMetrics(
  vendorId: string,
  daysBack: number = 365,
): Promise<CostMetrics> {
  logger.info({ vendorId, daysBack }, "getCostMetrics: starting");

  const since = new Date();
  since.setDate(since.getDate() - daysBack);

  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { id: true, name: true },
  });

  if (!vendor) {
    throw new Error(`Vendor ${vendorId} not found`);
  }

  // Get all POs with line items
  const purchaseOrders = await prisma.purchaseOrder.findMany({
    where: {
      vendorId,
      status: { in: ["RECEIVED", "PARTIALLY_RECEIVED", "CLOSED"] },
      createdAt: { gte: since },
    },
    include: {
      lineItems: {
        include: {
          inventoryItem: { select: { id: true, title: true, sku: true } },
        },
      },
    },
  });

  if (purchaseOrders.length === 0) {
    return {
      vendorId,
      vendorName: vendor.name,
      totalOrders: 0,
      totalSpend: 0,
      averageOrderValue: 0,
      averageUnitCost: 0,
      costTrend: "stable",
      costTrendPercentage: 0,
      savingsOpportunities: [],
    };
  }

  // Calculate total spend and average order value
  let totalSpend = 0;
  let totalUnits = 0;
  let totalUnitCost = 0;
  let unitCostCount = 0;

  const monthlySpend: Record<string, number> = {};

  for (const po of purchaseOrders) {
    let poTotal = 0;
    for (const li of po.lineItems) {
      const lineTotal = Number(li.unitCost) * li.quantity;
      poTotal += lineTotal;
      totalSpend += lineTotal;
      totalUnits += li.quantity;
      totalUnitCost += Number(li.unitCost);
      unitCostCount++;
    }

    const monthKey = po.createdAt.toISOString().slice(0, 7); // YYYY-MM
    monthlySpend[monthKey] = (monthlySpend[monthKey] || 0) + poTotal;
  }

  const averageOrderValue = totalSpend / purchaseOrders.length;
  const averageUnitCost = unitCostCount > 0 ? totalUnitCost / unitCostCount : 0;

  // Calculate trend (comparing last 3 months vs previous 3 months)
  const months = Object.keys(monthlySpend).sort();
  let costTrend: "increasing" | "decreasing" | "stable" = "stable";
  let costTrendPercentage = 0;

  if (months.length >= 6) {
    const last3Months = months.slice(-3);
    const prev3Months = months.slice(-6, -3);

    const last3Sum = last3Months.reduce((sum, m) => sum + (monthlySpend[m] || 0), 0);
    const prev3Sum = prev3Months.reduce((sum, m) => sum + (monthlySpend[m] || 0), 0);

    if (prev3Sum > 0) {
      costTrendPercentage = ((last3Sum - prev3Sum) / prev3Sum) * 100;
      if (costTrendPercentage > 5) costTrend = "increasing";
      else if (costTrendPercentage < -5) costTrend = "decreasing";
    }
  }

  // Find savings opportunities (items with above-market costs)
  // This is a simplified version - in reality you'd compare against market data
  const savingsOpportunities: CostMetrics["savingsOpportunities"] = [];

  // Group line items by inventory item
  const itemCosts = new Map<
    string,
    { totalCost: number; totalQty: number; item: { id: string; title: string } }
  >();

  for (const po of purchaseOrders) {
    for (const li of po.lineItems) {
      const key = li.inventoryItemId;
      const existing = itemCosts.get(key) || {
        totalCost: 0,
        totalQty: 0,
        item: { id: li.inventoryItem.id, title: li.inventoryItem.title },
      };
      existing.totalCost += Number(li.unitCost) * li.quantity;
      existing.totalQty += li.quantity;
      itemCosts.set(key, existing);
    }
  }

  // Identify items with high average cost (simplified - would need market data for real comparison)
  for (const [itemId, data] of itemCosts) {
    const avgCost = data.totalCost / data.totalQty;
    // Simple heuristic: if unit cost > $100, flag for review
    if (avgCost > 100 && data.totalQty > 5) {
      savingsOpportunities.push({
        itemId,
        itemTitle: data.item.title,
        currentCost: Math.round(avgCost * 100) / 100,
        marketAverage: Math.round(avgCost * 0.9 * 100) / 100, // Estimated 10% below
        potentialSavings: Math.round(avgCost * 0.1 * data.totalQty * 100) / 100,
      });
    }
  }

  return {
    vendorId,
    vendorName: vendor.name,
    totalOrders: purchaseOrders.length,
    totalSpend: Math.round(totalSpend * 100) / 100,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    averageUnitCost: Math.round(averageUnitCost * 100) / 100,
    costTrend,
    costTrendPercentage: Math.round(costTrendPercentage * 100) / 100,
    savingsOpportunities: savingsOpportunities.slice(0, 10), // Top 10
  };
}

// ---------------------------------------------------------------------------
// Vendor Scorecard & Comparison
// ---------------------------------------------------------------------------

/**
 * Generate a comprehensive vendor scorecard
 */
export async function getVendorScorecard(
  vendorId: string,
  daysBack: number = 365,
): Promise<VendorScorecard> {
  logger.info({ vendorId, daysBack }, "getVendorScorecard: starting");

  const [deliveryMetrics, qualityMetrics, costMetrics] = await Promise.all([
    getDeliveryMetrics(vendorId, daysBack),
    getQualityMetrics(vendorId, daysBack),
    getCostMetrics(vendorId, daysBack),
  ]);

  // Calculate component scores (0-100)
  const deliveryScore = Math.round(
    deliveryMetrics.onTimeRate * 100 * 0.7 +
      (1 - Math.min(deliveryMetrics.leadTimeStdDev / 30, 1)) * 30
  );

  const qualityScore = Math.round(qualityMetrics.qualityScore * 100);

  // Cost score based on trend and competitiveness
  let costScore = 50; // baseline
  if (costMetrics.costTrend === "decreasing") costScore += 25;
  else if (costMetrics.costTrend === "increasing") costScore -= 15;

  // Normalize cost score
  costScore = Math.max(0, Math.min(100, costScore));

  // Overall score (weighted average)
  const overallScore = Math.round(
    deliveryScore * 0.4 + qualityScore * 0.35 + costScore * 0.25
  );

  // Determine risk level
  let riskLevel: VendorScorecard["riskLevel"] = "low";
  if (overallScore < 40) riskLevel = "critical";
  else if (overallScore < 60) riskLevel = "high";
  else if (overallScore < 75) riskLevel = "medium";

  // Generate recommendations
  const recommendations: string[] = [];

  if (deliveryMetrics.onTimeRate < 0.8) {
    recommendations.push(
      "On-time delivery rate below 80% - discuss improvement plan with vendor"
    );
  }
  if (deliveryMetrics.leadTimeStdDev > 10) {
    recommendations.push(
      "High lead time variability - consider safety stock adjustments"
    );
  }
  if (qualityMetrics.damagedRate > 0.02) {
    recommendations.push(
      "Damage rate above 2% - review packaging requirements with vendor"
    );
  }
  if (qualityMetrics.returnRate > 0.01) {
    recommendations.push(
      "Return rate above 1% - verify quality inspection processes"
    );
  }
  if (costMetrics.costTrend === "increasing") {
    recommendations.push(
      "Costs trending upward - negotiate pricing or explore alternatives"
    );
  }
  if (costMetrics.savingsOpportunities.length > 0) {
    recommendations.push(
      `${costMetrics.savingsOpportunities.length} items identified for cost review`
    );
  }

  // Get last order date
  const lastOrder = await prisma.purchaseOrder.findFirst({
    where: { vendorId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  return {
    vendorId,
    vendorName: deliveryMetrics.vendorName,
    overallScore,
    deliveryScore,
    qualityScore,
    costScore,
    rank: 0, // Will be set when comparing multiple vendors
    totalOrders: deliveryMetrics.totalOrders,
    totalSpend: costMetrics.totalSpend,
    trend:
      deliveryMetrics.reliabilityScore > 0.9 &&
      qualityMetrics.qualityScore > 0.9 &&
      costMetrics.costTrend !== "increasing"
        ? "improving"
        : costMetrics.costTrend === "increasing" ||
          deliveryMetrics.reliabilityScore < 0.7 ||
          qualityMetrics.qualityScore < 0.7
        ? "declining"
        : "stable",
    lastOrderDate: lastOrder?.createdAt ?? null,
    riskLevel,
    recommendations,
  };
}

/**
 * Compare all vendors in a shop and return ranked scorecards
 */
export async function getVendorComparison(
  shopId: string,
  daysBack: number = 365,
): Promise<VendorComparison> {
  logger.info({ shopId, daysBack }, "getVendorComparison: starting");

  const vendors = await prisma.vendor.findMany({
    where: { shopId, isActive: true },
    select: { id: true, name: true },
  });

  const scorecards = await Promise.all(
    vendors.map((v) => getVendorScorecard(v.id, daysBack))
  );

  // Sort by overall score descending
  scorecards.sort((a, b) => b.overallScore - a.overallScore);

  // Assign ranks
  scorecards.forEach((sc, idx) => {
    sc.rank = idx + 1;
  });

  // Calculate savings potential
  const savingsPotential = scorecards.reduce(
    (sum, sc) => sum + sc.recommendations.length * 100, // Simplified
    0
  );

  const comparison: VendorComparison = {
    vendors: scorecards.map((sc) => ({
      vendorId: sc.vendorId,
      vendorName: sc.vendorName,
      onTimeRate: sc.deliveryScore / 100,
      qualityScore: sc.qualityScore / 100,
      averageUnitCost: sc.totalSpend / Math.max(sc.totalOrders, 1),
      reliabilityScore: sc.deliveryScore / 100,
      totalSpend: sc.totalSpend,
      score: sc.overallScore / 100,
    })),
    bestVendor: scorecards[0]?.vendorId ?? "",
    worstVendor: scorecards[scorecards.length - 1]?.vendorId ?? "",
    savingsPotential,
  };

  return comparison;
}

// ---------------------------------------------------------------------------
// Historical Trend Analysis
// ---------------------------------------------------------------------------

export interface VendorTrendPoint {
  period: string; // YYYY-MM
  onTimeRate: number;
  qualityScore: number;
  averageCost: number;
  orderCount: number;
  totalSpend: number;
}

export async function getVendorTrends(
  vendorId: string,
  monthsBack: number = 12,
): Promise<VendorTrendPoint[]> {
  logger.info({ vendorId, monthsBack }, "getVendorTrends: starting");

  const since = new Date();
  since.setMonth(since.getMonth() - monthsBack);

  const purchaseOrders = await prisma.purchaseOrder.findMany({
    where: {
      vendorId,
      status: { in: ["RECEIVED", "PARTIALLY_RECEIVED", "CLOSED"] },
      createdAt: { gte: since },
    },
    include: {
      lineItems: true,
      receivingEvents: true,
    },
  });

  // Group by month
  const monthlyData: Record<
    string,
    {
      orders: typeof purchaseOrders;
      onTime: number;
      total: number;
      qualityIssues: number;
      totalReceived: number;
      totalCost: number;
      totalUnits: number;
    }
  > = {};

  for (const po of purchaseOrders) {
    const monthKey = po.createdAt.toISOString().slice(0, 7); // YYYY-MM
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        orders: [],
        onTime: 0,
        total: 0,
        qualityIssues: 0,
        totalReceived: 0,
        totalCost: 0,
        totalUnits: 0,
      };
    }
    monthlyData[monthKey].orders.push(po);
    monthlyData[monthKey].total++;

    // Check on-time
    if (po.receivedDate && po.expectedDate) {
      const expected = new Date(po.expectedDate);
      const received = new Date(po.receivedDate);
      if (received <= expected) monthlyData[monthKey].onTime++;
    }

    // Calculate costs
    for (const li of po.lineItems) {
      monthlyData[monthKey].totalCost += Number(li.unitCost) * li.quantity;
      monthlyData[monthKey].totalUnits += li.quantity;
    }
  }

  // Build trend points
  const trends: VendorTrendPoint[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().slice(0, 7);

    const data = monthlyData[monthKey] || {
      orders: [],
      onTime: 0,
      total: 0,
      qualityIssues: 0,
      totalReceived: 0,
      totalCost: 0,
      totalUnits: 0,
    };

    trends.push({
      period: monthKey,
      onTimeRate: data.total > 0 ? data.onTime / data.total : 0,
      qualityScore: data.totalReceived > 0
        ? 1 - data.qualityIssues / data.totalReceived
        : 1,
      averageCost: data.totalUnits > 0 ? data.totalCost / data.totalUnits : 0,
      orderCount: data.total,
      totalSpend: data.totalCost,
    });
  }

  return trends;
}