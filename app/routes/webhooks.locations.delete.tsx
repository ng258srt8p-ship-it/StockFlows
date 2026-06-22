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
    topic: "locations/delete",
    locationId: payload.id,
  });

  log.info("Location deleted", {
    locationId: payload.id,
    name: payload.name,
  });

  return new Response(null, { status: 200 });
};
