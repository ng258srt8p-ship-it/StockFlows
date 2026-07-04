# StockFlows Demo — Mirror Shopify App Plan

## Goal
Make the demo at stockflows.app/demo exactly match the Shopify app at stockflows.fly.dev/app in layout, navigation, components, and styling — but using dummy data instead of live Shopify data.

## Key Differences Found

| Element | Shopify App | Current Demo | Fix Required |
|---------|-------------|--------------|--------------|
| **Sidebar** | Dark charcoal (#1F2225), 215px | Dark (#111), 240px | Match exact width/color |
| **Nav items** | Dashboard, Inventory, Purchasing, Forecasting, Reports, Settings | Same | ✅ Already matches |
| **Heading font** | Inter (bold, never italic) | Instrument Serif (italic) | Change to Inter bold |
| **Stats** | 26 SKUs, 9 Low Stock, 6 OOS, $0 Value | 35 SKUs, $47,892.50, 6, 2, 3, 6 | Match exact values |
| **Page headers** | Polaris Page with heading + subtitle | Custom h1 + subtitle | Match Polaris style |
| **Cards** | Polaris Card (white, subtle shadow, 4px radius) | Custom (white, 1px border, 0 radius) | Add shadow, radius |
| **Badges** | Polaris Badge (solid pill, 4px radius) | Custom (outlined, 2px radius) | Match Polaris style |
| **Tables** | Custom HTML table (not IndexTable) | Custom HTML table | Match exact structure |
| **Buttons** | Polaris Button (green #008060 primary) | Custom black buttons | Match Polaris style |
| **Color tokens** | Polaris tokens (#008060, #006FBB, etc.) | Custom (#111, #dc2626, etc.) | Update to Polaris |
| **Settings** | Form with Card, TextField, Select, Checkbox | Custom toggle switches | Match Polaris form |

## Implementation Tasks

### Task 1: Update Color System
Replace custom colors with Polaris design tokens.

### Task 2: Fix Sidebar Navigation
Match exact width (215px), colors, and active state.

### Task 3: Update Typography
Replace Instrument Serif with Inter bold for headings.

### Task 4: Match Dashboard Stats
Update values to match Shopify app (26, 9, 6, $0).

### Task 5: Update Card Styles
Add Polaris-style shadows and border-radius.

### Task 6: Update Badge Styles
Match Polaris solid pill badges.

### Task 7: Update Button Styles
Match Polaris primary (green) and secondary buttons.

### Task 8: Update Table Styles
Match the exact table structure from the Shopify app.

### Task 9: Update Settings Page
Match Polaris form components (TextField, Select, Checkbox).

### Task 10: Test and Deploy
Run E2E tests, commit, deploy to Cloudflare.
