/**
 * Permission types and role-permission mappings for StockFlows.
 *
 * Reference: Research.md section 46.
 *
 * Three roles exist in the system, each with an escalating set of
 * permissions.  The `UserRole` enum is defined in the Prisma schema and
 * mirrors the values here.
 *
 * Permission semantics:
 *   inventory:read   -- View stock levels, locations, and reports
 *   inventory:write  -- Adjust stock, create transfers, perform cycle counts
 *   purchasing:read  -- View purchase orders, vendors, and receiving history
 *   purchasing:write -- Create / edit / approve purchase orders
 *   alerts:read      -- View reorder alerts
 *   alerts:write     -- Acknowledge / dismiss / act on alerts
 *   reports:read     -- View analytics and forecast reports
 *   settings:read    -- View shop settings
 *   settings:write   -- Modify shop settings
 *   users:read       -- View team members
 *   users:write      -- Invite / modify / remove team members
 *   receive:read     -- View receiving queue
 *   receive:write    -- Confirm receipt of goods
 */

// ---------------------------------------------------------------------------
// Permission constant
// ---------------------------------------------------------------------------

export const Permission = {
  INVENTORY_READ: "inventory:read",
  INVENTORY_WRITE: "inventory:write",
  PURCHASING_READ: "purchasing:read",
  PURCHASING_WRITE: "purchasing:write",
  ALERTS_READ: "alerts:read",
  ALERTS_WRITE: "alerts:write",
  REPORTS_READ: "reports:read",
  SETTINGS_READ: "settings:read",
  SETTINGS_WRITE: "settings:write",
  USERS_READ: "users:read",
  USERS_WRITE: "users:write",
  RECEIVE_READ: "receive:read",
  RECEIVE_WRITE: "receive:write",
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

// ---------------------------------------------------------------------------
// Role -> permission mapping
// ---------------------------------------------------------------------------

/**
 * OWNER -- full access to everything.  Explicitly lists every permission
 * so that new permissions are visible and intentionally granted.
 */
const OWNER_PERMISSIONS: readonly Permission[] = Object.values(Permission);

/**
 * MANAGER -- can manage inventory, purchasing, alerts, reports, and
 * receiving.  Cannot manage team members or shop settings.
 */
const MANAGER_PERMISSIONS: readonly Permission[] = [
  Permission.INVENTORY_READ,
  Permission.INVENTORY_WRITE,
  Permission.PURCHASING_READ,
  Permission.PURCHASING_WRITE,
  Permission.ALERTS_READ,
  Permission.ALERTS_WRITE,
  Permission.REPORTS_READ,
  Permission.SETTINGS_READ,
  Permission.RECEIVE_READ,
  Permission.RECEIVE_WRITE,
];

/**
 * STAFF -- read-only across the board, plus ability to confirm receipt.
 */
const STAFF_PERMISSIONS: readonly Permission[] = [
  Permission.INVENTORY_READ,
  Permission.PURCHASING_READ,
  Permission.ALERTS_READ,
  Permission.REPORTS_READ,
  Permission.SETTINGS_READ,
  Permission.RECEIVE_READ,
  Permission.RECEIVE_WRITE,
];

// ---------------------------------------------------------------------------
// Exported mapping
// ---------------------------------------------------------------------------

export type UserRole = "OWNER" | "MANAGER" | "STAFF";

/**
 * Maps a user role to the set of permissions it grants.
 */
export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  OWNER: OWNER_PERMISSIONS,
  MANAGER: MANAGER_PERMISSIONS,
  STAFF: STAFF_PERMISSIONS,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the permission set for the given role.
 */
export function getPermissionsForRole(role: UserRole): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Checks whether a role includes a specific permission.
 */
export function roleHasPermission(
  role: UserRole,
  permission: Permission,
): boolean {
  return getPermissionsForRole(role).includes(permission);
}
