import { describe, it, expect } from "vitest";
import {
  ROLE_PERMISSIONS,
  getPermissionsForRole,
  roleHasPermission,
} from "~/lib/auth/permissions";

describe("Permissions", () => {
  it("OWNER has all permissions", () => {
    const perms = getPermissionsForRole("OWNER");
    expect(perms).toContain("inventory:read");
    expect(perms).toContain("inventory:write");
    expect(perms).toContain("purchasing:read");
    expect(perms).toContain("purchasing:write");
    expect(perms).toContain("receive:read");
    expect(perms).toContain("receive:write");
    expect(perms).toContain("reports:read");
    expect(perms).toContain("settings:read");
    expect(perms).toContain("settings:write");
  });

  it("STAFF has limited permissions", () => {
    const perms = getPermissionsForRole("STAFF");
    expect(perms).toContain("inventory:read");
    expect(perms).toContain("purchasing:read");
    expect(perms).toContain("reports:read");
    expect(perms).toContain("settings:read");
    expect(perms).not.toContain("inventory:write");
    expect(perms).not.toContain("settings:write");
    expect(perms).not.toContain("users:manage");
  });

  it("MANAGER has intermediate permissions", () => {
    const perms = getPermissionsForRole("MANAGER");
    expect(perms).toContain("inventory:write");
    expect(perms).not.toContain("vendors:manage");
    expect(perms).not.toContain("users:manage");
    expect(perms).not.toContain("settings:write");
  });

  it("roleHasPermission returns correct boolean", () => {
    expect(roleHasPermission("OWNER", "inventory:write")).toBe(true);
    expect(roleHasPermission("STAFF", "inventory:write")).toBe(false);
    expect(roleHasPermission("MANAGER", "inventory:write")).toBe(true);
    expect(roleHasPermission("STAFF", "alerts:write")).toBe(false);
  });
});
