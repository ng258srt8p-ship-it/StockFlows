/**
 * Shopify ID Normalization Utilities
 * 
 * Converts between numeric IDs (from webhooks) and GID format (used in GraphQL/Database).
 * 
 * Shopify webhooks send numeric IDs:
 *   - inventory_item_id: 12345
 *   - location_id: 67890
 * 
 * But Shopify GraphQL and our database use GIDs:
 *   - gid://shopify/InventoryItem/12345
 *   - gid://shopify/Location/67890
 * 
 * This module provides consistent normalization across all code paths.
 */

/**
 * Convert a numeric InventoryItem ID to GID format.
 * If already a GID, returns as-is.
 */
export function toInventoryItemGid(id: string): string {
  if (id.startsWith("gid://")) return id;
  return `gid://shopify/InventoryItem/${id}`;
}

/**
 * Convert a numeric Location ID to GID format.
 * If already a GID, returns as-is.
 */
export function toLocationGid(id: string): string {
  if (id.startsWith("gid://")) return id;
  return `gid://shopify/Location/${id}`;
}

/**
 * Convert a numeric Product ID to GID format.
 * If already a GID, returns as-is.
 */
export function toProductGid(id: string): string {
  if (id.startsWith("gid://")) return id;
  return `gid://shopify/Product/${id}`;
}

/**
 * Convert a numeric Variant ID to GID format.
 * If already a GID, returns as-is.
 */
export function toVariantGid(id: string): string {
  if (id.startsWith("gid://")) return id;
  return `gid://shopify/ProductVariant/${id}`;
}

/**
 * Validate that an ID is a valid GID for the given resource type.
 */
export function isValidGid(id: string, resource: "InventoryItem" | "Location" | "Product" | "ProductVariant"): boolean {
  return id.startsWith(`gid://shopify/${resource}/`);
}

/**
 * Extract the numeric ID from a GID.
 * Returns the original string if not a GID.
 */
export function extractNumericId(gid: string): string {
  const match = gid.match(/\/(\d+)$/);
  return match ? match[1] : gid;
}

/**
 * Normalize an ID that could be either numeric or GID to GID format.
 * Uses the appropriate converter based on resource type.
 */
export function normalizeToGid(id: string, resource: "InventoryItem" | "Location" | "Product" | "ProductVariant"): string {
  switch (resource) {
    case "InventoryItem":
      return toInventoryItemGid(id);
    case "Location":
      return toLocationGid(id);
    case "Product":
      return toProductGid(id);
    case "ProductVariant":
      return toVariantGid(id);
  }
}