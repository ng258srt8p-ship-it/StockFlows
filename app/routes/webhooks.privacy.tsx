import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  if (!shop) {
    return new Response("Unauthorized", { status: 401 });
  }

  const log = logger.child({ shopDomain: shop, topic });

  switch (topic) {
    case "customers/data_request": {
      log.info(
        { customerId: payload.customer?.id },
        "Customer data request received"
      );
      break;
    }

    case "customers/redact": {
      log.info(
        { customerId: payload.customer?.id },
        "Customer redaction request received"
      );
      break;
    }

    case "shop/redact": {
      log.info("Shop redaction request received — deleting all data");
      try {
        await prisma.shop.delete({
          where: { shopifyDomain: shop },
        });
      } catch (error) {
        log.error({ err: error }, "Failed to delete shop data");
      }
      break;
    }
  }

  return new Response(null, { status: 200 });
};
