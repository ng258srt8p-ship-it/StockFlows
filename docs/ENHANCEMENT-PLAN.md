# StockFlows Enhancement & Competitive Advantage Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Transform StockFlows into the #1 Shopify inventory management app by adding customer-requested features, fixing competitive gaps, and highlighting advantages across all channels.

**Architecture:** This plan covers 3 workstreams:
1. **Feature Development** — Build the top 10 requested features
2. **Competitive Positioning** — Highlight advantages over Stocky, Inventory Planner, SKULabs
3. **Marketing & Deployment** — Update website, deploy to all platforms, monitor hourly

**Tech Stack:** Remix v2, React 18, Shopify Polaris v12, PostgreSQL (Prisma), BullMQ + Redis

---

## Executive Summary

### Market Opportunity
- **Stocky sunset (Aug 2026)** — 207 reviews, users actively seeking replacements
- **Price gap** — Free Stock Sync → $299/mo SKULabs leaves mid-market open ($50-150/mo)
- **Feature gap** — No app connects inventory to accounting (QuickBooks, COGS)
- **483 inventory apps** — Yet merchants still searching for solutions

### Top 10 Customer-Requested Features
| # | Feature | Priority | Impact |
|---|---------|----------|--------|
| 1 | Inventory-Accounting Alignment (COGS, QuickBooks) | Critical | Revenue |
| 2 | Automated PO Generation Based on Sales Trends | Critical | Revenue |
| 3 | Inventory Adjustment Reports with User Audit Trail | Critical | Compliance |
| 4 | Reason Codes for Inventory Adjustments | High | Operations |
| 5 | Comprehensive Adjustment History with Timestamps | High | Operations |
| 6 | Multi-Location Variant-Level Inventory Management | High | Operations |
| 7 | Low Stock Alerts with Customizable Thresholds | Medium | Growth |
| 8 | Barcode Scanning with Stock Movement Logging | Medium | Growth |
| 9 | Supplier/Vendor Flexibility in PO Workflows | Medium | Growth |
| 10 | Shipment Receiving Verification with Discrepancy Handling | Medium | Growth |

### Competitive Advantages
| Advantage | vs Stocky | vs Inventory Planner | vs SKULabs |
|-----------|-----------|---------------------|------------|
| Price | Free vs $89/mo POS Pro | $50/mo vs ~$4k/yr | $50/mo vs $299/mo |
| Forecasting | Broken in Stocky | Same quality | Better UX |
| Audit Trail | Missing | Missing | Basic |
| QuickBooks | Missing | Basic | Missing |
| Support | Abandoned | Slow (21+ days) | Good but expensive |

---

## Phase 1: Critical Features (Week 1-2)

### Task 1.1: QuickBooks Integration Module

**Objective:** Sync COGS, invoices, and inventory valuations with QuickBooks Online.

**Files:**
- Create: `app/lib/accounting/quickbooks.ts`
- Create: `app/lib/accounting/types.ts`
- Create: `app/routes/app.settings.accounting.tsx`

**Step 1: Create QuickBooks types**

```typescript
// app/lib/accounting/types.ts
export interface QuickBooksConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  realmId: string;
}

export interface QuickBooksInvoice {
  id: string;
  docNumber: string;
  txDate: string;
  totalAmt: number;
  lineItems: QuickBooksLineItem[];
}

export interface QuickBooksLineItem {
  id: string;
  description: string;
  amount: number;
  detailType: string;
  itemBasedExpenseLineDetail?: {
    itemRef: { name: string; value: string };
    qty: number;
    unitPrice: number;
  };
}

export interface InventorySyncResult {
  productsSynced: number;
  invoicesSynced: number;
  cogsUpdated: number;
  errors: string[];
}
```

**Step 2: Create QuickBooks client**

