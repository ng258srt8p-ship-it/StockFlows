# Purchase Order Detail — StockFlows v7

## Overview

The Purchase Order (PO) Detail page displays comprehensive information about a specific purchase order. It includes a PO info card, line items table, order timeline, and action buttons. The layout uses a two-column design with the main content on the left and a sidebar panel on the right.

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Top Header Bar]                                           │
├──────────┬──────────────────────────────────────────────────┤
│          │  [Breadcrumb]  [Page Title]     [Actions]        │
│ Sidebar  │                                                  │
│ (240px)  │  ┌──────────────────────┐ ┌────────────────────┐│
│          │  │                      │ │  PO Info Card      ││
│          │  │  [Line Items Table]  │ │  (Right Sidebar)   ││
│          │  │                      │ │                    ││
│          │  │                      │ ├────────────────────┤│
│          │  │                      │ │  Order Timeline    ││
│          │  │                      │ │  (Right Sidebar)   ││
│          │  │                      │ │                    ││
│          │  └──────────────────────┘ └────────────────────┘│
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

---

## 1. Page Header

### Breadcrumb

| Property | Value |
|----------|-------|
| Layout | Flex row, gap: 8px, items: center |
| Margin-bottom | 8px |

| Element | Value |
|---------|-------|
| "Purchase Orders" | Inter, 13px, `#A0A3AB`, hover: `#C7FB33` |
| Separator | `chevron_right` — Material Symbols, 14px, `#6B6F78` |
| "PO-2847" | Inter, 13px, weight 500, `#FFFFFF` |

### Title Row

| Property | Value |
|----------|-------|
| Layout | Flex row, justify: space-between, items: center |
| Margin-bottom | 24px |

| Element | Value |
|---------|-------|
| Title | "Purchase Order #PO-2847" — Inter, 28px, weight 600, `#FFFFFF` |
| Status badge | See Status Badge section below |
| Actions | See Action Buttons section below |

---

## 2. Status Badge

| Status | Background | Text | Icon |
|--------|-----------|------|------|
| Draft | `rgba(107,111,120,0.15)` | `#6B6F78` | `edit` |
| Pending | `rgba(251,191,36,0.15)` | `#FBBF24` | `schedule` |
| Approved | `rgba(96,165,250,0.15)` | `#60A5FA` | `check_circle` |
| Sent | `rgba(199,251,51,0.15)` | `#C7FB33` | `send` |
| Partially Received | `rgba(96,165,250,0.15)` | `#60A5FA` | `inventory_2` |
| Received | `rgba(52,211,153,0.15)` | `#34D399` | `check_circle` |
| Cancelled | `rgba(248,113,113,0.15)` | `#F87171` | `cancel` |

### Badge Specs

| Property | Value |
|----------|-------|
| Display | inline-flex |
| Padding | 4px 12px |
| Border-radius | 9999px |
| Font | Inter, 12px, weight 600 |
| Gap | 4px (icon to text) |
| Icon size | 14px |

---

## 3. Action Buttons

| Button | Style | Visibility |
|--------|-------|------------|
| "Edit" | Secondary | Draft only |
| "Send to Vendor" | Primary | Draft, Approved |
| "Mark as Received" | Primary | Sent, Partially Received |
| "Download PDF" | Ghost | All states |
| "Print" | Ghost | All states |
| "Cancel PO" | Danger | Draft, Pending, Approved |
| "More Actions" | Ghost with dropdown | All states |

### Button Group

| Property | Value |
|----------|-------|
| Layout | Flex row, gap: 8px, items: center |
| Position | Right-aligned in title row |

---

## 4. Main Content — Line Items Table

### Table Container

| Property | Value |
|----------|-------|
| Background | `#14161B` |
| Border | 1px solid `#2A2D35` |
| Border-radius | `8px` |
| Overflow | horizontal scroll on mobile |

### Table Header

| Property | Value |
|----------|-------|
| Background | `#1C1E24` |
| Border-bottom | 2px solid `#2A2D35` |
| Height | 44px |
| Padding | 0 16px |

### Table Columns

| # | Column | Width | Align | Notes |
|---|--------|-------|-------|-------|
| 1 | ☐ (checkbox) | 44px | center | Select all |
| 2 | Product | flex: 1 | left | Name + SKU |
| 3 | Qty Ordered | 100px | right | |
| 4 | Qty Received | 100px | right | |
| 5 | Unit Cost | 100px | right | |
| 6 | Total | 110px | right | |
| 7 | Status | 120px | left | Per-item status |
| 8 | Actions | 48px | center | Row menu |

