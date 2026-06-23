/**
 * Billing configuration and helpers for the Shopify Embedded App Billing API.
 *
 * Defines plan tiers, checks active subscriptions, and initiates
 * upgrade flows via Shopify's hosted billing pages.
 *
 * Usage:
 *   import { BILLING_PLANS, getCurrentPlan, hasFeatureAccess } from "~/lib/shopify/billing";
 */

import type { Session } from "@shopify/shopify-api";
import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BillingPlan {
  /** Display name shown in the admin. */
  name: string;
  /** Monthly price in USD. */
  price: number;
  /** Shopify plan handle (used in confirmationUrl / subscriptions). */
  planHandle: string;
  /** Price as a minor-unit string (Shopify uses "1900" for $19.00). */
  priceAmount: string;
  /** Three-letter currency code. */
  currencyCode: string;
}

export type FeatureName =
  | "basic_inventory"
  | "low_stock_alerts"
  | "multi_location"
  | "demand_forecasting"
  | "purchase_orders"
  | "barcode_scanning"
  | "csv_export"
  | "advanced_analytics"
  | "api_access"
  | "priority_support"
  | "custom_integrations"
  | "bulk_operations"
  | "audit_log";

export type PlanName = (typeof BILLING_PLANS)[number]["name"];

// ---------------------------------------------------------------------------
// Plan definitions
// ---------------------------------------------------------------------------

export const BILLING_PLANS: BillingPlan[] = [
  {
    name: "Free",
    price: 0,
    planHandle: "free",
    priceAmount: "0",
    currencyCode: "USD",
  },
  {
    name: "Starter",
    price: 19,
    planHandle: "starter",
    priceAmount: "1900",
    currencyCode: "USD",
  },
  {
    name: "Pro",
    price: 49,
    planHandle: "pro",
    priceAmount: "4900",
    currencyCode: "USD",
  },
  {
    name: "Enterprise",
    price: 149,
    planHandle: "enterprise",
    priceAmount: "14900",
    currencyCode: "USD",
  },
];

// ---------------------------------------------------------------------------
// Feature access matrix
// ---------------------------------------------------------------------------

