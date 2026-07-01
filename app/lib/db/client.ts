import { PrismaClient } from "@prisma/client";

const GLOBAL_DB_PROPERTY = "__prisma__stockflows__" as const;

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL;
  console.log("[Prisma] Initializing with DATABASE_URL:", dbUrl ? dbUrl.replace(/:[^:@]+@/, ":****@") : "NOT SET");

  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

// @ts-ignore - globalThis extension
const globalForPrisma = globalThis as { [GLOBAL_DB_PROPERTY]?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma[GLOBAL_DB_PROPERTY] ?? createPrismaClient();

if (process.env.NODE_ENV === "development") {
  globalForPrisma[GLOBAL_DB_PROPERTY] = prisma;
}

export default prisma;