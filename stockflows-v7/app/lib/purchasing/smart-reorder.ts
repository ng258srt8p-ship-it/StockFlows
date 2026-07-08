// ---------------------------------------------------------------------------
// Smart Reorder Engine - Advanced Purchase Order Automation
//
// Combines forecast demand, seasonal patterns, lead time variability, and
// vendor performance to generate intelligent purchase order recommendations
// that go far beyond Shopify's native static reorder-point alerts.
// ---------------------------------------------------------------------------

import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";
import { getCurrentPlan, hasFeatureAccess } from "~/lib/shopify/billing";
import type { Session } from "@shopify/shopify-api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SmartRecomputeResult {
  inventoryItemId: string;
  currentQuantity: number;
  recommendedOrderQty: number;
  orderFrequency: "daily" | "weekly" | "bi-weekly" | "monthly";
  urgency: "critical" | "warning" | "info";
  confidence: number;
  forecastDemand: number;
  leadTimeDays: number;
  safetyStock: number;
  eoq: number;
  reasoning: string;
}

export interface SeasonalAdjustment {
  season: "peak" | "normal" | "low";
  multiplier: number;
  startMonth: number;
  endMonth: number;
  confidence: number;
}

export interface VendorData {
  id: string;
  name: string;
  leadTimeDays: number;
  reliabilityScore: number;
  averageLeadTime: number;
}

// ---------------------------------------------------------------------------
// Core Smart Reorder Engine
// ---------------------------------------------------------------------------

/**
 * Compute intelligent reorder quantities based on multiple data sources.
 */
