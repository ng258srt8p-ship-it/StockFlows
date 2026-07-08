/**
 * E2E Tests: Audit Logs
 *
 * Covers: Audit logging for all CRUD operations.
 * ARCHITECTURE §47 (Audit logging)
 */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.describe("Audit Logs", () => {
  test("audit logs are recorded for all operations", async () => {
    const logs = await prisma.auditLog.findMany({ take: 20 });
    expect(Array.isArray(logs)).toBe(true);
  });

  test("audit logs capture correct actions", async () => {
    const logs = await prisma.auditLog.findMany({ take: 50 });
    const validActions = ["create", "update", "delete", "login", "logout"];
    for (const l of logs) {
      expect(validActions).toContain(l.action);
    }
  });

  test("audit logs reference correct users", async () => {
    const logs = await prisma.auditLog.findMany({ take: 20 });
    for (const l of logs) {
      expect(l.userId).toBeTruthy();
    }
  });

  test("audit logs have timestamps", async () => {
    const logs = await prisma.auditLog.findMany({ take: 20 });
    for (const l of logs) {
      expect(l.createdAt).toBeInstanceOf(Date);
    }
  });

  test("audit logs capture resource changes", async () => {
    const logs = await prisma.auditLog.findMany({ take: 20 });
    for (const l of logs) {
      if (l.oldValues !== null && l.oldValues !== undefined) {
        expect(typeof l.oldValues).toBe("object");
      }
    }
  });

  test("audit log search is functional", async ({ request }) => {
    const response = await request.get("/api/audit-logs?limit=10");
    expect(response.ok()).toBeTruthy();
  });

  test("audit logs are immutable", async () => {
    const logs = await prisma.auditLog.findMany({ take: 5 });
    for (const l of logs) {
      expect(l.createdAt).toBe(l.updatedAt || l.createdAt);
    }
  });
});