const PLAN_FEATURES: Record<PlanName, FeatureName[]> = {
  Free: [
    "basic_inventory",
    "csv_export",
  ],
  Starter: [
    "basic_inventory",
    "low_stock_alerts",
    "multi_location",
    "barcode_scanning",
    "csv_export",
  ],
  Pro: [
    "basic_inventory",
    "low_stock_alerts",
    "multi_location",
    "demand_forecasting",
    "purchase_orders",
    "barcode_scanning",
    "csv_export",
    "advanced_analytics",
    "api_access",
    "bulk_operations",
    "audit_log",
  ],
  Enterprise: [
    "basic_inventory",
    "low_stock_alerts",
    "multi_location",
    "demand_forecasting",
    "purchase_orders",
    "barcode_scanning",
    "csv_export",
    "advanced_analytics",
    "api_access",
    "priority_support",
    "custom_integrations",
    "bulk_operations",
    "audit_log",
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const log = logger.child({ module: "shopify/billing" });

function findPlanByName(planName: string): BillingPlan | undefined {
  return BILLING_PLANS.find(
    (p) => p.name.toLowerCase() === planName.toLowerCase()
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/**
 * Look up the current billing plan for a shop.
 *
 * Checks the local `Shop` model for the plan field. If a plan record exists
 * in the `Subscription` table, that takes precedence.
 *
 * @param session - Active Shopify session.
 * @returns       - The current billing plan definition.
 */
export async function getCurrentPlan(
  session: Session
): Promise<BillingPlan> {
  const shop = session.shop;
  const logCtx = log.child({ shop });

  // 1. Check for an active subscription in the database
  // Note: Subscription model will be added when billing is activated.
  // Currently the app is free during development.
  const subscription = await (prisma as any).subscription?.findFirst({
    where: {
      shop: { shopifyDomain: shop },
      status: "active",
    },
    orderBy: { createdAt: "desc" },
  }).catch(() => null);

  if (subscription) {
    const plan = findPlanByName(subscription.planName ?? "");
    if (plan) {
      logCtx.debug({ plan: plan.name }, "Found active subscription");
      return plan;
    }
  }

  // 2. Fall back to the shop's stored plan name
  const shopRecord = await prisma.shop.findUnique({
    where: { shopifyDomain: shop },
  }).catch(() => null);

  if (shopRecord && (shopRecord as any).plan) {
    const plan = findPlanByName((shopRecord as any).plan);
    if (plan) {
      logCtx.debug({ plan: plan.name }, "Using shop-level plan");
      return plan;
    }
  }

  // 3. Default to Free
  logCtx.debug("No subscription found — defaulting to Free");
  return BILLING_PLANS[0];
}

/**
 * Initiate a plan upgrade by creating a Shopify billing session.
 *
 * Returns the confirmation URL that the frontend should redirect to
 * (Shopify will host the payment page).
 *
 * @param session  - Active Shopify session.
 * @param planName - Target plan name (must match a key in BILLING_PLANS).
 * @returns        - Redirect URL for Shopify billing confirmation.
 */
export async function requestPlanUpgrade(
  session: Session,
  planName: string
): Promise<string> {
  const shop = session.shop;
  const logCtx = log.child({ shop, planName });

  const plan = findPlanByName(planName);
  if (!plan) {
    throw new Error(`Unknown billing plan: ${planName}`);
  }

  if (plan.price === 0) {
    throw new Error("Cannot purchase the Free plan — it is already active by default");
  }

  logCtx.info({ plan: plan.name, price: plan.price }, "Creating billing session");

  // Use Shopify's hosted billing API via a GraphQL mutation.
  // The app must have the `write_products` scope for app subscriptions.
  const MUTATION = `
    mutation appSubscriptionCreate(
      $name: String!
      $lineItems: [AppSubscriptionLineItemInput!]!
      $returnUrl: String!
    ) {
      appSubscriptionCreate(
        name: $name
        lineItems: $lineItems
        returnUrl: $returnUrl
        test: ${process.env.NODE_ENV !== "production" ? "true" : "false"}
      ) {
        appSubscription {
          id
          name
          status
        }
        confirmationUrl
        userErrors {
          field
          message
        }
      }
    }
  `;

  const appUrl = process.env.SHOPIFY_APP_URL ?? "https://stockflows.app";
  const returnUrl = `${appUrl}/app/settings/billing?plan=${plan.planHandle}`;

  const response = await fetch(
    `https://${shop}/admin/api/2026-04/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": session.accessToken!,
      },
      body: JSON.stringify({
        query: MUTATION,
        variables: {
          name: `StockFlows ${plan.name}`,
          lineItems: [
            {
              plan: {
                appRecurringPricingDetails: {
                  price: {
                    amount: plan.priceAmount,
                    currencyCode: plan.currencyCode,
                  },
                  interval: "EVERY_30_DAYS",
                },
              },
            },
          ],
          returnUrl,
        },
      }),
    }
  );

  const body = await response.json() as any;
  const result = body.data?.appSubscriptionCreate;

  if (result?.userErrors?.length > 0) {
    const msg = result.userErrors.map((e: any) => e.message).join("; ");
    logCtx.error({ errors: result.userErrors }, "Billing creation failed");
    throw new Error(`Billing creation failed: ${msg}`);
  }

  const confirmationUrl = result?.confirmationUrl;
  if (!confirmationUrl) {
    throw new Error("No confirmation URL returned from Shopify");
  }

  logCtx.info("Billing session created — redirecting to confirmation URL");

  // Persist the pending upgrade so we can activate on callback
  await (prisma as any).subscription?.upsert({
    where: {
      // Use a unique constraint if available; otherwise fall back to createMany logic
      id: `pending-${shop}`,
    },
    update: {
      planName: plan.name,
      status: "pending",
      updatedAt: new Date(),
    },
    create: {
      id: `pending-${shop}`,
      shopId: (await prisma.shop.findUnique({ where: { shopifyDomain: shop } }))?.id ?? "",
      planName: plan.name,
      status: "pending",
      priceAmount: plan.priceAmount,
      currencyCode: plan.currencyCode,
    },
  }).catch((err: any) => {
    logCtx.warn({ err }, "Could not persist pending subscription (table may not exist)");
  });

  return confirmationUrl;
}

/**
 * Check whether a given plan includes a specific feature.
 *
 * @param planName - Plan name (e.g. "Starter", "Pro").
 * @param feature  - Feature identifier.
 * @returns        - `true` if the plan includes the feature.
 */
export function hasFeatureAccess(
  planName: string,
  feature: FeatureName
): boolean {
  const plan = findPlanByName(planName);
  if (!plan) return false;

  const features = PLAN_FEATURES[plan.name as PlanName] ?? [];
  return features.includes(feature);
}

/**
 * Get all features for a plan.
 *
 * @param planName - Plan name.
 * @returns        - Array of feature identifiers.
 */
export function getPlanFeatures(planName: string): FeatureName[] {
  const plan = findPlanByName(planName);
  if (!plan) return [];
  return PLAN_FEATURES[plan.name as PlanName] ?? [];
}
