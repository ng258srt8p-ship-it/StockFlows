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
        const url = process.env.REDIS_URL ?? `redis://${process.env.REDIS_HOST ?? "localhost"}:${process.env.REDIS_PORT ?? "6379"}`;
        const redis = new IORedis(url, {
          maxRetriesPerRequest: 1,
          connectTimeout: 2000,
          lazyConnect: true,
          enableOfflineQueue: false,
        });
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

export const action = async () => {
  try {
    return new Response(JSON.stringify({
      dbUrl: process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@") : "NOT SET",
      nodeEnv: process.env.NODE_ENV,
      directUrl: process.env.DIRECT_URL ? "SET" : "NOT SET",
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      error: error?.message ?? "unknown",
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};