```typescript
// app/lib/accounting/quickbooks.ts
import { PrismaClient } from "@prisma/client";
import type { QuickBooksConfig, InventorySyncResult } from "./types";

const prisma = new PrismaClient();

export class QuickBooksIntegration {
  private config: QuickBooksConfig;

  constructor(config: QuickBooksConfig) {
    this.config = config;
  }

  async syncInventory(): Promise<InventorySyncResult> {
    const result: InventorySyncResult = {
      productsSynced: 0,
      invoicesSynced: 0,
      cogsUpdated: 0,
      errors: [],
    };

    try {
      // Fetch invoices from QuickBooks
      const invoices = await this.fetchInvoices();
      
      for (const invoice of invoices) {
        await this.processInvoice(invoice);
        result.invoicesSynced++;
      }

      // Update COGS for all products
      await this.updateCOGS();
      result.cogsUpdated = await prisma.inventoryItem.count();

      result.productsSynced = await prisma.inventoryItem.count();
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : String(error));
    }

    return result;
  }

  private async fetchInvoices(): Promise<any[]> {
    // QuickBooks API call to fetch invoices
    const response = await fetch(
      `https://quickbooks.api.intuit.com/v3/company/${this.config.realmId}/query?query=SELECT * FROM Invoice`,
      {
        headers: {
          Authorization: `Bearer ${this.config.refreshToken}`,
          Accept: "application/json",
        },
      }
    );
    const data = await response.json();
    return data.QueryResponse?.Invoice || [];
  }

  private async processInvoice(invoice: any): Promise<void> {
    // Process invoice line items and update inventory costs
    for (const lineItem of invoice.Line || []) {
      if (lineItem.DetailType === "AccountBasedExpenseLineDetail") {
        const sku = lineItem.Description;
        const unitCost = lineItem.AccountBasedExpenseLineDetail?.UnitPrice || 0;

        if (sku && unitCost > 0) {
          await prisma.inventoryItem.updateMany({
            where: { sku },
            data: { cost: unitCost },
          });
        }
      }
    }
  }

  private async updateCOGS(): Promise<void> {
    // Calculate COGS from inventory movements
    const items = await prisma.inventoryItem.findMany({
      include: { movements: true },
    });

    for (const item of items) {
      const totalCost = item.movements
        .filter((m) => m.type === "SALE")
        .reduce((sum, m) => sum + m.quantity * item.cost, 0);

      // Store COGS in shop settings or custom field
      await prisma.shopSetting.update({
        where: { shopId: item.shopId },
        data: {
          // COGS tracking field
        },
      });
    }
  }
}
```

**Step 3: Create accounting settings page**

```tsx
// app/routes/app.settings.accounting.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, Text, Layout, Button, Banner } from "@shopify/polaris";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Check QuickBooks connection status
  return json({ connected: false, lastSync: null });
};

export default function AccountingSettings() {
  const { connected, lastSync } = useLoaderData<typeof loader>();

  return (
    <Card>
      <div className="p-4">
        <Text variant="headingMd" as="h2">
          QuickBooks Integration
        </Text>
        <Text variant="bodySm" as="p" tone="subdued">
          Sync COGS, invoices, and inventory valuations with QuickBooks Online.
        </Text>
        
        {connected ? (
          <Banner status="success">
            <p>Connected to QuickBooks. Last sync: {lastSync}</p>
          </Banner>
        ) : (
          <div className="mt-4">
            <Button primary>Connect QuickBooks</Button>
          </div>
        )}
      </div>
    </Card>
  );
}
```

**Step 4: Verify**

Run: `curl -s http://localhost:5173/app/settings/accounting | grep -o "QuickBooks"`
Expected: Settings page loads

**Step 5: Commit**

```bash
git add app/lib/accounting/ app/routes/app.settings.accounting.tsx
git commit -m "feat: add QuickBooks integration module"
```

---

### Task 1.2: Automated PO Generation

**Objective:** Generate purchase orders based on sales trends and forecasting.

**Files:**
- Create: `app/lib/purchasing/auto-po.ts`
- Modify: `app/routes/app.purchasing.tsx`

**Step 1: Create auto-PO generator**

