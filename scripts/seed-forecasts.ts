/**
 * Seed script: Generate 30 days of historical forecast data for each inventory item.
 *
 * ⚠️  DO NOT RUN AGAINST PRODUCTION — this script targets the local/dev database only.
 *
 * Usage:
 *   npx tsx scripts/seed-forecasts.ts
 *
 * Requires: Prisma Client generated (npx prisma generate), running against a dev
 * database with existing shops, locations, and inventory items (run `npx prisma db seed`
 * first to create the base data).
 */
import { PrismaClient } from "@prisma/client";

// ── Safety guard ──────────────────────────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL ?? "";
if (
  DATABASE_URL.includes("production") ||
  DATABASE_URL.includes("flycast") ||
  DATABASE_URL.includes("postgres://") === false
) {
  console.error(
    "❌  This script must only run against a local/dev database.\n" +
      "    Set DATABASE_URL to a local connection string or use a .env file.\n" +
      "    Current DATABASE_URL: " +
      (DATABASE_URL || "(not set)") +
      "\n\n" +
      "    To run against your dev DB:\n" +
      "      DATABASE_URL='postgresql://user:pass@localhost:5432/stockflows_dev' npx tsx scripts/seed-forecasts.ts"
  );
  process.exit(1);
}

const prisma = new PrismaClient();

// ── Configuration ─────────────────────────────────────────────────────────────
const DAYS = 30; // number of historical forecast days to generate
const METHOD = "STATISTICAL" as const;
const MODEL_VERSION = "1.0-seed";

// ── Helpers ───────────────────────────────────────────────────────────────────
function randBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Build a 30-day daily forecast array (JSON blob) for the predictedDaily column.
 * Each entry: { date, yhat, lower, upper }
 */
function buildDailyForecast(totalPredicted: number): object[] {
  const horizonDays = 30;
  const dailyBase = totalPredicted / horizonDays;

  return Array.from({ length: horizonDays }, (_, i) => {
    const variance = 0.3 + Math.random() * 0.4; // 0.3 – 0.7 multiplier
    const yhat = Math.round(dailyBase * variance);
    const lower = Math.max(0, Math.round(yhat * 0.5));
    const upper = Math.round(yhat * 1.5);
    const date = new Date(Date.now() + (i + 1) * 86_400_000);
    return {
      date: date.toISOString().split("T")[0],
      yhat,
      lower,
      upper,
    };
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("📊  Seeding forecast results...");
  console.log(`    Method: ${METHOD} | Days: ${DAYS} | DB: (from DATABASE_URL)`);

  // 1. Load existing inventory items (must have been seeded first)
  const items = await prisma.inventoryItem.findMany({
    select: { id: true, locationId: true, title: true, sku: true },
  });

  if (items.length === 0) {
    console.error(
      "\n❌  No inventory items found. Run `npx prisma db seed` first to create base data."
    );
    process.exit(1);
  }

  console.log(`    Found ${items.length} inventory item(s)\n`);

  // 2. Check for existing forecasts to warn about upserts
  const existingCount = await prisma.forecastResult.count();
  if (existingCount > 0) {
    console.log(
      `    ⚠️  ${existingCount} existing forecast record(s) found. ` +
        `Script will skip duplicates (unique constraint on item+location+date).`
    );
  }

  // 3. Generate forecasts for every item × day
  let created = 0;
  let skipped = 0;

  const records: {
    inventoryItemId: string;
    locationId: string;
    forecastDate: Date;
    horizonDays: number;
    predictedDaily: object[];
    totalPredicted: number;
    confidence: number;
    modelUsed: string;
    modelVersion: string;
  }[] = [];

  for (const item of items) {
    for (let dayOffset = DAYS; dayOffset >= 1; dayOffset--) {
      const totalPredicted = randBetween(1, 20);
      const confidence = randFloat(0.6, 0.95);
      const forecastDate = daysAgo(dayOffset);

      records.push({
        inventoryItemId: item.id,
        locationId: item.locationId,
        forecastDate,
        horizonDays: 30,
        predictedDaily: buildDailyForecast(totalPredicted),
        totalPredicted,
        confidence,
        modelUsed: METHOD,
        modelVersion: MODEL_VERSION,
      });
    }
  }

  // 4. Batch insert (createMany skips duplicates via the unique constraint)
  try {
    const result = await prisma.forecastResult.createMany({
      data: records,
      skipDuplicates: true, // respects the @@unique constraint
    });
    created = result.count;
    skipped = records.length - created;
  } catch (err) {
    // Fallback: if createMany with skipDuplicates isn't supported,
    // insert one-by-one with upsert
    console.log("    ℹ️  Falling back to per-record upsert...");
    for (const rec of records) {
      try {
        await prisma.forecastResult.upsert({
          where: {
            inventoryItemId_locationId_forecastDate: {
              inventoryItemId: rec.inventoryItemId,
              locationId: rec.locationId,
              forecastDate: rec.forecastDate,
            },
          },
          update: {
            totalPredicted: rec.totalPredicted,
            confidence: rec.confidence,
            predictedDaily: rec.predictedDaily,
            modelUsed: rec.modelUsed,
            modelVersion: rec.modelVersion,
          },
          create: rec,
        });
        created++;
      } catch {
        skipped++;
      }
    }
  }

  // 5. Summary
  console.log(`\n✅  Forecast seeding complete!`);
  console.log(`    Items processed: ${items.length}`);
  console.log(`    Forecasts created: ${created}`);
  if (skipped > 0) {
    console.log(`    Skipped (duplicates): ${skipped}`);
  }
  console.log(`    Total records: ${records.length} (${items.length} items × ${DAYS} days)`);
}

main()
  .catch((err) => {
    console.error("❌  Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
