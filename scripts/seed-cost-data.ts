import { PrismaClient } from "@prisma/client";

/**
 * Seed costPerUnit for all InventoryItem records.
 *
 * Usage:
 *   npx tsx scripts/seed-cost-data.ts
 *
 * This script assigns realistic wholesale cost-per-unit values to inventory
 * items so the Dashboard "Inventory Value" card shows a real dollar amount
 * instead of $0.
 *
 * SAFETY: This script only updates costPerUnit — it does NOT create or
 * delete any records. Always run against a development/staging database first.
 */

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Cost lookup — map product title substrings to realistic wholesale costs.
// Snowboard gear wholesale typically runs 40-55% of retail price.
// ---------------------------------------------------------------------------

interface CostRule {
  /** Substring to match (case-insensitive) */
  match: string;
  /** Cost per unit in USD */
  cost: number;
  /** Short description for logging */
  label: string;
}

const COST_RULES: CostRule[] = [
  // ── Snowboards ──────────────────────────────────────────────────────
  { match: "snowboard", cost: 285, label: "Snowboard" },
  { match: "board", cost: 260, label: "Snowboard (board)" },

  // ── Boots ───────────────────────────────────────────────────────────
  { match: "boot", cost: 195, label: "Snowboard boots" },
  { match: "binding", cost: 155, label: "Bindings" },

  // ── Helmets ─────────────────────────────────────────────────────────
  { match: "helmet", cost: 65, label: "Helmet" },

  // ── Goggles ─────────────────────────────────────────────────────────
  { match: "goggle", cost: 55, label: "Goggles" },
  { match: "goggles", cost: 55, label: "Goggles" },

  // ── Outerwear ───────────────────────────────────────────────────────
  { match: "jacket", cost: 125, label: "Jacket" },
  { match: "pant", cost: 95, label: "Snow pants" },
  { match: "pants", cost: 95, label: "Snow pants" },

  // ── Accessories ─────────────────────────────────────────────────────
  { match: "glove", cost: 38, label: "Gloves" },
  { match: "gloves", cost: 38, label: "Gloves" },
  { match: "mitten", cost: 35, label: "Mittens" },
  { match: "mittens", cost: 35, label: "Mittens" },
  { match: "sock", cost: 15, label: "Socks" },
  { match: "beanie", cost: 18, label: "Beanie" },
  { match: "hat", cost: 18, label: "Hat" },
  { match: "balaclava", cost: 22, label: "Balaclava" },
  { match: "neck gaiter", cost: 20, label: "Neck gaiter" },
  { match: "gaiter", cost: 20, label: "Gaiter" },

  // ── Poles / Accessories ─────────────────────────────────────────────
  { match: "pole", cost: 45, label: "Poles" },
  { match: "poles", cost: 45, label: "Poles" },
  { match: "wax", cost: 12, label: "Wax kit" },
  { match: "tool", cost: 25, label: "Tool" },

  // ── Bags / Storage ──────────────────────────────────────────────────
  { match: "bag", cost: 45, label: "Bag" },
  { match: "backpack", cost: 55, label: "Backpack" },
  { match: "rack", cost: 120, label: "Rack" },

  // ── Protection / Armor ──────────────────────────────────────────────
  { match: "padded short", cost: 55, label: "Padded shorts" },
  { match: "padded", cost: 55, label: "Padded gear" },
  { match: "crash pant", cost: 65, label: "Crash pants" },
  { match: "impact short", cost: 55, label: "Impact shorts" },
  { match: "wrist guard", cost: 25, label: "Wrist guards" },
  { match: "back protector", cost: 65, label: "Back protector" },
  { match: "knee pad", cost: 40, label: "Knee pads" },
  { match: "hip pad", cost: 35, label: "Hip pad" },

  // ── Electronics / Accessories ────────────────────────────────────────
  { match: "pass", cost: 50, label: "Lift pass holder" },
  { match: "camera mount", cost: 25, label: "Camera mount" },
  { match: "heated", cost: 85, label: "Heated gear" },

  // ── Gift Card (cost = $0) ──────────────────────────────────────────
  { match: "gift card", cost: 0, label: "Gift Card" },
  { match: "gift certificate", cost: 0, label: "Gift Card" },

  // ── Clearance / Accessories (fallback) ─────────────────────────────
  { match: "clearance", cost: 45, label: "Clearance item" },
];

// Fallback cost when no rule matches (mid-range generic accessory)
const DEFAULT_COST = 75;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findCost(title: string): { cost: number; label: string } {
  const lower = title.toLowerCase();

  for (const rule of COST_RULES) {
    if (lower.includes(rule.match)) {
      return { cost: rule.cost, label: rule.label };
    }
  }

  return { cost: DEFAULT_COST, label: "Default" };
}

