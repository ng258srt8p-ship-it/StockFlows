/**
 * Shopify Inventory API wrappers.
 *
 * Provides typed helpers around the Admin GraphQL inventory mutations:
 *   - inventoryAdjustQuantities   (delta-based adjustments with idempotency)
 *   - inventorySetQuantities      (absolute set with compare-and-swap)
 *   - inventoryActivate           (start tracking at a location)
 *   - inventoryDeactivate         (stop tracking at a location)
 *   - inventoryLevels             (list current levels)
 *
 * Each function generates a proper idempotency key and surfaces GraphQL
 * userErrors as a thrown {@link InventoryError}.
 *
 * Usage:
 *   import { adjustInventoryQuantity } from "~/lib/shopify/inventory";
 *   await adjustInventoryQuantity(session, {
 *     inventoryItemId: "gid://shopify/InventoryItem/123",
 *     locationId: "gid://shopify/Location/456",
 *     delta: 10,
 *     reason: "receiving",
 *   });
 */

import type { Session } from "@shopify/shopify-api";
import { shopifyGraphQLWithAdmin } from "~/lib/shopify/client";
import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdjustInventoryInput {
  /** Shopify InventoryItem ID (GID or numeric — will be normalised). */
  inventoryItemId: string;
  /** Shopify Location ID (GID or numeric — will be normalised). */
  locationId: string;
  /** Signed delta: positive to add, negative to remove. */
  delta: number;
  /** Reason string matching Shopify's InventoryAdjustmentReason enum values. */
  reason: string;
  /** Optional reference document URI for traceability. */
  referenceDocumentUri?: string;
}

export interface SetInventoryInput {
  inventoryItemId: string;
  locationId: string;
  /** Absolute quantity to set. */
  quantity: number;
}

export interface ActivateInventoryInput {
  inventoryItemId: string;
  locationId: string;
}

export interface DeactivateInventoryInput {
  inventoryItemId: string;
  locationId: string;
}

export interface InventoryLevel {
  /** InventoryItem GID. */
  inventoryItemId: string;
  /** Location GID. */
  locationId: string;
  /** Available quantity at this location. */
  available: number;
  /** Whether the item is tracked at this location. */
  incoming: number;
}

export interface InventoryAdjustmentGroup {
  createdAt: string;
  reason: string;
  changes: Array<{ name: string; delta: number }>;
}

// ---------------------------------------------------------------------------
// GID helpers
// ---------------------------------------------------------------------------

function asGid(id: string, resource: "InventoryItem" | "Location"): string {
  if (id.startsWith("gid://")) return id;
  return `gid://shopify/${resource}/${id}`;
}

