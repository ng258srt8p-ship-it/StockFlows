import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuditLogParams {
  shopId: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
}

// ---------------------------------------------------------------------------
// Audit logging
// ---------------------------------------------------------------------------

/**
 * Create an audit log record. Wrapped in try/catch so that audit failures
 * never crash the caller's main operation.
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        shopId: params.shopId,
        userId: params.userId ?? null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldValue: params.oldValue != null ? JSON.parse(JSON.stringify(params.oldValue)) : undefined,
        newValue: params.newValue != null ? JSON.parse(JSON.stringify(params.newValue)) : undefined,
        ipAddress: params.ip ?? null,
        userAgent: params.userAgent ?? null,
      },
    });
  } catch (error) {
    // Audit logging must never propagate errors to the caller.
    logger.error(
      {
        err: error,
        shopId: params.shopId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
      },
      "Failed to create audit log",
    );
  }
}
