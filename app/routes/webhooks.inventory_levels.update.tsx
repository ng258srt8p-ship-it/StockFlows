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
    topic: "inventory_levels/update",
    inventoryItemId: payload.inventory_item_id,
  });

  // Queue for async processing (return 200 immediately)
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

  log.debug("Webhook queued for processing");
  return new Response(null, { status: 200 });
};
