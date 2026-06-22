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
    topic: "products/update",
    productId: payload.id,
  });

  log.info("Product updated", {
    productId: payload.id,
    title: payload.title,
    variantsCount: payload.variants?.length,
  });

  return new Response(null, { status: 200 });
};