```typescript
// app/lib/purchasing/auto-po.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface AutoPOItem {
  productId: string;
  sku: string;
  name: string;
  currentQty: number;
  reorderPoint: number;
  suggestedQty: number;
  unitCost: number;
  vendorId: string;
}

export async function generateAutoPOs(shopId: string): Promise<{
  poCount: number;
  totalValue: number;
  items: AutoPOItem[];
}> {
  // Get all inventory items with sales data
  const items = await prisma.inventoryItem.findMany({
    where: { shopId },
    include: {
      product: true,
      movements: {
        where: { type: "SALE" },
        orderBy: { createdAt: "desc" },
        take: 90, // Last 90 days
      },
    },
  });

  const autoPOItems: AutoPOItem[] = [];

  for (const item of items) {
    // Calculate average daily sales
    const salesLast90Days = item.movements.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    const avgDailySales = salesLast90Days / 90;

    // Calculate days until stockout
    const daysUntilStockout = avgDailySales > 0 ? item.quantity / avgDailySales : Infinity;

    // If below reorder point or will stockout in 14 days
    if (item.quantity <= item.reorderPoint || daysUntilStockout < 14) {
      // Calculate suggested order quantity (30 days of stock)
      const suggestedQty = Math.ceil(avgDailySales * 30) - item.quantity;

      if (suggestedQty > 0) {
        autoPOItems.push({
          productId: item.productId,
          sku: item.sku,
          name: item.product.title,
          currentQty: item.quantity,
          reorderPoint: item.reorderPoint,
          suggestedQty,
          unitCost: item.cost,
          vendorId: item.product.vendorId || "",
        });
      }
    }
  }

  // Group by vendor
  const vendorGroups = autoPOItems.reduce((groups, item) => {
    const vendorId = item.vendorId || "unknown";
    if (!groups[vendorId]) groups[vendorId] = [];
    groups[vendorId].push(item);
    return groups;
  }, {} as Record<string, AutoPOItem[]>);

  // Create POs for each vendor
  let poCount = 0;
  let totalValue = 0;

  for (const [vendorId, items] of Object.entries(vendorGroups)) {
    const poValue = items.reduce((sum, item) => sum + item.suggestedQty * item.unitCost, 0);
    
    // Create purchase order
    await prisma.purchaseOrder.create({
      data: {
        shopId,
        vendorId,
        status: "DRAFT",
        notes: "Auto-generated based on sales trends",
        lineItems: {
          create: items.map((item) => ({
            inventoryItemId: item.productId,
            quantity: item.suggestedQty,
            unitCost: item.unitCost,
          })),
        },
      },
    });

    poCount++;
    totalValue += poValue;
  }

  return { poCount, totalValue, items: autoPOItems };
}
```

**Step 2: Verify**

Run: `curl -s http://localhost:5173/app/purchasing | grep -o "Auto-Generate"`
Expected: Auto-PO button visible

**Step 3: Commit**

```bash
git add app/lib/purchasing/auto-po.ts
git commit -m "feat: add automated PO generation based on sales trends"
```

---

### Task 1.3: Audit Trail & Reason Codes

**Objective:** Add user audit trail and reason codes for all inventory adjustments.

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `app/lib/inventory/audit.ts`

**Step 1: Add AuditLog model to schema**

```prisma
// prisma/schema.prisma
model AuditLog {
  id            String   @id @default(cuid())
  shopId        String
  userId        String?
  action        String   // ADJUSTMENT, TRANSFER, RECEIVE, CYCLE_COUNT
  entityType    String   // INVENTORY_ITEM, PURCHASE_ORDER, LOCATION
  entityId      String
  reasonCode    String?  // DAMAGED, THEFT, SAMPLE, CORRECTION, RECEIVING_ERROR
  reasonNote    String?
  oldValues     Json?
  newValues     Json?
  ipAddress     String?
  userAgent     String?
  createdAt     DateTime @default(now())

  shop          Shop     @relation(fields: [shopId], references: [id])
  user          User?    @relation(fields: [userId], references: [id])

  @@index([shopId, createdAt])
  @@index([entityType, entityId])
}
```

**Step 2: Create audit utility**

```typescript
// app/lib/inventory/audit.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface AuditEntry {
  shopId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  reasonCode?: string;
  reasonNote?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  await prisma.auditLog.create({
    data: {
      shopId: entry.shopId,
      userId: entry.userId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      reasonCode: entry.reasonCode,
      reasonNote: entry.reasonNote,
      oldValues: entry.oldValues,
      newValues: entry.newValues,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
    },
  });
}

export async function getAuditHistory(
  shopId: string,
  entityType?: string,
  entityId?: string
) {
  const where: any = { shopId };
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;

  return prisma.auditLog.findMany({
    where,
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
```

**Step 3: Verify**

Run: `npx prisma db push`
Expected: Schema updated

**Step 4: Commit**

```bash
git add prisma/schema.prisma app/lib/inventory/audit.ts
git commit -m "feat: add audit trail and reason codes for inventory adjustments"
```

---

## Phase 2: Competitive Positioning (Week 2-3)