### Table Row Specs

| Property | Default | Hover | Selected |
|----------|---------|-------|----------|
| Background | transparent | `#1C1E24` | `rgba(199,251,51,0.05)` |
| Border-bottom | 1px solid `#2A2D35` | 1px solid `#2A2D35` | 1px solid `#2A2D35` |
| Height | 52px | 52px | 52px |

### Cell Specs

| Element | Value |
|---------|-------|
| Padding | 12px 16px |
| Font (data) | Inter, 13px, weight 400, `#FFFFFF` |
| Font (secondary) | Inter, 12px, weight 400, `#A0A3AB` |
| SKU display | Fira Code, 12px, `#6B6F78` |
| Product name | Inter, 14px, weight 500, `#FFFFFF` |
| SKU subtitle | Inter, 12px, `#6B6F78`, margin-top: 2px |

### Line Item Status Badges (Per-item)

| Status | Background | Text |
|--------|-----------|------|
| Pending | `rgba(107,111,120,0.15)` | `#6B6F78` |
| Received | `rgba(52,211,153,0.15)` | `#34D399` |
| Partial | `rgba(251,191,36,0.15)` | `#FBBF24` |
| Cancelled | `rgba(248,113,113,0.15)` | `#F87171` |

### Sample Line Items

```
☐  Running Water Bottle (32oz)          100    100    $8.50   $850.00   [Received]   ⋮
    SKU-4821

☐  Trail Mix Sampler Pack                50     50   $12.00   $600.00   [Received]   ⋮
    SKU-1203

☐  Organic Honey Jar (16oz)             200      0   $15.75  $3,150.00  [Pending]    ⋮
    SKU-7744

☐  Bamboo Cutting Board Set              75     75   $22.00  $1,650.00  [Received]   ⋮
    SKU-2299

☐  Ceramic Mug 12oz                     100     30    $6.50    $650.00  [Partial]    ⋮
    SKU-3311
```

### Table Footer

| Property | Value |
|----------|-------|
| Background | `#1C1E24` |
| Border-top | 2px solid `#2A2D35` |
| Height | 48px |
| Padding | 0 16px |

| Element | Value |
|---------|-------|
| Total items | "5 items" — Inter, 13px, weight 500, `#A0A3AB` |
| Total quantity | "525 units" — Inter, 13px, weight 500, `#A0A3AB` |
| Total cost | "$6,900.00" — Inter, 16px, weight 700, `#C7FB33` |
| Layout | Flex row, justify: space-between, items: center |

---

## 5. Right Sidebar — PO Info Card

### Card Container

| Property | Value |
|----------|-------|
| Background | `#14161B` |
| Border | 1px solid `#2A2D35` |
| Border-radius | `8px` |
| Padding | `20px` |
| Width | 320px |
| Position | Sticky, top: 88px |

### Card Header

| Element | Value |
|---------|-------|
| Title | "Order Details" — Inter, 16px, weight 600, `#FFFFFF` |
| Margin-bottom | 16px |

### Info Rows

| Property | Value |
|----------|-------|
| Layout | Flex column, gap: 12px |

#### Info Row

| Property | Value |
|----------|-------|
| Layout | Flex row, justify: space-between, items: center |
| Padding | 8px 0 |
| Border-bottom | 1px solid `#2A2D35` |

| Element | Value |
|---------|-------|
| Label | Inter, 13px, weight 400, `#A0A3AB` |
| Value | Inter, 13px, weight 500, `#FFFFFF` |
| Value (highlight) | Inter, 13px, weight 500, `#C7FB33` |

### Info Row Data

| Label | Value | Highlight |
|-------|-------|-----------|
| Vendor | Pacific Supply Co. | — |
| Order Date | July 3, 2026 | — |
| Expected Delivery | July 12, 2026 | — |
| Shipping Method | Standard Ground | — |
| Shipping Cost | $127.50 | — |
| Subtotal | $6,900.00 | — |
| Tax | $552.00 | — |
| **Total** | **$7,579.50** | `#C7FB33` |

### Card Section: Vendor Info

| Property | Value |
|----------|-------|
| Section title | "Vendor" — Inter, 14px, weight 600, `#FFFFFF` |
| Margin-top | 20px |
| Margin-bottom | 12px |

#### Vendor Details

