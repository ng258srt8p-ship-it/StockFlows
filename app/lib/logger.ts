/**
 * Structured logger built on Pino.
 *
 * Features (Research.md section 42):
 * - JSON output in production, pretty-printed in development
 * - Automatic redaction of sensitive fields (tokens, passwords, keys)
 * - Child loggers for per-request / per-module context
 *
 * Usage:
 *   import { logger } from "~/lib/logger";
 *   const log = logger.child({ requestId: "abc" });
 *   log.info({ orderId: 123 }, "Order created");
 */

import pino from "pino";

// ---------------------------------------------------------------------------
// Redaction rules -- prevents accidental leakage of secrets in logs.
// ---------------------------------------------------------------------------

const REDACT_PATHS = [
  "accessToken",
  "accessToken.access_token",
  "password",
  "secret",
  "apiKey",
  "apiSecret",
  "authorization",
  "cookie",
  "sessionToken",
  "creditCard",
  "cardNumber",
  // Nested Shopify-specific paths
  "session.accessToken",
  "shop.accessToken",
  "env.SHOPIFY_API_SECRET",
  "env.SHOPIFY_API_KEY",
  "env.DATABASE_URL",
];

// ---------------------------------------------------------------------------
// Logger configuration
// ---------------------------------------------------------------------------

const isDev = process.env.NODE_ENV === "development";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),

  // Redact sensitive fields in all environments.
  redact: {
    paths: REDACT_PATHS,
    censor: "[REDACTED]",
  },

  // In development, use pino-pretty for human-readable output.
  // In production, emit structured JSON for log aggregators.
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:HH:MM:ss",
          ignore: "pid,hostname",
        },
      }
    : undefined,

  base: isDev
    ? undefined
    : {
        pid: process.pid,
        app: "stockflows",
      },

  timestamp: isDev
    ? pino.stdTimeFunctions.isoTime
    : pino.stdTimeFunctions.unixTime,
});

/**
 * Create a child logger that automatically includes contextual fields.
 *
 * @example
 *   const reqLog = logger.child({ requestId, shop: session.shop });
 *   reqLog.info("Processing inventory adjustment");
 */
export function createChildLogger(context: Record<string, unknown>) {
  return logger.child(context);
}

export default logger;