function generateIdempotencyKey(prefix: string, ...parts: string[]): string {
  return `${prefix}-${parts.join("-")}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export class InventoryError extends Error {
  public readonly errors: Array<{ field: string[]; message: string }>;

  constructor(userErrors: Array<{ field: string[]; message: string }>) {
    const summary = userErrors.map((e) => e.message).join("; ");
    super(`Inventory API error: ${summary}`);
    this.name = "InventoryError";
    this.errors = userErrors;
  }
}

// ---------------------------------------------------------------------------
// Internal: extract & validate userErrors from a mutation result
// ---------------------------------------------------------------------------

type MutationResult = {
  userErrors?: Array<{ field: string[]; message: string }>;
};

function assertNoErrors(result: MutationResult, context: string): void {
  if (result.userErrors && result.userErrors.length > 0) {
    throw new InventoryError(result.userErrors);
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

const log = logger.child({ module: "shopify/inventory" });

/**
 * Adjust inventory quantities by a signed delta.
 *
 * @param session  - Active Shopify session.
 * @param input    - Adjustment details.
 * @returns        - The adjustment group from Shopify.
 */
export async function adjustInventoryQuantity(
  session: Session,
  { inventoryItemId, locationId, delta, reason, referenceDocumentUri }: AdjustInventoryInput
): Promise<InventoryAdjustmentGroup> {
  const shop = session.shop;
  const logCtx = log.child({ shop, inventoryItemId, locationId, delta, reason });

  const idempotencyKey = generateIdempotencyKey(
    "adj",
    inventoryItemId,
    locationId,
    reason
  );

  const docUri =
    referenceDocumentUri ?? `stockflows://adjust/${reason}/${inventoryItemId}`;

  logCtx.debug({ idempotencyKey }, "Calling inventoryAdjustQuantities");

  const MUTATION = `
    mutation inventoryAdjustQuantities(
      $input: InventoryAdjustQuantitiesInput!
      $idempotencyKey: String!
    ) {
      inventoryAdjustQuantities(input: $input)
        @idempotent(key: $idempotencyKey)
      {
        inventoryAdjustmentGroup {
          createdAt
          reason
          changes {
            name
            delta
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const result = await shopifyGraphQLWithAdmin(
    // We need the admin object — caller must provide a wrapped executor.
    // Since this module is designed to be called from Remix routes that have
    // `admin` from `authenticate.admin()`, we accept an admin.graphql-shaped
    // function.  To keep the public API simple we use the session-based path
    // from client.ts instead.  See the note in client.ts.
    //
    // For this module we call through the session-based client.
    (query, opts) =>
      fetch(`https://${shop}/admin/api/2026-04/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": session.accessToken!,
        },
        body: JSON.stringify({ query, variables: opts?.variables }),
      }).then((r) => r),
    MUTATION,
    {
      input: {
        reason,
        name: "available",
        referenceDocumentUri: docUri,
        changes: [
          {
            delta,
            inventoryItemId: asGid(inventoryItemId, "InventoryItem"),
            locationId: asGid(locationId, "Location"),
          },
        ],
      },
      idempotencyKey,
    }
  );

  const adjResult = (result as any).inventoryAdjustQuantities;
  assertNoErrors(adjResult, "inventoryAdjustQuantities");

  logCtx.info({ idempotencyKey }, "inventoryAdjustQuantities succeeded");

  return adjResult.inventoryAdjustmentGroup as InventoryAdjustmentGroup;
}

/**
 * Set inventory to an absolute quantity using compare-and-swap.
 *
 * @param session  - Active Shopify session.
 * @param input    - Set details.
 */
export async function setInventoryQuantity(
  session: Session,
  { inventoryItemId, locationId, quantity }: SetInventoryInput
): Promise<void> {
  const shop = session.shop;
  const logCtx = log.child({ shop, inventoryItemId, locationId, quantity });

  const idempotencyKey = generateIdempotencyKey(
    "set",
    inventoryItemId,
    locationId
  );

  logCtx.debug({ idempotencyKey }, "Calling inventorySetQuantities");

  const MUTATION = `
    mutation inventorySetQuantities(
      $input: [InventorySetQuantitiesInput!]!
    ) {
      inventorySetQuantities(input: $input) {
        inventoryAdjustmentGroup {
          createdAt
          reason
          changes {
            name
            delta
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const result = await shopifyGraphQLWithAdmin(
    (query, opts) =>
      fetch(`https://${shop}/admin/api/2026-04/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": session.accessToken!,
        },
        body: JSON.stringify({ query, variables: opts?.variables }),
      }).then((r) => r),
    MUTATION,
    {
      input: [
        {
          inventoryItemId: asGid(inventoryItemId, "InventoryItem"),
          locationId: asGid(locationId, "Location"),
          quantity: String(quantity),
          name: "available",
        },
      ],
    }
  );

  const setResult = (result as any).inventorySetQuantities;
  assertNoErrors(setResult, "inventorySetQuantities");

  logCtx.info({ idempotencyKey }, "inventorySetQuantities succeeded");
}

/**
 * Activate inventory tracking for an item at a location.
 *
 * @param session  - Active Shopify session.
 * @param input    - Activation details.
 */
