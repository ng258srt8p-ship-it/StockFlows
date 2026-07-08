import { PrismaClient } from "@prisma/client";

const GLOBAL_DB_PROPERTY = "__prisma__stockflows__" as const;

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL;
  const initMsg = `[Prisma Client Init] NODE_ENV=${process.env.NODE_ENV} | DATABASE_URL=${dbUrl ? dbUrl.replace(/:[^:@]+@/, ":****@") : "NOT SET"} | directUrl=${process.env.DIRECT_URL ? "SET" : "NOT SET"}`;
  console.error(initMsg);

  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
    console.error(`[Prisma Client Init] SUCCESS - Client created`);
    return client;
  } catch (e: any) {
    console.error(`[Prisma Client Init] FAILED:`, e?.message ?? e);
    throw e;
  }
}

// @ts-ignore - globalThis extension
const globalForPrisma = globalThis as { [GLOBAL_DB_PROPERTY]?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma[GLOBAL_DB_PROPERTY] ?? createPrismaClient();

if (process.env.NODE_ENV === "development") {
  globalForPrisma[GLOBAL_DB_PROPERTY] = prisma;
}

export default prisma;