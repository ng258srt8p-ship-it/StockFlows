/**
 * Authentication and authorization middleware for StockFlows routes.
 *
 * Reference: Research.md section 46.
 *
 * `requirePermission` does three things in order:
 *   1. Authenticates the request via Shopify admin auth.
 *   2. Looks up the StockFlows `User` record by Shopify user ID.
 *   3. Checks that the user's role grants the requested permission.
 *
 * Throws a `Response` with status 403 if the user lacks the permission,
 * or 404 if the user record does not exist.
 */

import { json } from "@remix-run/node";

import { prisma } from "~/lib/db/client";
import {
  type Permission,
  type UserRole,
  roleHasPermission,
} from "~/lib/auth/permissions";
import { authenticate } from "~/lib/shopify/server";
import { logger } from "~/lib/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthenticatedUser {
  id: string;
  shopId: string;
  shopifyUserId: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedContext {
  admin: any;
  user: AuthenticatedUser;
  shopId: string;
}

// ---------------------------------------------------------------------------
// Permission error (403)
// ---------------------------------------------------------------------------

function throwForbidden(permission: Permission, role: UserRole): never {
  logger.warn({ permission, role }, "Permission denied");
  throw json(
    {
      error: "Forbidden",
      message: `Your role (${role}) does not have the "${permission}" permission.`,
    },
    { status: 403 },
  );
}

// ---------------------------------------------------------------------------
// requirePermission
// ---------------------------------------------------------------------------

/**
 * Authenticates the incoming request, resolves the StockFlows user record,
 * and verifies the user has the required permission.
 *
 * @param request  The incoming Remix request.
 * @param permission  The permission the route requires.
 * @returns  An `AuthenticatedContext` that downstream code can use.
 *
 * @example
 *   export async function loader({ request }: LoaderFunctionArgs) {
 *     const ctx = await requirePermission(request, Permission.INVENTORY_WRITE);
 *     // ctx.user, ctx.admin, ctx.shopId are all available
 *     ...
 *   }
 */
export async function requirePermission(
  request: Request,
  permission: Permission,
): Promise<AuthenticatedContext> {
  // Step 1 -- Shopify authentication.
  const { admin, session } = await authenticate.admin(request);

  // Step 2 -- Resolve the StockFlows user.
  // When using online tokens the session's `onlineAccessInfo` contains the
  // Shopify user ID.  When offline tokens are used (background jobs) we fall
  // back to finding any OWNER for the shop.
  const shopifyUserId =
    (session as any).onlineAccessInfo?.id?.toString() ?? null;

  let user;

  if (shopifyUserId) {
    const shop = await prisma.shop.findUnique({
      where: { shopifyDomain: session.shop },
    });

    if (!shop) {
      throw json(
        { error: "Not Found", message: "Shop not found." },
        { status: 404 },
      );
    }

    user = await prisma.user.findUnique({
      where: {
        shopId_shopifyUserId: {
          shopId: shop.id,
          shopifyUserId,
        },
      },
    });
  }

  // Fallback for background jobs / offline tokens -- pick the OWNER.
  if (!user) {
    const shop = await prisma.shop.findUnique({
      where: { shopifyDomain: session.shop },
    });

    if (shop) {
      user = await prisma.user.findFirst({
        where: { shopId: shop.id, role: "OWNER" },
      });
    }
  }

  if (!user) {
    throw json(
      {
        error: "Not Found",
        message:
          "No StockFlows user is associated with this Shopify account. " +
          "Please ask an admin to invite you.",
      },
      { status: 404 },
    );
  }

  // Step 3 -- Authorization check.
  if (!roleHasPermission(user.role as UserRole, permission)) {
    throwForbidden(permission, user.role as UserRole);
  }

  return {
    admin,
    user: {
      id: user.id,
      shopId: user.shopId,
      shopifyUserId: user.shopifyUserId,
      email: user.email,
      role: user.role as UserRole,
    },
    shopId: user.shopId,
  };
}