export async function computeSmartReorders(
  shopId: string,
  session: Session,
  seasonalFactors?: SeasonalAdjustment[],
): Promise<SmartRecomputeResult[]> {
  logger.info({ shopId }, "computeSmartReorders: starting");

  const plan = await getCurrentPlan(session);
  if (!hasFeatureAccess(plan.name, "demand_forecasting")) {
    throw new Error("Demand forecasting feature not available in current plan");
  }

  const items = await prisma.inventoryItem.findMany({
    where: { shopId },
    include: {
      location: true,
      forecasts: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  const vendorData = await getVendorPerformanceData(shopId);

  const seasons: SeasonalAdjustment[] = seasonalFactors || [
    { season: "peak", multiplier: 1.5, startMonth: 10, endMonth: 12, confidence: 0.8 },
    { season: "normal", multiplier: 1.0, startMonth: 1, endMonth: 9, confidence: 0.6 },
    { season: "low", multiplier: 0.7, startMonth: 7, endMonth: 8, confidence: 0.7 },
  ];

  const recommendations: SmartRecomputeResult[] = [];

  for (const item of items) {
    try {
      const rec = computeItemRecommendation(item, vendorData, seasons);
      recommendations.push(rec);
    } catch (error) {
      logger.warn({ itemId: item.id, error }, "Failed to compute recommendation");
    }
  }

  const itemsToReorder = recommendations.filter((r) => r.recommendedOrderQty > 0);

  logger.info(
    { shopId, totalItems: items.length, itemsToReorder: itemsToReorder.length },
    "computeSmartReorders: done",
  );

  return itemsToReorder;
}

// ---------------------------------------------------------------------------
// Per-item recommendation
// ---------------------------------------------------------------------------

export function computeItemRecommendation(
  item: any,
  vendorData: Map<string, VendorData>,
  seasons: SeasonalAdjustment[],
): SmartRecomputeResult {
  const latestForecast = item.forecasts?.[0];
  const forecastDemand = latestForecast
    ? latestForecast.predictedDemand
    : item.quantity * 0.5;

  const currentMonth = new Date().getMonth() + 1;
  const activeSeason = seasons.reduce<SeasonalAdjustment>(
    (best, s) => {
      const active = currentMonth >= s.startMonth && currentMonth <= s.endMonth;
      if (!active) return best;
      return s.confidence > best.confidence ? s : best;
    },
    { multiplier: 1.0, confidence: 0.0, season: "normal", startMonth: 1, endMonth: 1 },
  );

  const seasonalDemand = forecastDemand * activeSeason.multiplier;

  const vendor = item.locationId ? vendorData.get(item.locationId) : undefined;
  const leadTimeDays = vendor ? vendor.leadTimeDays : 7;
  const forecastConfidence = latestForecast ? latestForecast.confidence : 0.5;

  const eoq = calculateEOQ(seasonalDemand, item.costPerUnit || 1, item.reorderPoint || 10);

  const safetyStock = calculateSafetyStock(
    seasonalDemand,
    vendor ? Math.abs(vendor.averageLeadTime - vendor.leadTimeDays) : 3,
    forecastConfidence,
  );

  const baseOrderQty = Math.max(0, seasonalDemand * 1.2 - item.quantity);
  const recommendedOrderQty = Math.max(0, Math.min(baseOrderQty, eoq));
  const urgency = determineUrgency(item, recommendedOrderQty, forecastConfidence);
  const orderFrequency = determineOrderFrequency(seasonalDemand, leadTimeDays);
  const confidence = forecastConfidence * activeSeason.confidence * 0.9;

  const reasoning = generateReasoning(
    item.title, item.sku, item.quantity,
    seasonalDemand, safetyStock, eoq,
    recommendedOrderQty, urgency, forecastConfidence,
  );

  return {
    inventoryItemId: item.id,
    currentQuantity: item.quantity,
    recommendedOrderQty,
    orderFrequency,
    urgency,
    confidence,
    forecastDemand: seasonalDemand,
    leadTimeDays,
    safetyStock,
    eoq,
    reasoning,
  };
}

// ---------------------------------------------------------------------------
// EOQ  –  Economic Order Quantity
// ---------------------------------------------------------------------------

export function calculateEOQ(monthlyDemand: number, unitCost: number, reorderPoint: number): number {
  const annualDemand = monthlyDemand * 12;
  const orderingCost = 25;
  const holdingCost = unitCost * 0.2;
  const eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
  const minOrderQty = Math.max(1, reorderPoint);
  return Math.ceil(Math.max(eoq, minOrderQty) * 1.1);
}

// ---------------------------------------------------------------------------
// Safety Stock
// ---------------------------------------------------------------------------

export function calculateSafetyStock(
  averageDemand: number,
  leadTimeVariability: number,
  forecastConfidence: number,
): number {
  const zScore = 1.65 + forecastConfidence * 0.8;
  const demandVariability = averageDemand * 0.2;
  const raw =
    zScore *
    Math.sqrt(
      leadTimeVariability * demandVariability ** 2 +
        averageDemand ** 2 * leadTimeVariability ** 2,
    );
  const scaled = raw * (0.5 + forecastConfidence);
  return Math.max(1, Math.ceil(scaled * 1.2));
}

// ---------------------------------------------------------------------------
// Urgency & Frequency
// ---------------------------------------------------------------------------

export function determineUrgency(
  item: any,
  recommendedOrderQty: number,
  forecastConfidence: number,
): "critical" | "warning" | "info" {
  if (item.quantity <= 0) return "critical";
  if (item.quantity <= item.reorderPoint && forecastConfidence > 0.8) return "critical";
  if (item.quantity <= item.reorderPoint * 2) return "warning";
  if (recommendedOrderQty > 100) return "warning";
  return "info";
}

export function determineOrderFrequency(
  demand: number,
  _leadTime: number,
): "daily" | "weekly" | "bi-weekly" | "monthly" {
  if (demand > 50) return "weekly";
  if (demand > 20) return "bi-weekly";
  return "monthly";
}

// ---------------------------------------------------------------------------
// Reasoning text
// ---------------------------------------------------------------------------

export function generateReasoning(
  title: string,
  sku: string,
  currentStock: number,
  forecastDemand: number,
  safetyStock: number,
  eoq: number,
  recommendedQty: number,
  urgency: string,
  forecastConfidence: number,
): string {
  const confidencePercent = Math.round(forecastConfidence * 100);
  let r = `${title} (${sku}): `;
  if (recommendedQty <= 0) return r + "Current stock is sufficient based on forecast.";
  r += `Recommend ordering ${recommendedQty} units `;
  if (urgency === "critical") r += "(URGENT - low stock risk). ";
  r += `to cover ${Math.round(forecastDemand)} units demand `;
  if (forecastDemand > 0) r += `plus ${Math.round((safetyStock / forecastDemand) * 100)}% safety stock. `;
  r += `EOQ is ${eoq} units. `;
  if (confidencePercent > 80) r += `High forecast confidence (${confidencePercent}%).`;
  else if (confidencePercent > 60) r += `Moderate forecast confidence (${confidencePercent}%).`;
  else r += `Low forecast confidence (${confidencePercent}%), consider manual review.`;
  return r;
}

// ---------------------------------------------------------------------------
// Vendor performance data
// ---------------------------------------------------------------------------

export async function getVendorPerformanceData(
  shopId: string,
): Promise<Map<string, VendorData>> {
  const vendors = await prisma.vendor.findMany({
    where: { shopId, isActive: true },
  });
  const vendorMap = new Map<string, VendorData>();

  for (const vendor of vendors) {
    const vendorPOs = await prisma.purchaseOrder.findMany({
      where: { shopId, vendorId: vendor.id, status: "RECEIVED" },
      include: { lineItems: true, receivingEvents: true },
    });

    const leadTimes: number[] = [];
    for (const po of vendorPOs) {
      if (po.expectedDate && po.receivedDate) {
        const lt = Math.ceil(
          (po.receivedDate.getTime() - po.expectedDate.getTime()) / 86_400_000,
        );
        if (lt > 0) leadTimes.push(lt);
      }
    }

    const averageLeadTime =
      leadTimes.length > 0
        ? leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length
        : vendor.leadTimeDays || 7;

    const reliabilityScore = calculateVendorReliability(vendorPOs, averageLeadTime);

    vendorMap.set(vendor.id, {
      id: vendor.id,
      name: vendor.name,
      leadTimeDays: vendor.leadTimeDays || Math.round(averageLeadTime),
      reliabilityScore,
      averageLeadTime: Math.round(averageLeadTime),
    });
  }
  return vendorMap;
}

export function calculateVendorReliability(vendorPOs: any[], averageLeadTime: number): number {
  if (vendorPOs.length === 0) return 50;
  let score = 100;
  for (const po of vendorPOs) {
    if (po.expectedDate && po.receivedDate) {
      const actual = Math.ceil(
        (po.receivedDate.getTime() - po.expectedDate.getTime()) / 86_400_000,
      );
      if (actual > 5) score -= 20;
      if (averageLeadTime > 0) {
        const penalty = (Math.abs(actual - averageLeadTime) / averageLeadTime) * 10;
        score -= Math.min(penalty, 15);
      }
    }
    if (po.status === "CANCELLED") score -= 30;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

// ---------------------------------------------------------------------------
// Create draft POs from recommendations
// ---------------------------------------------------------------------------

export async function createSmartPOs(
  shopId: string,
  createdBy: string,
  recommendations: SmartRecomputeResult[],
): Promise<any[]> {
  logger.info({ shopId, count: recommendations.length }, "createSmartPOs: starting");

  if (recommendations.length === 0) return [];

  const locationGroups = new Map<string, SmartRecomputeResult[]>();

  const inventoryItems = await prisma.inventoryItem.findMany({
    where: { shopId },
    select: { id: true, locationId: true },
  });

  const itemToLocation = new Map<string, string>();
  for (const item of inventoryItems) itemToLocation.set(item.id, item.locationId);

  for (const rec of recommendations) {
    const locationId = itemToLocation.get(rec.inventoryItemId);
    if (!locationId) continue;
    const group = locationGroups.get(locationId) || [];
    group.push(rec);
    locationGroups.set(locationId, group);
  }

  const results: any[] = [];

  for (const [locationId, group] of locationGroups) {
    if (group.length === 0) continue;
    try {
      const vendor = await findBestVendorForLocation(shopId, locationId);
      if (!vendor) continue;

      const poCount = await prisma.purchaseOrder.count({ where: { shopId } });
      const poNumber = `SMART-${String(poCount + 1).padStart(4, "0")}`;

      const lineItems = group.map((rec) => ({
        inventoryItemId: rec.inventoryItemId,
        quantity: rec.recommendedOrderQty,
        unitCost: 0,
        notes: `Smart reorder: ${rec.reasoning}`,
      }));

      const { createPO } = await import("~/lib/purchasing/service");
      const po = await createPO({
        shopId,
        vendorId: vendor.id,
        locationId,
        poNumber,
        lineItems,
        notes: `Auto-generated via Smart Reorder System\n${group.length} items from ${recommendations.length} total recommendations`,
        createdBy,
      });

      if (po) {
        results.push({
          poId: po.id,
          poNumber: po.poNumber,
          locationId,
          vendorId: vendor.id,
          vendorName: vendor.name,
          itemCount: group.length,
          totalUnits: group.reduce((s, r) => s + r.recommendedOrderQty, 0),
          status: po.status,
        });
      }
    } catch (error) {
      logger.error({ locationId, error }, "Failed to create smart PO");
    }
  }

  logger.info({ shopId, poCount: results.length }, "createSmartPOs: done");
  return results;
}

export async function findBestVendorForLocation(shopId: string, locationId: string): Promise<any> {
  const vendors = await prisma.vendor.findMany({ where: { shopId, isActive: true } });
  if (vendors.length === 0) return null;

  let bestVendor: any = null;
  let bestScore = -1;

  for (const vendor of vendors) {
    const pos = await prisma.purchaseOrder.findMany({
      where: { shopId, vendorId: vendor.id, locationId, status: "RECEIVED" },
      select: { id: true },
    });

    const reliability = vendor.reliabilityScore || 50;
    const calculatedScore =
      pos.length === 0
        ? reliability
        : reliability * 0.7 + Math.min(pos.length / 10, 1) * 30;

    if (calculatedScore > bestScore) {
      bestScore = calculatedScore;
      bestVendor = vendor;
    }
  }

  return bestVendor;
}
