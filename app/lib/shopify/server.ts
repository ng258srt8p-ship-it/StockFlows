/**
 * Shopify app server setup.
 *
 * Configures `@shopify/shopify-app-remix` with a Prisma-backed session
 * storage adapter and the authenticated-admin pattern.
 *
 * Usage in routes:
 *   import { authenticate } from "~/lib/shopify/server";
 *   const { admin, session } = await authenticate.admin(request);
 */

import "@shopify/shopify-api/adapters/web-api";

import {
  ApiVersion,
  shopifyApp,
  DeliveryMethod,
} from "@shopify/shopify-app-remix/server";
import type { SessionStorage } from "@shopify/shopify-app-session-storage";
import { Session } from "@shopify/shopify-api";

import { prisma as db } from "~/lib/db/client";
import { logger } from "~/lib/logger";
import { syncInitialData } from "./initial-sync";

// ---------------------------------------------------------------------------
// Prisma Session Storage adapter
// Implements the SessionStorage interface from
// @shopify/shopify-app-session-storage using the existing `Session` model.
// ---------------------------------------------------------------------------

interface PrismaSessionRow {
  id: string;
  shopId: string;
  shopifyDomain: string;
  accessToken: string;
  expires: Date | null;
}

function toSession(row: PrismaSessionRow): Session {
  const session = new Session({
    id: row.id,
    shop: row.shopifyDomain,
    accessToken: row.accessToken,
    isOnline: true,
    state: "active",
    expires: row.expires ?? undefined,
  });
  return session;
}

class PrismaSessionStorage implements SessionStorage {
  async storeSession(session: Session): Promise<boolean> {
    // Ensure the shop exists before storing a session.
    const shop = await db.shop.upsert({
      where: { shopifyDomain: session.shop ?? "" },
      update: { accessToken: session.accessToken },
      create: {
        shopifyDomain: session.shop ?? "",
        accessToken: session.accessToken ?? "",
      },
    });

    await db.session.upsert({
      where: { id: session.id },
      update: {
        accessToken: session.accessToken ?? "",
        expires: session.expires ? new Date(session.expires) : null,
      },
      create: {
        id: session.id,
        shopId: shop.id,
        shopifyDomain: session.shop ?? "",
        accessToken: session.accessToken ?? "",
        expires: session.expires ? new Date(session.expires) : null,
      },
    });

    return true;
  }

  async loadSession(id: string): Promise<Session | undefined> {
    const row = await db.session.findUnique({ where: { id } });
    if (!row) return undefined;
    return toSession(row);
  }

  async deleteSession(id: string): Promise<boolean> {
    await db.session.deleteMany({ where: { id } });
    return true;
  }

  async deleteSessions(ids: string[]): Promise<boolean> {
    await db.session.deleteMany({ where: { id: { in: ids } } });
    return true;
  }

  async findSessionsByShop(shop: string): Promise<Session[]> {
    const rows = await db.session.findMany({
      where: { shopifyDomain: shop },
    });
    return rows.map(toSession);
  }
}

// ---------------------------------------------------------------------------
// Shopify app instance
// ---------------------------------------------------------------------------

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: (process.env.SCOPES ?? "").split(","),
  appUrl: process.env.SHOPIFY_APP_URL!,
  sessionStorage: new PrismaSessionStorage(),
  useOnlineTokens: true,
  isEmbeddedApp: true,
  apiVersion: '2026-07',
  authPathPrefix: "/auth",

  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    INVENTORY_LEVELS_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    INVENTORY_LEVELS_CONNECT: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    INVENTORY_LEVELS_DISCONNECT: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    INVENTORY_ITEMS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    INVENTORY_ITEMS_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    INVENTORY_ITEMS_DELETE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    VARIANTS_IN_STOCK: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    VARIANTS_OUT_OF_STOCK: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    LOCATIONS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    LOCATIONS_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    LOCATIONS_DELETE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    PRODUCTS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    PRODUCTS_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    ORDERS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    ORDERS_UPDATED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },

  hooks: {
    afterAuth: async ({ session, admin }) => {
      console.log("[shopify.server] Starting afterAuth hook for shop:", session.shop);

      // Register webhooks after merchant installs / reinstalls the app.
      console.log("[shopify.server] Registering webhooks for shop:", session.shop);
      await shopify.registerWebhooks({ session });

      // Trigger initial data sync for new installs - ADD DEBUG LOGGING
      try {
        console.log("[shopify.server] Calling syncInitialData for shop:", session.shop);
        const result = await syncInitialData(
          session.shop,
          session.accessToken!,
        );
        console.log("[shopify.server] Sync result:", JSON.stringify(result, null, 2));
        logger.info(
          { shop: session.shop, result },
          "Initial data sync completed",
        );
      } catch (error) {
        console.log("[shopify.server] ERROR in syncInitialData for shop:", session.shop);
        console.log("[shopify.server] Error details:", error);
        logger.error(
          { shop: session.shop, error },
          "Initial data sync failed (non-blocking)",
        );
      }
    },
  },
});

export default shopify;
export const { authenticate, addDocumentResponseHeaders } = shopify;

// Export syncInitialData function for use in API routes
export { syncInitialData }; // Add this export