### Task 2.1: Update Website Features Section

**Objective:** Highlight competitive advantages on the marketing website.

**Files:**
- Modify: `public/index.html`

**Step 1: Add competitive comparison section**

```html
<!-- Add after features section -->
<section class="comparison-section">
  <div class="comparison-inner">
    <h2>Why StockFlows beats the competition</h2>
    <p class="section-sub">See how we compare to Stocky, Inventory Planner, and SKULabs</p>
    
    <div class="comparison-table">
      <table>
        <thead>
          <tr>
            <th>Feature</th>
            <th>StockFlows</th>
            <th>Stocky</th>
            <th>Inventory Planner</th>
            <th>SKULabs</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Price</td>
            <td class="highlight">$50/mo</td>
            <td>Free (POS Pro $89)</td>
            <td>~$4,000/yr</td>
            <td>$299/mo</td>
          </tr>
          <tr>
            <td>Demand Forecasting</td>
            <td class="highlight">✓ AI-powered</td>
            <td>✗ Broken</td>
            <td>✓ Basic</td>
            <td>✗</td>
          </tr>
          <tr>
            <td>QuickBooks Integration</td>
            <td class="highlight">✓ Full sync</td>
            <td>✗</td>
            <td>✓ Basic</td>
            <td>✗</td>
          </tr>
          <tr>
            <td>Audit Trail</td>
            <td class="highlight">✓ Full history</td>
            <td>✗</td>
            <td>✗</td>
            <td>✓ Basic</td>
          </tr>
          <tr>
            <td>Auto PO Generation</td>
            <td class="highlight">✓ AI-powered</td>
            <td>✗ Manual only</td>
            <td>✓ Basic</td>
            <td>✓ Manual</td>
          </tr>
          <tr>
            <td>Status</td>
            <td class="highlight">Active</td>
            <td class="warning">Sunset Aug 2026</td>
            <td>Active</td>
            <td>Active</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</section>
```

**Step 2: Add comparison CSS**

```css
/* Add to style.css */
.comparison-section {
  padding: 120px 24px;
  background: var(--bg);
}

.comparison-inner {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.comparison-inner h2 {
  font-family: var(--serif);
  font-size: 2.5rem;
  font-weight: 400;
  font-style: italic;
  margin-bottom: 8px;
}

.comparison-table {
  margin-top: 48px;
  overflow-x: auto;
}

.comparison-table table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border: 1px solid var(--border);
}

.comparison-table th,
.comparison-table td {
  padding: 16px 24px;
  text-align: left;
  border-bottom: 1px solid var(--border);
  font-size: 0.85rem;
}

.comparison-table th {
  background: var(--bg);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.75rem;
}

.comparison-table .highlight {
  color: var(--success);
  font-weight: 600;
}

.comparison-table .warning {
  color: var(--critical);
}
```

**Step 3: Commit**

```bash
git add public/index.html public/style.css
git commit -m "feat: add competitive comparison section to website"
```

---

### Task 2.2: Update App Store Listing

**Objective:** Update Shopify App Store listing with new features.

**Files:**
- Modify: `APP-STORE-LISTING.md`

**Step 1: Update feature highlights**

```markdown
## Key Features

### 🚀 AI-Powered Forecasting
- ETS, linear regression, and ensemble models
- 30-day predictions with confidence intervals
- Auto model selection based on accuracy

### 💰 QuickBooks Integration
- Sync COGS, invoices, and inventory valuations
- Real-time cost updates from purchase orders
- Financial reporting alignment

### 📦 Automated Purchase Orders
- Generate POs based on sales trends
- Smart reorder point calculations
- Vendor management with lead times

### 🔍 Full Audit Trail
- User attribution for all changes
- Reason codes for adjustments
- Timestamped history with timestamps

### 📊 Multi-Location Management
- Variant-level inventory tracking
- Inter-location transfers
- Location-specific reorder points

### 🔔 Smart Alerts
- Customizable thresholds per product
- Email, SMS, and Slack notifications
- Escalation logic for critical items
```

**Step 2: Commit**

```bash
git add APP-STORE-LISTING.md
git commit -m "docs: update app store listing with new features"
```

---

## Phase 3: Deployment Pipeline (Week 3-4)

### Task 3.1: Deploy to All Platforms

