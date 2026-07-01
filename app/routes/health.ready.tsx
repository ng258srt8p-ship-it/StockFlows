import { prisma } from "~/lib/db/client";

export const loader = async () => {
  const checks: Record<string, string> = {};
  let healthy = true;

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.postgres = "ok";
  } catch {
    checks.postgres = "error";
    healthy = false;
  }

  // Redis check — only attempt when REDIS_HOST or REDIS_URL is explicitly set
  // Note: Railway's internal Redis services are not exposed as REDIS_HOST/REDIS_URL
  // so this will be skipped unless explicitly configured
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
    } catch {
      checks.redis = "error";
      healthy = false;
    }
  } else {
    checks.redis = "skipped (not configured)";
  }

  return new Response(
    JSON.stringify({ status: healthy ? "ready" : "not ready", checks, timestamp: new Date().toISOString() }),
    {
      status: healthy ? 200 : 503,
      headers: { "Content-Type": "application/json" },
    }
  );
};