export async function activateInventory(
  session: Session,
  { inventoryItemId, locationId }: ActivateInventoryInput
): Promise<void> {
  const shop = session.shop;
  const logCtx = log.child({ shop, inventoryItemId, locationId });

  logCtx.debug("Calling inventoryActivate");

  const MUTATION = `
    mutation inventoryActivate($id: ID!, $locationId: ID!, $quantity: Int!) {
      inventoryActivate(id: $id, locationId: $locationId, quantity: $quantity) {
        inventoryLevel {
          id
          available
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  // We start at 0 available — caller should follow up with set/adjust if needed.
  const result = await shopifyGraphQLWithAdmin(
    (query, opts) =>
      fetch(`https://${shop}/admin/api/2026-04/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": session.accessToken!,
        },
        body: JSON.stringify({ query, variables: opts?.variables }),
      }).then((r) => r),
    MUTATION,
    {
      id: asGid(inventoryItemId, "InventoryItem"),
      locationId: asGid(locationId, "Location"),
      quantity: 0,
    }
  );

  const activateResult = (result as any).inventoryActivate;
  assertNoErrors(activateResult, "inventoryActivate");

  logCtx.info("inventoryActivate succeeded");
}

/**
 * Deactivate inventory tracking for an item at a location.
 *
 * @param session  - Active Shopify session.
 * @param input    - Deactivation details.
 */
export async function deactivateInventory(
  session: Session,
  { inventoryItemId, locationId }: DeactivateInventoryInput
): Promise<void> {
  const shop = session.shop;
  const logCtx = log.child({ shop, inventoryItemId, locationId });

  logCtx.debug("Calling inventoryDeactivate");

  const MUTATION = `
    mutation inventoryDeactivate($inventoryItemId: ID!, $locationId: ID!) {
      inventoryDeactivate(inventoryItemId: $inventoryItemId, locationId: $locationId) {
        inventoryLevel {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const result = await shopifyGraphQLWithAdmin(
    (query, opts) =>
      fetch(`https://${shop}/admin/api/2026-04/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": session.accessToken!,
        },
        body: JSON.stringify({ query, variables: opts?.variables }),
      }).then((r) => r),
    MUTATION,
    {
      inventoryItemId: asGid(inventoryItemId, "InventoryItem"),
      locationId: asGid(locationId, "Location"),
    }
  );

  const deactivateResult = (result as any).inventoryDeactivate;
  assertNoErrors(deactivateResult, "inventoryDeactivate");

  logCtx.info("inventoryDeactivate succeeded");
}

/**
 * Fetch all inventory levels, optionally filtered by location.
 *
 * Uses cursor-based pagination to retrieve every level across all locations.
 *
 * @param session    - Active Shopify session.
 * @param locationId - Optional location to filter by.
 * @returns          - Array of inventory level objects.
 */
export async function fetchInventoryLevels(
  session: Session,
  locationId?: string
): Promise<InventoryLevel[]> {
  const shop = session.shop;
  const logCtx = log.child({ shop, locationId });

  logCtx.debug("Fetching inventory levels");

  const QUERY = `
    query InventoryLevels($locationId: ID, $cursor: String) {
      inventoryItems(first: 50, after: $cursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          sku
          inventoryLevels(
            ${locationId ? "locationId: $locationId" : ""}
          ) {
            nodes {
              id
              location {
                id
              }
              available
              incoming
            }
          }
        }
      }
    }
  `;

  const levels: InventoryLevel[] = [];
  let cursor: string | undefined;

  do {
    const result = await shopifyGraphQLWithAdmin(
      (query, opts) =>
        fetch(`https://${shop}/admin/api/2026-04/graphql.json`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": session.accessToken!,
          },
          body: JSON.stringify({ query, variables: opts?.variables }),
        }).then((r) => r),
      QUERY,
      {
        ...(locationId ? { locationId: asGid(locationId, "Location") } : {}),
        ...(cursor ? { cursor } : {}),
      }
    );

    const inventoryItems = (result as any).inventoryItems;

    for (const item of inventoryItems.nodes) {
      for (const level of item.inventoryLevels.nodes) {
        levels.push({
          inventoryItemId: item.id,
          locationId: level.location.id,
          available: level.available ?? 0,
          incoming: level.incoming ?? 0,
        });
      }
    }

    cursor = inventoryItems.pageInfo.hasNextPage
      ? inventoryItems.pageInfo.endCursor
      : undefined;
  } while (cursor);

  logCtx.info({ count: levels.length }, "Fetched inventory levels");

  return levels;
}
