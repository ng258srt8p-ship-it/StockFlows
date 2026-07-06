// @ts-nocheck — dev seed script, relies on dynamic Prisma types
// Usage: tsx scripts/seed-movements.ts
// ⚠️  DO NOT run against production — this script connects to DATABASE_URL directly.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MOVEMENT_TYPES = [
  "SALE",
  "RETURN",
  "ADJUSTMENT",
  "RECEIVING",
  "CYCLE_COUNT",
  "DAMAGE",
] as const;

const NOTES: Record<string, string[]> = {
  SALE: [
    "Online order fulfilled",
    "POS sale",
    "Wholesale order",
    "Marketplace order",
  ],
  RETURN: [
    "Customer return — wrong size",
    "Customer return — defective",
    "Customer return — changed mind",
  ],
  ADJUSTMENT: [
    "Manual count correction",
    "Damaged goods write-off",
    "Inventory reconciliation",
    "Expired product removal",
  ],
  RECEIVING: [
    "PO receipt — Acme Supplies",
    "PO receipt — GlobalParts",
    "Emergency restock",
  ],
  CYCLE_COUNT: [
    "Weekly cycle count",
    "Monthly full count",
    "Spot check",
  ],
  DAMAGE: [
    "Warehouse mishap",
    "Shipping damage",
    "Forklift accident",
    "Water damage",
  ],
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysBack: number): Date {
  const now = new Date();
  const offset = Math.floor(Math.random() * daysBack);
  const date = new Date(now);
  date.setDate(date.getDate() - offset);
  // Randomise time within the day
  date.setHours(randomInt(8, 20), randomInt(0, 59), randomInt(0, 59), 0);
  return date;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  // ── Safety check ──────────────────────────────────────────────────
  const dbUrl = process.env.DATABASE_URL ?? "";
  if (dbUrl.includes("fly.io") || dbUrl.includes("prod") || dbUrl.includes("render")) {
    console.error(
      "\n🛑  ABORTED — DATABASE_URL looks like a production database.\n" +
        "     This script is for local / dev environments only.\n"
    );
    process.exit(1);
  }

  console.log("🔗  Connecting to database …");
  console.log(`   DATABASE_URL host: ${new URL(dbUrl).hostname}\n`);

  // ── Fetch existing data ───────────────────────────────────────────
  const shop = await prisma.shop.findFirst();
  if (!shop) {
    console.error("❌  No shop found. Run the main seed first (npm run seed).");
    process.exit(1);
  }

  const locations = await prisma.location.findMany({
    where: { shopId: shop.id },
    select: { id: true, name: true },
  });
  if (locations.length === 0) {
    console.error("❌  No locations found. Run the main seed first.");
    process.exit(1);
  }

  const inventoryItems = await prisma.inventoryItem.findMany({
    where: { shopId: shop.id },
    select: { id: true, sku: true, title: true, locationId: true },
  });
  if (inventoryItems.length === 0) {
    console.error(
      "❌  No inventory items found. Run the main seed first."
    );
    process.exit(1);
  }

  console.log(
    `📦  Found ${locations.length} locations, ${inventoryItems.length} inventory items\n`
  );

  // ── Build 20 movements ───────────────────────────────────────────
  const movements: Array<{
    inventoryItemId: string;
    locationId: string;
    type: (typeof MOVEMENT_TYPES)[number];
    quantityChange: number;
    reference: string | null;
    notes: string;
    createdBy: string;
    createdAt: Date;
  }> = [];

  for (let i = 0; i < 20; i++) {
    const item = pick(inventoryItems);
    const type = pick(MOVEMENT_TYPES);

    // Quantity semantics
    let qty: number;
    let ref: string | null = null;

    switch (type) {
      case "SALE":
        qty = -randomInt(1, 10);
        ref = `order-${100000 + randomInt(0, 9999)}`;
        break;
      case "RETURN":
        qty = randomInt(1, 5);
        ref = `return-${200000 + randomInt(0, 999)}`;
        break;
      case "ADJUSTMENT":
        qty = randomInt(-15, 15);
        break;
      case "RECEIVING":
        qty = randomInt(10, 200);
        ref = `po-${3000 + randomInt(0, 99)}`;
        break;
      case "CYCLE_COUNT":
        qty = randomInt(-3, 3);
        break;
      case "DAMAGE":
        qty = -randomInt(1, 8);
        break;
    }

    movements.push({
      inventoryItemId: item.id,
      locationId: item.locationId,
      type,
      quantityChange: qty,
      reference: ref,
      notes: pick(NOTES[type]),
      createdBy: "seed-script",
      createdAt: randomDate(30),
    });
  }

  // ── Insert ────────────────────────────────────────────────────────
  const created = await prisma.stockMovement.createMany({ data: movements });

  console.log(`✅  Created ${created.count} stock movements`);
  console.log(
    `   Types: ${MOVEMENT_TYPES.map((t) => `${t}(${movements.filter((m) => m.type === t).length})`).join(", ")}`
  );
  console.log(
    `   Date range: last 30 days, spread across ${locations.length} location(s)\n`
  );
  console.log("🎉  Done!");
}

main()
  .catch((err) => {
    console.error("❌  Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
