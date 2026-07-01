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

  // Redis check — only if REDIS_HOST or REDIS_URL is configured
  const hasRedis = Boolean(process.env.REDIS_HOST || process.env.REDIS_URL);
  if (hasRedis) {
    try {
      const IORedis = (await import("ioredis")).default;
      const redis = new IORedis(process.env.REDIS_URL ?? `redis://${process.env.REDIS_HOST ?? "localhost"}:${process.env.REDIS_PORT ?? 6379}`, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        lazyConnect: true,
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

  return Response.json(
    { status: healthy ? "ready" : "not ready", checks, timestamp: new Date().toISOString() },
    { status: healthy ? 200 : 503 }
  );
};