| Element | Value |
|---------|-------|
| Company | "Pacific Supply Co." — Inter, 14px, weight 500, `#FFFFFF` |
| Contact | "John Martinez" — Inter, 13px, `#A0A3AB` |
| Email | "orders@pacificsupply.com" — Inter, 13px, `#60A5FA` |
| Phone | "+1 (555) 234-5678" — Inter, 13px, `#60A5FA` |
| Address | "1234 Supply Chain Dr, Portland, OR 97201" — Inter, 12px, `#6B6F78` |
| Layout | Flex column, gap: 6px |

### Card Section: Shipping Address

| Property | Value |
|----------|-------|
| Section title | "Ship To" — Inter, 14px, weight 600, `#FFFFFF` |
| Margin-top | 20px |
| Margin-bottom | 12px |

| Element | Value |
|---------|-------|
| Warehouse | "Warehouse A" — Inter, 14px, weight 500, `#FFFFFF` |
| Address | "5678 Warehouse Blvd, Suite 100" — Inter, 13px, `#A0A3AB` |
| City/State | "Portland, OR 97204" — Inter, 13px, `#A0A3AB` |

### Card Section: Notes

| Property | Value |
|----------|-------|
| Section title | "Notes" — Inter, 14px, weight 600, `#FFFFFF` |
| Margin-top | 20px |
| Margin-bottom | 12px |

| Element | Value |
|---------|-------|
| Notes text | "Rush order for summer inventory restock. Please include packing slips for each item." — Inter, 13px, `#A0A3AB` |
| Edit link | "Edit notes" — Inter, 12px, `#C7FB33` |

---

## 6. Right Sidebar — Order Timeline

### Timeline Container

| Property | Value |
|----------|-------|
| Background | `#14161B` |
| Border | 1px solid `#2A2D35` |
| Border-radius | `8px` |
| Padding | `20px` |
| Width | 320px |
| Margin-top | 16px |

### Timeline Header

| Element | Value |
|---------|-------|
| Title | "Order Timeline" — Inter, 16px, weight 600, `#FFFFFF` |
| Margin-bottom | 16px |

### Timeline Items

| Property | Value |
|----------|-------|
| Layout | Flex column, relative |
| Padding-left | 28px (for connector line) |

### Timeline Item

| Property | Value |
|----------|-------|
| Layout | Flex column, gap: 4px |
| Padding | 12px 0 |
| Position | relative |

### Timeline Connector

| Property | Value |
|----------|-------|
| Position | absolute, left: -28px, top: 0 |
| Width | 2px |
| Height | 100% |
| Background | `#2A2D35` |

### Timeline Dot

| Property | Value |
|----------|-------|
| Position | absolute, left: -33px, top: 16px |
| Width | 12px |
| Height | 12px |
| Border-radius | 9999px |
| Border | 2px solid |
| Background | `#0A0B0E` |
| z-index | 1 |

#### Dot States

| State | Border Color | Background |
|-------|-------------|------------|
| Completed | `#34D399` | `#34D399` (filled) |
| Current | `#C7FB33` | `#C7FB33` (filled, with pulse animation) |
| Pending | `#6B6F78` | `#0A0B0E` |
| Cancelled | `#F87171` | `#F87171` (filled) |

### Timeline Content

| Element | Value |
|---------|-------|
| Event title | Inter, 14px, weight 500, `#FFFFFF` |
| Event description | Inter, 13px, weight 400, `#A0A3AB` |
| Event timestamp | Inter, 11px, weight 400, `#6B6F78` |
| Event actor | Inter, 12px, weight 500, `#60A5FA` |

### Sample Timeline

```
●  PO Created
   "Purchase order #PO-2847 created"
   Created by Sarah Chen
   July 3, 2026 at 10:15 AM

●  Vendor Notified
   "PO sent to Pacific Supply Co."
   Sent by Sarah Chen
   July 3, 2026 at 10:22 AM

●  Vendor Confirmed
   "Pacific Supply Co. confirmed order"
   Auto-confirmed
   July 4, 2026 at 8:00 AM

●  Shipped
   "Shipment tracking: 1Z999AA10123456784"
   Carrier: UPS Ground
   July 8, 2026 at 2:45 PM

○  Partially Received
   "3 of 5 items received at Warehouse A"
   Received by Mike Johnson
   July 10, 2026 at 9:30 AM

○  Pending
   "Awaiting remaining items"
```

---

## 7. Notes Section (Below Line Items)

### Container

| Property | Value |
|----------|-------|
| Background | `#14161B` |
| Border | 1px solid `#2A2D35` |
| Border-radius | `8px` |
| Padding | `20px` |
| Margin-top | 16px |

