import { forecastQueue, staffSyncQueue, reportQueue } from "./queue.server";
import { logger } from "~/lib/logger";

export async function registerScheduledJobs() {
  const log = logger.child({ module: "scheduler" });

  // Only register scheduled jobs if Redis is configured (queues are available)
  if (!forecastQueue || !staffSyncQueue || !reportQueue) {
    log.info("Redis not configured — skipping scheduled job registration");
    return;
  }

  // Nightly forecast at 2:00 AM
  await forecastQueue.add(
    "nightly-forecast",
    {},
    {
      repeat: { pattern: "0 2 * * *" },
      jobId: "nightly-forecast",
    }
  );
  log.info("Registered nightly forecast job (2:00 AM)");

  // Staff sync daily at 6:00 AM
  await staffSyncQueue.add(
    "daily-staff-sync",
    {},
    {
      repeat: { pattern: "0 6 * * *" },
      jobId: "daily-staff-sync",
    }
  );
  log.info("Registered daily staff sync job (6:00 AM)");

  // Weekly report on Mondays at 8:00 AM
  await reportQueue.add(
    "weekly-report",
    {},
    {
      repeat: { pattern: "0 8 * * 1" },
      jobId: "weekly-report",
    }
  );
  log.info("Registered weekly report job (Monday 8:00 AM)");
}
