import { prisma } from "~/lib/db/client";

export const loader = async () => {
  try {
    const checks: Record<string, string> = {};
    let healthy = true;

    // Database check
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.postgres = "ok";
    } catch (error: any) {
      checks.postgres = `error: ${error?.message ?? "unknown"}`;
      healthy = false;
    }

    // Redis check — only attempt when REDIS_HOST or REDIS_URL is explicitly set
    const hasRedis = Boolean(process.env.REDIS_HOST || process.env.REDIS_URL);
    if (hasRedis) {
      try {
        const { default: IORedis } = await import("ioredis");
        const { createWorkerConnection } = await import("~/lib/jobs/redis-connection");
        const connectionConfig = createWorkerConnection();

        if (!connectionConfig) {
          throw new Error("No Redis connection configured");
        }

        // Use connection config with connection options
        const redis = new IORedis({
          ...connectionConfig,
          maxRetriesPerRequest: 1,
          connectTimeout: 2000,
          lazyConnect: true,
          enableOfflineQueue: false,
        } as any);
        await redis.connect();
        await redis.ping();
        await redis.quit();
        checks.redis = "ok";
      } catch (error: any) {
        checks.redis = `error: ${error?.message ?? "unknown"}`;
        healthy = false;
      }
    } else {
      checks.redis = "skipped (not configured)";
    }

    // Always return a Response — never throw
    const status = healthy ? 200 : 503;
    const body = JSON.stringify({
      status: healthy ? "ready" : "not ready",
      checks,
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      dbUrl: process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@") : "NOT SET",
    });

    return new Response(body, {
      status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    // Ultimate fallback - ensure we always return JSON
    return new Response(JSON.stringify({
      status: "not ready",
      checks: { loader: `error: ${error?.message ?? "unknown"}` },
      timestamp: new Date().toISOString(),
      error: error?.message ?? "unknown",
    }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
};