### Header

| Element | Value |
|---------|-------|
| Title | "Internal Notes" — Inter, 16px, weight 600, `#FFFFFF` |
| Action | "Add Note" — Inter, 13px, `#C7FB33`, hover: `#D4FF5C` |

### Note Item

| Property | Value |
|----------|-------|
| Padding | 12px 0 |
| Border-bottom | 1px solid `#2A2D35` |
| Layout | Flex column, gap: 6px |

| Element | Value |
|---------|-------|
| Author | Inter, 13px, weight 500, `#FFFFFF` |
| Timestamp | Inter, 11px, `#6B6F78` |
| Content | Inter, 13px, `#A0A3AB` |

### Sample Notes

```
Sarah Chen — July 3, 2026 at 10:15 AM
"Rush order for summer restock. Need these items by July 12 at the latest."

Mike Johnson — July 10, 2026 at 9:30 AM
"Received 3 of 5 items. Organic Honey Jars and Ceramic Mugs still pending. 
Vendor says they ship separately."
```

---

## 8. Responsive Behavior

### Desktop (≥1280px)

- Full sidebar (240px)
- Two-column layout: main content (flex: 1) + right sidebar (320px)
- All table columns visible
- Sticky right sidebar

### Tablet (768px – 1279px)

- Collapsed sidebar (64px icon-only)
- Two-column layout: main content (flex: 1) + right sidebar (280px)
- Table columns: Product, Qty Ordered, Qty Received, Total, Status, Actions
- Right sidebar scrolls with content (not sticky)

### Mobile (< 768px)

- Sidebar hidden (hamburger toggle)
- Single column layout
- PO info card: full width, above table
- Table: card-based layout instead of table
- Timeline: full width, below table
- Padding: 16px

### Mobile Line Item Card

```
┌────────────────────────────────┐
│ Running Water Bottle (32oz)    │
│ SKU-4821                       │
│                                │
│ Ordered: 100    Received: 100  │
│ Unit Cost: $8.50   Total: $850 │
│                                │
│ [Received]              [⋮]    │
└────────────────────────────────┘
```

---

## 9. PDF Export Template

When "Download PDF" is clicked, generate a PDF with:

### PDF Layout

| Property | Value |
|----------|-------|
| Page size | A4 |
| Margins | 20mm |
| Font | Inter (fallback: Helvetica) |

### PDF Sections

1. **Header**
   - StockFlows logo
   - "PURCHASE ORDER" title
   - PO number, date, status

2. **Vendor & Ship To**
   - Side-by-side columns
   - Company name, contact, address

3. **Line Items Table**
   - Full table with all columns
   - Alternating row backgrounds (`#F7F9FC` / `#FFFFFF`)

4. **Totals**
   - Subtotal, shipping, tax, total
   - Right-aligned

5. **Notes**
   - Internal notes section

6. **Footer**
   - "Generated by StockFlows"
   - Page number
   - Timestamp

---

## 10. Implementation Notes

### Data Structure

```typescript
interface PurchaseOrder {
  id: string;              // "PO-2847"
  status: POStatus;
  vendor: Vendor;
  orderDate: Date;
  expectedDelivery: Date;
  shippingMethod: string;
  shippingCost: number;
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
  lineItems: LineItem[];
  timeline: TimelineEvent[];
  internalNotes: Note[];
}

interface LineItem {
  id: string;
  product: Product;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  total: number;
  status: 'pending' | 'received' | 'partial' | 'cancelled';
}

interface TimelineEvent {
  id: string;
  type: 'created' | 'sent' | 'confirmed' | 'shipped' | 'received' | 'completed';
  title: string;
  description: string;
  actor: string;
  timestamp: Date;
  metadata?: Record<string, string>;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/purchase-orders/:id` | Get PO details |
| PUT | `/api/purchase-orders/:id` | Update PO |
| POST | `/api/purchase-orders/:id/send` | Send to vendor |
| POST | `/api/purchase-orders/:id/receive` | Mark items received |
| POST | `/api/purchase-orders/:id/cancel` | Cancel PO |
| GET | `/api/purchase-orders/:id/pdf` | Generate PDF |

### Real-time Updates

- WebSocket connection for live status updates
- When vendor confirms order, update timeline in real-time
- When shipment is received, update quantities and status
- Toast notification on status changes

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `E` | Edit PO |
| `S` | Send to vendor |
| `R` | Mark as received |
| `D` | Download PDF |
| `P` | Print |
| `Esc` | Close modals/dropdowns |
