import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/lib/shopify/server";
import { logger } from "~/lib/logger";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload } = await authenticate.webhook(request);

  if (!shop) {
    return new Response("Unauthorized", { status: 401 });
  }

  const log = logger.child({
    shopDomain: shop,
    topic: "variants/in_stock",
    variantId: payload.id,
  });

  log.info({
    msg: "Variant back in stock",
    variantId: payload.id,
    title: payload.title,
    inventoryQuantity: payload.inventory_quantity,
  });

  return new Response(null, { status: 200 });
};
