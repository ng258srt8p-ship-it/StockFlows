# StockFlows Forecasting Enhancement Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Add forecast cards with product data to the Shopify app forecasting page to match the demo at stockflows.app.

**Architecture:** The Shopify app uses Remix/React with Prisma ORM. The demo uses static HTML with dummy data. The plan will:
1. Add a seed script to generate sample forecast data
2. Update the forecasting page to display forecast cards when data exists
3. Ensure the UI matches the demo's card layout

**Tech Stack:** Remix, React, Prisma, Polaris UI

---

## Gate Table

| Gate # | Gate | Verification Method | Pass Condition |
|--------|------|---------------------|----------------|
| 1 | Seed script runs | `npx prisma db seed` | Exit code 0 |
| 2 | Forecasts display | `curl -s stockflows.fly.dev/app/forecasting` | Contains forecast cards |
| 3 | Cards match demo | Visual comparison | Same layout |
| 4 | Cron job active | `cronjob list` | Job running |

---

## Phase 1: Seed Forecast Data

### Task 1.1: Create forecast seed script

**Objective:** Generate sample forecast data for 10 products

**Files:**
- Create: `prisma/seed-forecasts.ts`

**Step 1: Create seed script**

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const forecastData = [
  // A-class (High Priority)
  { title: "Premium Snowboard Boots", sku: "PSB-001", model: "ETS", confidence: 0.94, predicted: 420, current: 120, trend: "up" },
  { title: "Performance Ski Goggles", sku: "PSG-002", model: "Ensemble", confidence: 0.91, predicted: 350, current: 95, trend: "up" },
  { title: "Heated Ski Gloves", sku: "HSG-003", model: "Linear", confidence: 0.87, predicted: 380, current: 65, trend: "up" },
  { title: "All-Mountain Ski Boots", sku: "AMS-004", model: "ETS", confidence: 0.89, predicted: 290, current: 205, trend: "stable" },
  // B-class (Medium Priority)
  { title: "Carbon Fiber Ski Poles", sku: "CFP-005", model: "Linear", confidence: 0.82, predicted: 240, current: 85, trend: "up" },
  { title: "Insulated Ski Jacket", sku: "ISJ-006", model: "Ensemble", confidence: 0.76, predicted: 110, current: 145, trend: "down" },
  { title: "Helmet Visor Anti-Fog", sku: "HVA-007", model: "ETS", confidence: 0.80, predicted: 160, current: 130, trend: "stable" },
  // C-class (Low Priority)
  { title: "Merino Wool Socks (3-pack)", sku: "MWS-008", model: "Linear", confidence: 0.74, predicted: 180, current: 220, trend: "up" },
  { title: "Snowboard Wax Kit", sku: "SWK-009", model: "Ensemble", confidence: 0.68, predicted: 75, current: 90, trend: "down" },
  { title: "Ski Helmet Strap Lock", sku: "SHS-010", model: "ETS", confidence: 0.65, predicted: 90, current: 180, trend: "stable" },
];

async function seedForecasts() {
  console.log("Seeding forecast data...");
  
  // Get or create a default shop
  const shop = await prisma.shop.findFirst();
  if (!shop) {
    console.error("No shop found. Please run the main seed first.");
    return;
  }

  // Create inventory items and forecasts
  for (const item of forecastData) {
    // Create inventory item if it doesn't exist
    const inventoryItem = await prisma.inventoryItem.upsert({
      where: { shopId_sku: { shopId: shop.id, sku: item.sku } },
      update: {},
      create: {
        shopId: shop.id,
        title: item.title,
        sku: item.sku,
        quantity: item.current,
        costPerUnit: Math.random() * 50 + 10,
        reorderPoint: Math.floor(item.current * 0.3),
      },
    });

    // Create forecast result
    await prisma.forecastResult.create({
      data: {
        inventoryItemId: inventoryItem.id,
        locationId: (await prisma.location.findFirst({ where: { shopId: shop.id } }))?.id ?? "",
        modelUsed: item.model,
        confidence: item.confidence,
        totalPredicted: item.predicted,
        predictedDaily: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() + (i + 1) * 86400000).toISOString().split("T")[0],
          yhat: Math.round(item.predicted / 30 * (0.8 + Math.random() * 0.4)),
          lower: Math.round(item.predicted / 30 * 0.6),
          upper: Math.round(item.predicted / 30 * 1.4),
        })),
      },
    });
  }

  console.log(`Seeded ${forecastData.length} forecasts`);
}

seedForecasts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Step 2: Run seed script**

```bash
npx tsx prisma/seed-forecasts.ts
```

**Step 3: Commit**

```bash
git add prisma/seed-forecasts.ts
git commit -m "feat: add forecast seed script with 10 sample products"
```

---

## Phase 2: Update Forecasting UI

### Task 2.1: Add forecast cards to forecasting page

**Objective:** Display forecast cards when data exists

**Files:**
- Modify: `app/routes/app.forecasting.tsx`

**Step 1: Add forecast cards component**

```tsx
// Add after the summary cards section
{forecastList.length > 0 && (
  <Layout.Section>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {forecastList.slice(0, 10).map((forecast: any) => (
        <Card key={forecast.id}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge tone={forecast.confidence >= 0.8 ? "success" : forecast.confidence >= 0.6 ? "warning" : "info"}>
                {forecast.inventoryItem.title}
              </Badge>
              <Text variant="bodySm" as="p" tone="subdued">
                {forecast.modelUsed}
              </Text>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Text variant="headingLg" as="p">
                {forecast.totalPredicted.toLocaleString()} units
              </Text>
              <Badge tone={forecast.trend === "up" ? "success" : forecast.trend === "down" ? "critical" : "info"}>
                {forecast.trend === "up" ? "↑ Up" : forecast.trend === "down" ? "↓ Down" : "→ Stable"}
              </Badge>
            </div>
            <Text variant="bodySm" as="p" tone="subdued">
              Confidence: {Math.round(forecast.confidence * 100)}%
            </Text>
            <Text variant="bodySm" as="p" tone="subdued">
              Current: {forecast.inventoryItem.quantity.toLocaleString()} units
            </Text>
          </div>
        </Card>
      ))}
    </div>
  </Layout.Section>
)}
```

**Step 2: Verify cards display**

```bash
curl -s https://stockflows.fly.dev/app/forecasting | grep -c "Premium Snowboard Boots"
```

Expected: 1

**Step 3: Commit**

```bash
git add app/routes/app.forecasting.tsx
git commit -m "feat: add forecast cards to forecasting page"
```

---

## Phase 3: Deploy & Verify

### Task 3.1: Deploy to Fly.io

**Objective:** Deploy updated app

**Step 1: Commit all changes**

```bash
git add -A
git commit -m "feat: add forecast data and cards to forecasting page"
```

**Step 2: Deploy**

```bash
fly deploy --app stockflows
```

**Step 3: Push to GitHub**

```bash
git push origin main
```

---

## Summary

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Seed Data | 1 task | 15 minutes |
| Phase 2: Update UI | 1 task | 30 minutes |
| Phase 3: Deploy | 1 task | 10 minutes |
| **Total** | **3 tasks** | **~1 hour** |
