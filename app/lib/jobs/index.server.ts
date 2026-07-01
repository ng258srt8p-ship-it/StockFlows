/**
 * Job workers and scheduler — side-effect import starts all workers.
 *
 * Import this module once at app startup (e.g., in root.tsx or entry.server.tsx).
 * Each worker file starts listening on its queue when imported.
 * The scheduler registers repeatable jobs on first call.
 *
 * When Redis is not configured (REDIS_HOST/REDIS_URL not set), all workers
 * and queues are gracefully disabled — the app still functions for manual
 * inventory management, but background jobs (forecast, alerts, reports) won't run.
 */

import { logger } from "~/lib/logger";
import { registerScheduledJobs } from "./scheduler.server";

// Import workers to start them (each worker's file-level code starts listening)
// These imports are safe even when Redis is not configured — workers export null.
import "./workers/inventory-sync.worker";
import "./workers/forecast.worker";
import "./workers/alert.worker";
import "./workers/report.worker";
import "./workers/archive.worker";
import "./workers/partition.worker";
import "./workers/staff-sync.worker";

const hasRedis = Boolean(process.env.REDIS_HOST || process.env.REDIS_URL);

if (hasRedis) {
  // Register repeatable jobs (idempotent — safe to call multiple times)
  registerScheduledJobs().catch((error) => {
    console.error("[jobs] Failed to register scheduled jobs:", error);
  });
  logger.info("Job workers started (Redis available)");
} else {
  logger.info("Job workers disabled (Redis not configured) — app will function without background jobs");
}