/**
 * Executes a promise in the background without awaiting it.
 * Wraps the execution in a try-catch to prevent unhandled rejections from crashing the process.
 */
export async function runInBackground<T>(promise: Promise<T>, context: string): Promise<void> {
  const { logger } = await import("~/lib/logger");
  const log = logger.child({ module: "background-executor", context });

  promise.then(() => {
    log.debug("Background task completed successfully");
  }).catch((error) => {
    log.error({ error: error instanceof Error ? error.message : String(error) }, "Background task failed");
  });
}
