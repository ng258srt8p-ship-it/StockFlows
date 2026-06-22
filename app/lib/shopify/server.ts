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
  LATEST_API_VERSION,
  shopifyApp,
  DeliveryMethod,
} from "@shopify/shopify-app-remix/server";
import type { SessionStorage } from "@shopify/shopify-app-session-storage";
import { Session } from "@shopify/shopify-api";

import { prisma as db } from "~/lib/db/client";

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
  apiVersion: LATEST_API_VERSION,
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
  },

  hooks: {
    afterAuth: async ({ session }) => {
      // Register webhooks after merchant installs / reinstalls the app.
      await shopify.registerWebhooks({ session });
    },
  },
});

export default shopify;
export const { authenticate, addDocumentResponseHeaders } = shopify;
