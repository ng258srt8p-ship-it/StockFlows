import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/lib/shopify/server";
import { inventorySyncQueue } from "~/lib/jobs/queue.server";
import { logger } from "~/lib/logger";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload } = await authenticate.webhook(request);

  if (!shop) {
    return new Response("Unauthorized", { status: 401 });
  }

  const log = logger.child({
    shopDomain: shop,
    topic: "inventory_items/create",
    inventoryItemId: payload.id,
  });

  // Queue for async processing (return 200 immediately)
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

  log.debug("Webhook queued for processing");
  return new Response(null, { status: 200 });
};
