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
    topic: "orders/create",
    orderId: payload.id,
  });

  log.info("Order created", {
    orderId: payload.id,
    totalPrice: payload.total_price,
    lineItemsCount: payload.line_items?.length,
  });

  return new Response(null, { status: 200 });
};
