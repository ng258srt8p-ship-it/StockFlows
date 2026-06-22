import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop } = await authenticate.webhook(request);

  if (!shop) {
    return new Response("Unauthorized", { status: 401 });
  }

  const log = logger.child({ shopDomain: shop, action: "uninstall" });
  log.info("App uninstalling — cleaning up data");

  try {
    // Delete shop — cascading deletes handle all related data
    await prisma.shop.delete({
      where: { shopifyDomain: shop },
    });

    log.info("All data cleaned up successfully");
  } catch (error) {
    log.error({ err: error }, "Failed to clean up on uninstall");
  }

  return new Response(null, { status: 200 });
};
