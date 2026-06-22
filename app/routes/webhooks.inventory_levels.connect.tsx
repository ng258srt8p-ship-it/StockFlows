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
    topic: "inventory_levels/connect",
    inventoryItemId: payload.inventory_item_id,
  });

  log.info("Inventory level connected", {
    inventoryItemId: payload.inventory_item_id,
    locationId: payload.location_id,
  });

  return new Response(null, { status: 200 });
};
