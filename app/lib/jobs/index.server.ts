/**
 * Job workers and scheduler — side-effect import starts all workers.
 *
 * Import this module once at app startup (e.g., in root.tsx or entry.server.tsx).
 * Each worker file starts listening on its queue when imported.
 * The scheduler registers repeatable jobs on first call.
 */

import { registerScheduledJobs } from "./scheduler.server";

// Import workers to start them (each worker's file-level code starts listening)
import "./workers/inventory-sync.worker";
import "./workers/forecast.worker";
import "./workers/alert.worker";
import "./workers/report.worker";
import "./workers/archive.worker";
import "./workers/partition.worker";
import "./workers/staff-sync.worker";

// Register repeatable jobs (idempotent — safe to call multiple times)
registerScheduledJobs().catch((error) => {
  console.error("[jobs] Failed to register scheduled jobs:", error);
});
