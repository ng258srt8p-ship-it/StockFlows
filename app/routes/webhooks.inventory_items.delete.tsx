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
    topic: "inventory_items/delete",
    inventoryItemId: payload.id,
  });

  log.info("Inventory item deleted", {
    inventoryItemId: payload.id,
  });

  return new Response(null, { status: 200 });
};
