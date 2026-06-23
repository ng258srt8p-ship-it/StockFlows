import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload } = await authenticate.webhook(request);

  if (!shop) {
    return new Response("Unauthorized", { status: 401 });
  }

  const log = logger.child({
    shopDomain: shop,
    topic: "orders/create",
  });

  log.info({
    msg: "Order created",
    orderId: payload.id,
    totalPrice: payload.total_price,
    lineItemsCount: payload.line_items?.length,
  });

  // Record sales movements for each line item to track velocity
  try {
    const shopRecord = await prisma.shop.findUnique({
      where: { shopifyDomain: shop },
    });
    if (!shopRecord) return new Response(null, { status: 200 });

    const lineItems = payload.line_items as Array<{
      variant_id?: number;
      quantity?: number;
      sku?: string;
    }> | undefined;

    if (!lineItems || lineItems.length === 0) {
      return new Response(null, { status: 200 });
    }

    for (const li of lineItems) {
      if (!li.variant_id || !li.quantity) continue;

      const variantId = String(li.variant_id);
      const qty = li.quantity;

      // Find matching inventory item by Shopify variant ID
      const inventoryItem = await prisma.inventoryItem.findFirst({
        where: {
          shopId: shopRecord.id,
          shopifyVariantId: variantId,
        },
      });

      if (inventoryItem) {
        // Decrease stock
        const newQty = Math.max(0, inventoryItem.quantity - qty);
        await prisma.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            quantity: newQty,
            available: Math.max(0, newQty - inventoryItem.reserved),
          },
        });

        // Record sale movement
        await prisma.stockMovement.create({
          data: {
            inventoryItemId: inventoryItem.id,
            locationId: inventoryItem.locationId,
            type: "SALE",
            quantityChange: -qty,
            reference: `order-${payload.id}`,
            notes: `Order #${payload.id}`,
          },
        });
      }
    }
  } catch (error) {
    log.error({ err: error }, "Failed to record order sales movements");
  }

  return new Response(null, { status: 200 });
};
