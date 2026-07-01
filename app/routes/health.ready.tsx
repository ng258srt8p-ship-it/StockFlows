import { prisma } from "~/lib/db/client";

export const loader = async () => {
  // Minimal test - no DB, no Redis
  return new Response(JSON.stringify({
    status: "ready",
    checks: { minimal: "ok" },
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const action = async () => {
  return new Response(JSON.stringify({
    dbUrl: process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@") : "NOT SET",
    nodeEnv: process.env.NODE_ENV,
    directUrl: process.env.DIRECT_URL ? "SET" : "NOT SET",
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};