function formatUsd(n: number): string {
  return `$${n.toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function seedCosts() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║  StockFlows — Seed costPerUnit for Inventory Items         ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  // 1. Fetch all inventory items that currently have no cost
  const items = await prisma.inventoryItem.findMany({
    select: {
      id: true,
      title: true,
      sku: true,
      quantity: true,
      costPerUnit: true,
    },
    orderBy: { title: "asc" },
  });

  console.log(`Found ${items.length} inventory items in database.\n`);

  if (items.length === 0) {
    console.log("No inventory items found. Nothing to do.");
    return;
  }

  // 2. Classify items
  const alreadyCosted = items.filter((i) => i.costPerUnit !== null);
  const needsCost = items.filter((i) => i.costPerUnit === null);

  if (alreadyCosted.length > 0) {
    console.log(
      `${alreadyCosted.length} items already have a costPerUnit — will skip them.`
    );
    for (const item of alreadyCosted) {
      console.log(
        `  ⏭  ${item.title} (${item.sku ?? "no SKU"}) — ${formatUsd(Number(item.costPerUnit))}`
      );
    }
    console.log();
  }

  if (needsCost.length === 0) {
    console.log("All items already have cost data. Nothing to update.");
    return;
  }

  // 3. Build update plan
  console.log(`Planning cost assignments for ${needsCost.length} items:\n`);

  type UpdateEntry = {
    id: string;
    title: string;
    sku: string | null;
    quantity: number;
    cost: number;
    label: string;
  };

  const updates: UpdateEntry[] = [];
  let totalInventoryValue = 0;

  for (const item of needsCost) {
    const { cost, label } = findCost(item.title);
    totalInventoryValue += cost * item.quantity;
    updates.push({ ...item, cost, label });
    console.log(
      `  📦 ${item.title} (×${item.quantity}) → ${formatUsd(cost)} [${label}]`
    );
  }

  console.log(
    `\n  Estimated new total inventory value: ${formatUsd(totalInventoryValue)}`
  );

  // 4. Safety confirmation (skip if --yes flag is passed)
  const args = process.argv.slice(2);
  const autoConfirm = args.includes("--yes") || args.includes("-y");

  if (!autoConfirm) {
    console.log(
      "\n⚠️  This will UPDATE costPerUnit for the items listed above."
    );
    console.log(
      "    Run with --yes to skip this prompt (e.g. npx tsx scripts/seed-cost-data.ts --yes)\n"
    );

    // On CI / non-interactive, bail out
    if (!process.stdin.isTTY) {
      console.log(
        "Non-interactive environment detected. Exiting. Use --yes to run."
      );
      return;
    }

    // Simple prompt — no readline dependency needed
    process.stdout.write("Continue? (y/N) > ");
    const answer = await new Promise<string>((resolve) => {
      process.stdin.once("data", (data) => {
        resolve(data.toString().trim().toLowerCase());
      });
    });

    if (answer !== "y" && answer !== "yes") {
      console.log("Aborted.");
      return;
    }
  }

  // 5. Execute updates
  console.log("\nUpdating database…\n");

  let updatedCount = 0;
  let failedCount = 0;

  for (const entry of updates) {
    try {
      await prisma.inventoryItem.update({
        where: { id: entry.id },
        data: { costPerUnit: entry.cost },
      });
      updatedCount++;
      console.log(
        `  ✅ ${entry.title} — ${formatUsd(entry.cost)}`
      );
    } catch (err: any) {
      failedCount++;
      console.error(
        `  ❌ ${entry.title} — FAILED: ${err.message}`
      );
    }
  }

  // 6. Summary
  console.log("\n──────────────────────────────────────────────────");
  console.log(`  Updated:  ${updatedCount}`);
  console.log(`  Failed:   ${failedCount}`);
  console.log(
    `  Skipped:  ${alreadyCosted.length} (already had cost)`
  );

  // Verify — re-query to show final state
  const finalItems = await prisma.inventoryItem.findMany({
    select: { title: true, quantity: true, costPerUnit: true },
  });

  let finalValue = 0;
  for (const item of finalItems) {
    if (item.costPerUnit) {
      finalValue += Number(item.costPerUnit) * item.quantity;
    }
  }

  console.log(
    `  Total inventory value: ${formatUsd(finalValue)}`
  );
  console.log("──────────────────────────────────────────────────\n");
  console.log("Done!");
}

seedCosts()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
