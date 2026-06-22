import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/lib/shopify/server";
import { inventorySyncQueue } from "~/lib/jobs/queue.server";
import { alertQueue } from "~/lib/jobs/queue.server";
import { logger } from "~/lib/logger";

type WebhookHandler = (shop: string, payload: any) => Promise<void>;

/**
 * Unified webhook endpoint that routes all topics based on the X-Shopify-Topic header.
 * This is an alternative to the file-based per-topic webhook routes.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload } = await authenticate.webhook(request);

  if (!shop) {
    return new Response("Unauthorized", { status: 401 });
  }

  const topic = request.headers.get("X-Shopify-Topic") ?? "unknown";

  const log = logger.child({
    shopDomain: shop,
    topic,
    endpoint: "unified-webhook",
  });

  log.info("Unified webhook received", {
    topic,
  });

  try {
    const handler = ROUTE_TABLE[topic];
    if (handler) {
      await handler(shop, payload);
    } else {
      log.warn("No handler registered for topic", { topic });
    }
  } catch (error) {
    log.error({ err: error, topic }, "Error processing webhook");
  }

  return new Response(null, { status: 200 });
};

// ---------------------------------------------------------------------------
// Topic -> handler mapping
// ---------------------------------------------------------------------------

const inventoryLevelsHandler: WebhookHandler = async (shop, payload) => {
  await inventorySyncQueue.add(
    "webhook-inventory-update",
    {
      shopDomain: shop,
      changes: [
        {
          inventoryItemId: String(payload.inventory_item_id),
          locationId: String(payload.location_id),
          available: Number(payload.available),
        },
      ],
    },
    {
      jobId: `wh-inv-update-${payload.inventory_item_id}-${payload.location_id}-${Date.now()}`,
    }
  );
};

const inventoryItemsCreateHandler: WebhookHandler = async (shop, payload) => {
  await inventorySyncQueue.add(
    "webhook-inventory-item-create",
    {
      shopDomain: shop,
      inventoryItem: {
        id: String(payload.id),
        sku: payload.sku,
        barcode: payload.barcode,
        title: payload.title,
        costPerUnit: payload.cost,
      },
    },
    {
      jobId: `wh-inv-item-create-${payload.id}-${Date.now()}`,
    }
  );
};

const inventoryItemsUpdateHandler: WebhookHandler = async (shop, payload) => {
  await inventorySyncQueue.add(
    "webhook-inventory-item-update",
    {
      shopDomain: shop,
      inventoryItem: {
        id: String(payload.id),
        sku: payload.sku,
        barcode: payload.barcode,
        title: payload.title,
        costPerUnit: payload.cost,
      },
    },
    {
      jobId: `wh-inv-item-update-${payload.id}-${Date.now()}`,
    }
  );
};

const variantsOutOfStockHandler: WebhookHandler = async (shop, payload) => {
  await alertQueue.add(
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
      jobId: `wh-oos-${payload.id}-${Date.now()}`,
    }
  );
};

const passThroughHandler: WebhookHandler = async (_shop, _payload) => {
  // Logged at the top level; no further processing needed.
};

const ROUTE_TABLE: Record<string, WebhookHandler> = {
  "inventory_levels/connect": passThroughHandler,
  "inventory_levels/disconnect": passThroughHandler,
  "inventory_levels/update": inventoryLevelsHandler,
  "inventory_items/create": inventoryItemsCreateHandler,
  "inventory_items/update": inventoryItemsUpdateHandler,
  "inventory_items/delete": passThroughHandler,
  "variants/in_stock": passThroughHandler,
  "variants/out_of_stock": variantsOutOfStockHandler,
  "locations/create": passThroughHandler,
  "locations/update": passThroughHandler,
  "locations/delete": passThroughHandler,
  "orders/create": passThroughHandler,
  "orders/updated": passThroughHandler,
  "products/create": passThroughHandler,
  "products/update": passThroughHandler,
};
