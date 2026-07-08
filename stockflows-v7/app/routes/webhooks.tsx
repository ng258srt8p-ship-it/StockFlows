/**
 * Catch-all webhook endpoint.
 *
 * Shopify delivers ALL webhook POSTs here because `shopify.app.toml` sets
 *   uri = "https://stockflows.app/webhooks"
 *
 * We HMAC-validate every request and return 401 on failure, then route by
 * the X-Shopify-Topic header to the appropriate handler.
 *
 * This replaces the per-topic route files (webhooks.{topic}.tsx) which match
 * paths like /webhooks/{topic} — paths Shopify never sends to.
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";
import { syncInitialData } from "~/lib/shopify/initial-sync";
import { toInventoryItemGid, toLocationGid } from "~/lib/shopify/id-normalize";

// Manual re-sync endpoint: GET /webhooks?resync=true&shop=stockflows2.myshopify.com

// Lazy queue imports — avoid connecting to Redis at module load time
// (the Queue/Worker constructors connect eagerly).
async function getInventorySyncQueue() {
  if (!process.env.REDIS_HOST && !process.env.REDIS_URL) return null;
  const { inventorySyncQueue } = await import("~/lib/jobs/queue.server");
  return inventorySyncQueue;
}
async function getAlertQueue() {
  if (!process.env.REDIS_HOST && !process.env.REDIS_URL) return null;
  const { alertQueue } = await import("~/lib/jobs/queue.server");
  return alertQueue;
}

interface WebhookLogger {
  info: (msgOrObj: string | object, msg?: string) => void;
  warn: (msgOrObj: string | object, msg?: string) => void;
  error: (msgOrObj: string | object, msg?: string) => void;
  debug: (msgOrObj: string | object, msg?: string) => void;
}

type WebhookHandler = (
  shop: string,
  payload: Record<string, unknown>,
  log: WebhookLogger,
) => Promise<void>;

// ---------------------------------------------------------------------------
// Loader — Manual re-sync endpoint: GET /webhooks?resync=true&shop=stockflows2.myshopify.com
// ---------------------------------------------------------------------------

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  // Manual re-sync endpoint: GET /webhooks?resync=true&shop=stockflows2.myshopify.com
  if (url.searchParams.get("resync") === "true") {
    const shopDomain = url.searchParams.get("shop");
    if (!shopDomain) {
      return new Response("Missing shop parameter", { status: 400 });
    }

    try {
      const { session } = await authenticate.admin(request);

      if (!session || session.shop !== shopDomain) {
        return new Response("Unauthorized - invalid session", { status: 401 });
      }

      const result = await syncInitialData(shopDomain, session.accessToken!);
      return json({ success: true, result });
    } catch (error: any) {
      // If authenticate.admin throws/returns a redirect Response (302), it means no valid session
      if (error instanceof Response) {
        if (error.status === 302) {
          return new Response("Unauthorized - authentication required", { status: 401 });
        }
        if (error.status === 410) {
          return json({ success: false, error: "Shop not installed - no valid session found. Please install the app first." }, { status: 401 });
        }
        // Other response errors (401, etc.)
        return json({ success: false, error: `Authentication failed: ${error.status} ${error.statusText}` }, { status: 500 });
      }
      return json({ success: false, error: error.message ?? String(error) }, { status: 500 });
    }
  }

  // Reject GET requests (webhooks are POST-only)
  return new Response("Method Not Allowed", { status: 405 });
};

// ---------------------------------------------------------------------------
// Action — entry point for every webhook delivery
// ---------------------------------------------------------------------------

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload } = await authenticate.webhook(request);

  // Return 401 when HMAC validation fails — this is what Shopify expects.
  if (!shop) {
    return new Response("Unauthorized", { status: 401 });
  }

  const topic: string = request.headers.get("X-Shopify-Topic") ?? "unknown";
  const log = logger.child({ shopDomain: shop, topic, endpoint: "webhooks" });

  log.info({ topic }, "Webhook received");

  try {
    const handler = ROUTE_TABLE[topic];
    if (handler) {
      await handler(shop, payload, log);
    } else {
      log.warn({ topic }, "No handler registered for this topic");
    }
  } catch (error) {
    log.error({ err: error, topic }, "Error processing webhook");
  }

  return new Response(null, { status: 200 });
};

// ---------------------------------------------------------------------------
// Handler implementations
// ---------------------------------------------------------------------------

// --- Inventory levels ---

const inventoryLevelsUpdateHandler: WebhookHandler = async (shop, payload, log) => {
  await (await getInventorySyncQueue())?.add(
    "webhook-inventory-update",
    {
      shopDomain: shop,
      changes: [
        {
          inventoryItemId: toInventoryItemGid(String(payload.inventory_item_id)),
          locationId: toLocationGid(String(payload.location_id)),
          available: Number(payload.available),
        },
      ],
    },
    {
      jobId: `wh-inv-update-${String(payload.inventory_item_id)}-${String(payload.location_id)}-${Date.now()}`,
    },
  );
  log.debug("inventory_levels/update queued");
};

const passThroughHandler: WebhookHandler = async (shop, payload, log) => {
  log.info({ topic: "pass-through" }, "Webhook received (pass-through handler — no further processing)");
};

// --- Inventory items ---

const inventoryItemsCreateHandler: WebhookHandler = async (shop, payload, log) => {
  await (await getInventorySyncQueue())?.add(
    "webhook-inventory-item-create",
    {
      shopDomain: shop,
      inventoryItem: {
        id: toInventoryItemGid(String(payload.id)),
        sku: payload.sku,
        barcode: payload.barcode,
        title: payload.title,
        costPerUnit: payload.cost,
      },
    },
    {
      jobId: `wh-inv-item-create-${String(payload.id)}-${Date.now()}`,
    },
  );
  log.debug("inventory_items/create queued");
};

const inventoryItemsUpdateHandler: WebhookHandler = async (shop, payload, log) => {
  await (await getInventorySyncQueue())?.add(
    "webhook-inventory-item-update",
    {
      shopDomain: shop,
      inventoryItem: {
        id: toInventoryItemGid(String(payload.id)),
        sku: payload.sku,
        barcode: payload.barcode,
        title: payload.title,
        costPerUnit: payload.cost,
      },
    },
    {
      jobId: `wh-inv-item-update-${String(payload.id)}-${Date.now()}`,
    },
  );
  log.debug("inventory_items/update queued");
};

// --- Variants ---

const variantsOutOfStockHandler: WebhookHandler = async (shop, payload, log) => {
  await (await getAlertQueue())?.add(
    "variant-out-of-stock",
    {
      shopDomain: shop,
      variant: {
        id: String(payload.id),
        title: payload.title,
        productId: String(payload.product_id),
        sku: payload.sku,
        inventoryQuantity: payload.inventory_quantity,
      },
    },
    {
      jobId: `wh-oos-${String(payload.id)}-${Date.now()}`,
    },
  );
  log.debug("variants/out_of_stock alert queued");
};

// --- Orders ---

const ordersCreateHandler: WebhookHandler = async (shop, payload, log) => {
  const shopRecord = await prisma.shop.findUnique({
    where: { shopifyDomain: shop },
  });
  if (!shopRecord) {
    log.warn("Shop not found in database — skipping order processing");
    return;
  }

  const lineItems = payload.line_items as
    | Array<{ variant_id?: number; quantity?: number; sku?: string }>
    | undefined;

  if (!lineItems || lineItems.length === 0) return;

  for (const li of lineItems) {
    if (!li.variant_id || !li.quantity) continue;

    const variantId = toInventoryItemGid(String(li.variant_id));
    const qty = li.quantity;

    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        shopId: shopRecord.id,
        shopifyVariantId: variantId,
      },
    });

    if (inventoryItem) {
      const newQty = Math.max(0, inventoryItem.quantity - qty);
      await prisma.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: {
          quantity: newQty,
          available: Math.max(0, newQty - inventoryItem.reserved),
        },
      });

      await prisma.stockMovement.create({
        data: {
          inventoryItemId: inventoryItem.id,
          locationId: inventoryItem.locationId,
          type: "SALE",
          quantityChange: -qty,
          reference: `order-${String(payload.id)}`,
          notes: `Order #${String(payload.id)}`,
        },
      });
    }
  }

  log.info(
    { orderId: payload.id, lineItemsCount: lineItems.length },
    "Order sales movements recorded",
  );
};

// --- App lifecycle ---

const appUninstalledHandler: WebhookHandler = async (shop, _payload, log) => {
  log.info("App uninstalling — logging event but keeping data for reinstall");
  // DON'T delete the shop record — it will be re-linked on reinstall.
  // The afterAuth hook will handle re-syncing data.
};

// --- Privacy / GDPR ---

const customersDataRequestHandler: WebhookHandler = async (shop, payload, log) => {
  log.info(
    { customerId: (payload as any).customer?.id },
    "Customer data request received",
  );
};

const customersRedactHandler: WebhookHandler = async (shop, payload, log) => {
  log.info(
    { customerId: (payload as any).customer?.id },
    "Customer redaction request received",
  );
};

const shopRedactHandler: WebhookHandler = async (shop, _payload, log) => {
  log.info("Shop redaction request received — deleting all data");
  try {
    await prisma.shop.delete({
      where: { shopifyDomain: shop },
    });
    log.info("Shop data deleted successfully");
  } catch (error) {
    log.error({ err: error }, "Failed to delete shop data");
  }
};

// ---------------------------------------------------------------------------
// Topic routing table
// Must cover every topic listed in shopify.app.toml [[webhooks.subscriptions]]
// and compliance_topics.
// ---------------------------------------------------------------------------

const ROUTE_TABLE: Record<string, WebhookHandler> = {
  "inventory_levels/update": inventoryLevelsUpdateHandler,
  "inventory_levels/connect": passThroughHandler,
  "inventory_levels/disconnect": passThroughHandler,
  "inventory_items/create": inventoryItemsCreateHandler,
  "inventory_items/update": inventoryItemsUpdateHandler,
  "inventory_items/delete": passThroughHandler,
  "variants/in_stock": passThroughHandler,
  "variants/out_of_stock": variantsOutOfStockHandler,
  "locations/create": passThroughHandler,
  "locations/update": passThroughHandler,
  "locations/delete": passThroughHandler,
  "products/create": passThroughHandler,
  "products/update": passThroughHandler,
  "orders/create": ordersCreateHandler,
  "orders/updated": passThroughHandler,
  "app/uninstalled": appUninstalledHandler,
  // GDPR / compliance topics
  "customers/data_request": customersDataRequestHandler,
  "customers/redact": customersRedactHandler,
  "shop/redact": shopRedactHandler,
};