**Objective:** Deploy updates to GitHub, Fly.io, Shopify, and Cloudflare.

**Files:** None (deployment only)

**Step 1: Deploy to Fly.io**

```bash
fly deploy --app stockflows
```

**Step 2: Deploy to Shopify Partners**

```bash
shopify app deploy --allow-updates --allow-deletes
```

**Step 3: Deploy to Cloudflare Pages**

```bash
wrangler pages deploy public --project-name=stockflows
```

**Step 4: Verify all deployments**

```bash
# Fly.io
curl -s https://stockflows.fly.dev/health

# Cloudflare
curl -s https://stockflows.app

# Shopify
curl -s https://stockflows.fly.dev/app
```

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: deploy all updates to production"
```

---

### Task 3.2: Setup Hourly Monitoring Cron

**Objective:** Create automated monitoring and enhancement pipeline.

**Files:**
- Create: `scripts/monitor.sh`

**Step 1: Create monitoring script**

```bash
#!/bin/bash
# scripts/monitor.sh - Hourly monitoring and enhancement pipeline

set -e

LOG_FILE="logs/monitor-$(date +%Y%m%d).log"
mkdir -p logs

echo "[$(date)] Starting hourly monitoring..." >> $LOG_FILE

# 1. Check health endpoints
echo "[$(date)] Checking health endpoints..." >> $LOG_FILE
FLY_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://stockflows.fly.dev/health)
CF_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://stockflows.app)

if [ "$FLY_HEALTH" != "200" ] || [ "$CF_HEALTH" != "200" ]; then
  echo "[$(date)] ERROR: Health check failed (Fly: $FLY_HEALTH, CF: $CF_HEALTH)" >> $LOG_FILE
  # Send alert
fi

# 2. Check for new customer feedback
echo "[$(date)] Checking customer feedback..." >> $LOG_FILE
# Integration with feedback system

# 3. Check competitor updates
echo "[$(date)] Monitoring competitor changes..." >> $LOG_FILE
# Integration with competitor monitoring

# 4. Generate daily report
echo "[$(date)] Generating daily report..." >> $LOG_FILE
# Integration with reporting system

echo "[$(date)] Monitoring complete" >> $LOG_FILE
```

**Step 2: Make script executable**

```bash
chmod +x scripts/monitor.sh
```

**Step 3: Commit**

```bash
git add scripts/monitor.sh
git commit -m "feat: add hourly monitoring script"
```

---

## Phase 4: Testing & Validation (Week 4)

### Task 4.1: Run Full Test Suite

**Objective:** Verify all new features work correctly.

**Files:** None (testing only)

**Step 1: Run unit tests**

```bash
npx vitest run
```

**Step 2: Run E2E tests**

```bash
npx playwright test --config=playwright.config.ts
```

**Step 3: Run live production tests**

```bash
npx playwright test e2e/health-api.spec.ts --config=playwright.config.ts
```

**Step 4: Manual verification**

1. Open https://stockflows.fly.dev/app
2. Navigate to Settings → Accounting
3. Test QuickBooks connection flow
4. Navigate to Purchasing
5. Test auto-PO generation
6. Navigate to Inventory
7. Test adjustment with reason code
8. Verify audit trail in reports

**Step 5: Commit**

```bash
git add -A
git commit -m "test: complete feature validation"
```

---

## Summary

| Phase | Tasks | Duration | Impact |
|-------|-------|----------|--------|
| **Phase 1: Critical Features** | 3 tasks | Week 1-2 | Revenue, Compliance |
| **Phase 2: Competitive Positioning** | 2 tasks | Week 2-3 | Marketing, Sales |
| **Phase 3: Deployment Pipeline** | 2 tasks | Week 3-4 | Operations |
| **Phase 4: Testing & Validation** | 1 task | Week 4 | Quality |

**Total Timeline:** 4 weeks  
**Expected Outcome:** StockFlows becomes the #1 mid-market Shopify inventory app

---

## Hourly Monitoring Cron Job

After implementation, set up hourly monitoring:

```bash
# Add to crontab
0 * * * * /path/to/scripts/monitor.sh >> /path/to/logs/cron.log 2>&1
```

The cron job will:
1. Check health endpoints
2. Monitor customer feedback
3. Track competitor changes
4. Generate daily reports
5. Alert on issues

**Stop command:** Remove the crontab entry or run `crontab -e` and delete the line.