import { prisma } from "~/lib/db/client";
import IORedis from "ioredis";

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

  // Redis check
  try {
    const redis = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
    });
    await redis.ping();
    await redis.quit();
    checks.redis = "ok";
  } catch {
    checks.redis = "error";
    healthy = false;
  }

  return Response.json(
    { status: healthy ? "ready" : "not ready", checks, timestamp: new Date().toISOString() },
    { status: healthy ? 200 : 503 }
  );
};
