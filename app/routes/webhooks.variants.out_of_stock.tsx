import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/lib/shopify/server";
import { alertQueue } from "~/lib/jobs/queue.server";
import { logger } from "~/lib/logger";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload } = await authenticate.webhook(request);

  if (!shop) {
    return new Response("Unauthorized", { status: 401 });
  }

  const log = logger.child({
    shopDomain: shop,
    topic: "variants/out_of_stock",
    variantId: payload.id,
  });

  // Queue alert for async processing (return 200 immediately)
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

  log.debug("Out-of-stock alert queued for processing");
  return new Response(null, { status: 200 });
};
