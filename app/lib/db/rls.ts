import { prisma } from "~/lib/db/client";
import { Prisma } from "@prisma/client";
import { logger } from "~/lib/logger";

// ---------------------------------------------------------------------------
// Row-Level Security helpers
// ---------------------------------------------------------------------------

/**
 * Set the PostgreSQL session variable `app.current_shop_id` so that
 * Row-Level Security policies can enforce shop-scoped data access.
 *
 * This runs as a raw SQL command on the existing Prisma client.
 */
export async function setShopContext(shopId: string): Promise<void> {
  try {
    await prisma.$executeRawUnsafe(
      `SET app.current_shop_id = '${shopId}'`,
    );
  } catch (error) {
    logger.error({ err: error, shopId }, "Failed to set RLS shop context");
    throw error;
  }
}

/**
 * Return a Prisma client extension that automatically sets the
 * `app.current_shop_id` session variable before every query.
 *
 * The returned object wraps `prisma` so callers can use it as a drop-in
 * replacement — every query issued through the extended client will first
 * execute `SET app.current_shop_id = '<shopId>'`.
 *
 * @example
 *   const scoped = createShopScopedClient(shopId);
 *   const items = await scoped.inventoryItem.findMany();
 */
export function createShopScopedClient(shopId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          await setShopContext(shopId);
          return query(args);
        },
      },
    },
  });
}
