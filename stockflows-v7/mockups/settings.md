# Settings Page — StockFlows v7

## Overview

The Settings page provides configuration options for the StockFlows app. It uses a tabbed navigation layout with six tabs: Notifications, Integrations, Team, Billing, Preferences, and Security. Each tab contains grouped settings with toggles, inputs, and dropdowns.

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Top Header Bar]                                           │
├──────────┬──────────────────────────────────────────────────┤
│          │  [Page Title]                                    │
│ Sidebar  │                                                  │
│ (240px)  │  ┌──┬──┬──┬──┬──┬──┐                            │
│          │  │No│In│Te│Bi│Pr│Se│  [Tab Navigation]          │
│          │  │ti│te│am│ll│ef│cu│                            │
│          │  │fi│gr│  │in│er│ri│                            │
│          │  │ca│at│  │g │en│ty│                            │
│          │  │ti│io│  │  │ce│  │                            │
│          │  │on│ns│  │  │  │  │                            │
│          │  ├──┴──┴──┴──┴──┴──┤                            │
│          │  │                  │                            │
│          │  │  [Tab Content]   │                            │
│          │  │                  │                            │
│          │  │  [Settings Groups]│                           │
│          │  │                  │                            │
│          │  │  [Save Button]   │                            │
│          │  │                  │                            │
│          │  └──────────────────┘                            │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

---

## 1. Page Header

| Property | Value |
|----------|-------|
| Title | "Settings" — Inter, 28px, weight 600, `#FFFFFF` |
| Subtitle | "Configure your StockFlows preferences" — Inter, 14px, weight 400, `#A0A3AB` |
| Gap | 4px |
| Margin-bottom | 24px |

---

## 2. Tab Navigation

| Property | Value |
|----------|-------|
| Layout | Flex row, gap: 0 |
| Background | `#14161B` |
| Border | 1px solid `#2A2D35` |
| Border-radius | `8px` |
| Padding | 4px |
| Margin-bottom | 24px |
| Overflow-x | auto (horizontal scroll on mobile) |

### Tab Specs

| Property | Default | Hover | Active |
|----------|---------|-------|--------|
| Padding | 10px 16px | 10px 16px | 10px 16px |
| Background | transparent | `rgba(199,251,51,0.05)` | `#C7FB33` |
| Text color | `#A0A3AB` | `#FFFFFF` | `#0A0B0E` |
| Font | Inter, 13px, weight 500 | Inter, 13px, weight 500 | Inter, 13px, weight 600 |
| Border-radius | 6px | 6px | 6px |
| Icon | Material Symbols, 16px, same color as text | — | — |
| Icon gap | 6px (icon to text) | — | — |
| Transition | 150ms ease | — | — |
| White-space | nowrap | nowrap | nowrap |

### Tab Icons

| Tab | Icon |
|-----|------|
| Notifications | `notifications` |
| Integrations | `extension` |
| Team | `group` |
| Billing | `credit_card` |
| Preferences | `tune` |
| Security | `shield` |

---

## 3. Settings Content Area

| Property | Value |
|----------|-------|
| Background | `#14161B` |
| Border | 1px solid `#2A2D35` |
| Border-radius | `8px` |
| Padding | `24px` |
| Max-width | 800px |

---

## 4. Tab: Notifications

### Section: Alert Preferences

| Property | Value |
|----------|-------|
| Section title | "Alert Preferences" — Inter, 16px, weight 600, `#FFFFFF` |
| Section description | "Choose how you want to be notified about inventory changes" — Inter, 13px, `#A0A3AB` |
| Margin-bottom | 20px |

#### Toggle Setting Row

| Property | Value |
|----------|-------|
| Layout | Flex row, justify: space-between, items: center |
| Padding | 16px 0 |
| Border-bottom | 1px solid `#2A2D35` |

#### Setting Row Contents

| Element | Value |
|---------|-------|
| Label | Inter, 14px, weight 500, `#FFFFFF` |
| Description | Inter, 13px, weight 400, `#A0A3AB`, margin-top: 2px |
| Toggle | Right-aligned |

#### Notification Toggles

| Label | Description | Default |
|-------|-------------|---------|
| Low stock alerts | "Get notified when items fall below reorder point" | ON |
| Out of stock alerts | "Immediate notification when an item goes out of stock" | ON |
| Purchase order updates | "Status changes for purchase orders" | ON |
| Shipment received | "When shipments are checked in at warehouse" | ON |
| Weekly inventory summary | "Email digest of inventory health metrics" | OFF |
| Price change alerts | "When supplier prices change significantly" | OFF |

### Section: Notification Channels

| Property | Value |
|----------|-------|
| Section title | "Notification Channels" — Inter, 16px, weight 600, `#FFFFFF` |
| Section description | "Select how you want to receive notifications" — Inter, 13px, `#A0A3AB` |
| Margin-bottom | 20px |
| Margin-top | 32px |

#### Channel Cards (Grid: 2 columns)

| Property | Value |
|----------|-------|
| Background | `#1C1E24` |
| Border | 1px solid `#2A2D35` |
| Border-radius | `8px` |
| Padding | `16px` |
| Gap | 12px |
| Hover | border: `#3A3D45` |

##### Channel Card: Email

| Element | Value |
|---------|-------|
| Icon | `email` — Material Symbols, 24px, `#60A5FA` |
| Title | "Email" — Inter, 14px, weight 600, `#FFFFFF` |
| Description | "Receive alerts via email" — Inter, 12px, `#A0A3AB` |
| Toggle | ON (right-aligned) |
| Additional input | "Email address" — text input, placeholder: "you@company.com" |

##### Channel Card: Slack

| Element | Value |
|---------|-------|
| Icon | `tag` — Material Symbols, 24px, `#C7FB33` |
| Title | "Slack" — Inter, 14px, weight 600, `#FFFFFF` |
| Description | "Post alerts to Slack channels" — Inter, 12px, `#A0A3AB` |
| Toggle | OFF |
| Additional input | "Webhook URL" — text input, placeholder: "https://hooks.slack.com/..." |

##### Channel Card: SMS

| Element | Value |
|---------|-------|
| Icon | `sms` — Material Symbols, 24px, `#FBBF24` |
| Title | "SMS" — Inter, 14px, weight 600, `#FFFFFF` |
| Description | "Critical alerts via text message" — Inter, 12px, `#A0A3AB` |
| Toggle | OFF |
| Additional input | "Phone number" — text input, placeholder: "+1 (555) 000-0000" |

##### Channel Card: Push Notifications

| Element | Value |
|---------|-------|
| Icon | `phone_android` — Material Symbols, 24px, `#34D399` |
| Title | "Push Notifications" — Inter, 14px, weight 600, `#FFFFFF` |
| Description | "Browser and mobile push alerts" — Inter, 12px, `#A0A3AB` |
| Toggle | ON |
| Additional input | None |

---

## 5. Tab: Integrations

### Section: Connected Apps

| Property | Value |
|----------|-------|
| Section title | "Connected Apps" — Inter, 16px, weight 600, `#FFFFFF` |
| Section description | "Manage your third-party integrations" — Inter, 13px, `#A0A3AB` |

#### Integration Card

| Property | Value |
|----------|-------|
| Background | `#1C1E24` |
| Border | 1px solid `#2A2D35` |
| Border-radius | `8px` |
| Padding | `16px` |
| Layout | Flex row, gap: 16px, items: center |
| Margin-bottom | 12px |
| Hover | border: `#3A3D45` |

##### Integration Card: Shopify

| Element | Value |
|---------|-------|
| Logo | 40x40px, radius: 8px |
| Name | "Shopify" — Inter, 15px, weight 600, `#FFFFFF` |
| Status | "Connected" — Inter, 12px, `#34D399` |
| Last synced | "Last synced: 2 min ago" — Inter, 12px, `#6B6F78` |
| Actions | "Sync Now" button (secondary), "Disconnect" link (`#F87171`) |

##### Integration Card: QuickBooks

| Element | Value |
|---------|-------|
| Logo | 40x40px, radius: 8px |
| Name | "QuickBooks" — Inter, 15px, weight 600, `#FFFFFF` |
| Status | "Connected" — Inter, 12px, `#34D399` |
| Last synced | "Last synced: 1 hour ago" — Inter, 12px, `#6B6F78` |
| Actions | "Sync Now" button, "Disconnect" link |

##### Integration Card: FedEx

| Element | Value |
|---------|-------|
| Logo | 40x40px, radius: 8px |
| Name | "FedEx" — Inter, 15px, weight 600, `#FFFFFF` |
| Status | "Not connected" — Inter, 12px, `#6B6F78` |
| Actions | "Connect" button (primary) |

### Section: Available Integrations

| Property | Value |
|----------|-------|
| Section title | "Available Integrations" — Inter, 16px, weight 600, `#FFFFFF` |
| Section description | "Browse and connect new integrations" — Inter, 13px, `#A0A3AB` |
| Margin-top | 32px |

#### Available Integration Grid

| Property | Value |
|----------|-------|
| Layout | Grid, 3 columns |
| Gap | 12px |

#### Available Integration Card

| Property | Value |
|----------|-------|
| Background | `#1C1E24` |
| Border | 1px solid `#2A2D35` |
| Border-radius | `8px` |
| Padding | `16px` |
| Text-align | center |
| Hover | border: `#C7FB33`, bg: `rgba(199,251,51,0.02)` |
| Cursor | pointer |

| Element | Value |
|---------|-------|
| Logo | 48x48px, radius: 8px, margin: 0 auto |
| Name | Inter, 14px, weight 600, `#FFFFFF`, margin-top: 12px |
| Category | Inter, 11px, weight 500, `#6B6F78`, uppercase, margin-top: 4px |
| Button | "Connect" — Primary button, full width, margin-top: 12px |

---

## 6. Tab: Team

### Section: Team Members

| Property | Value |
|----------|-------|
| Section title | "Team Members" — Inter, 16px, weight 600, `#FFFFFF` |
| Section description | "Manage who has access to your StockFlows account" — Inter, 13px, `#A0A3AB` |
| Action button | "Invite Member" — Primary button, right-aligned |

#### Team Member Row

| Property | Value |
|----------|-------|
| Layout | Flex row, gap: 12px, items: center |
| Padding | 12px 0 |
| Border-bottom | 1px solid `#2A2D35` |

| Element | Value |
|---------|-------|
| Avatar | 36px circle, bg: `#252830`, border: 1px `#3A3D45` |
| Name | Inter, 14px, weight 500, `#FFFFFF` |
| Email | Inter, 12px, `#A0A3AB` |
| Role badge | Inter, 11px, weight 500, padding: 2px 8px, radius: 9999px |
| Last active | Inter, 12px, `#6B6F78`, right-aligned |
| Actions | "Edit" button (ghost), "Remove" button (ghost, `#F87171`) |

#### Role Badges

| Role | Background | Text Color |
|------|-----------|------------|
| Owner | `rgba(199,251,51,0.15)` | `#C7FB33` |
| Admin | `rgba(96,165,250,0.15)` | `#60A5FA` |
| Manager | `rgba(160,163,171,0.15)` | `#A0A3AB` |
| Viewer | `rgba(107,111,120,0.15)` | `#6B6F78` |

### Section: Invitations

| Property | Value |
|----------|-------|
| Section title | "Pending Invitations" — Inter, 16px, weight 600, `#FFFFFF` |
| Margin-top | 32px |

#### Invite Form

| Property | Value |
|----------|-------|
| Layout | Flex row, gap: 12px, items: end |
| Email input | Flex: 1 |
| Role selector | Width: 140px |
| Button | "Send Invite" — Primary |

---

## 7. Tab: Billing

### Section: Current Plan

| Property | Value |
|----------|-------|
| Background | `#1C1E24` |
| Border | 1px solid `#2A2D35` |
| Border-radius | `8px` |
| Padding | `24px` |
| Layout | Flex row, justify: space-between, items: center |

| Element | Value |
|---------|-------|
| Plan name | "Pro Plan" — Inter, 22px, weight 700, `#C7FB33` |
| Price | "$49/month" — Inter, 18px, weight 600, `#FFFFFF` |
| Billing cycle | "Billed monthly" — Inter, 13px, `#A0A3AB` |
| Next invoice | "Next invoice: August 7, 2026" — Inter, 13px, `#6B6F78` |
| Actions | "Upgrade" button (primary), "Cancel" link (`#F87171`) |

### Section: Usage

| Property | Value |
|----------|-------|
| Section title | "Usage This Month" — Inter, 16px, weight 600, `#FFFFFF` |
| Margin-top | 24px |

#### Usage Meters (Grid: 2 columns)

| Property | Value |
|----------|-------|
| Gap | 16px |

#### Usage Meter

| Element | Value |
|---------|-------|
| Label | Inter, 13px, weight 500, `#A0A3AB` |
| Value | Inter, 14px, weight 600, `#FFFFFF` |
| Progress bar | Height: 8px, radius: 9999px, bg: `#252830` |
| Progress fill | bg: `#C7FB33`, transition: 300ms ease |
| Warning state (80%+) | fill: `#FBBF24` |
| Critical state (95%+) | fill: `#F87171` |

#### Usage Meters

| Metric | Used | Limit | Percentage |
|--------|------|-------|------------|
| Products | 2,847 | 5,000 | 57% — green |
| Team members | 8 | 10 | 80% — yellow |
| API calls | 14,200 | 50,000 | 28% — green |
| Storage | 2.4 GB | 5 GB | 48% — green |

### Section: Payment Method

| Property | Value |
|----------|-------|
| Section title | "Payment Method" — Inter, 16px, weight 600, `#FFFFFF` |
| Margin-top | 24px |

#### Payment Card Display

| Property | Value |
|----------|-------|
| Background | `#1C1E24` |
| Border | 1px solid `#2A2D35` |
| Border-radius | `8px` |
| Padding | `16px` |
| Layout | Flex row, gap: 12px, items: center |

| Element | Value |
|---------|-------|
| Card icon | 40x28px |
| Last 4 digits | "•••• 4242" — Inter, 14px, `#FFFFFF` |
| Expiry | "Exp 12/2027" — Inter, 12px, `#A0A3AB` |
| Actions | "Update" button (ghost) |

---

## 8. Tab: Preferences

### Section: General

#### Setting Rows

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Default currency | Select dropdown | USD ($) | "Currency for cost calculations" |
| Date format | Select dropdown | MM/DD/YYYY | "How dates are displayed" |
| Timezone | Select dropdown | America/New_York | "Your local timezone" |
| Low stock threshold | Number input | 10 | "Default reorder point for new products" |
| Auto-sync interval | Select dropdown | 5 minutes | "How often to sync with Shopify" |

### Section: Display

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Compact mode | Toggle | OFF | "Show more items on screen" |
| Show SKU column | Toggle | ON | "Display SKU in inventory table" |
| Show cost column | Toggle | ON | "Display cost in inventory table" |
| Default sort | Select dropdown | "Last updated" | "Default table sort order" |
| Items per page | Select dropdown | 25 | "Number of items per page" |

---

## 9. Tab: Security

### Section: Authentication

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Two-factor authentication | Toggle | OFF | "Add an extra layer of security" |
| Session timeout | Select dropdown | 30 minutes | "Auto-logout after inactivity" |
| IP whitelist | Text input | Empty | "Restrict access to specific IPs" |

### Section: API Keys

| Property | Value |
|----------|-------|
| Section title | "API Keys" — Inter, 16px, weight 600, `#FFFFFF` |
| Description | "Manage API keys for programmatic access" — Inter, 13px, `#A0A3AB` |

#### API Key Row

| Element | Value |
|---------|-------|
| Key name | Inter, 14px, weight 500, `#FFFFFF` |
| Key preview | "sf_live_••••••••••••••••" — Fira Code, 13px, `#A0A3AB` |
| Created date | Inter, 12px, `#6B6F78` |
| Last used | Inter, 12px, `#6B6F78` |
| Actions | "Regenerate" button (ghost, `#FBBF24`), "Revoke" button (ghost, `#F87171`) |

---

## 10. Form Input Specs

### Text Input

| Property | Default | Focus | Error | Disabled |
|----------|---------|-------|-------|----------|
| Background | `#1C1E24` | `#1C1E24` | `#1C1E24` | `#14161B` |
| Border | 1px solid `#2A2D35` | 1px solid `#C7FB33` | 1px solid `#F87171` | 1px solid `#2A2D35` |
| Border-radius | 6px | 6px | 6px | 6px |
| Padding | 10px 12px | 10px 12px | 10px 12px | 10px 12px |
| Text color | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#6B6F78` |
| Placeholder color | `#6B6F78` | `#6B6F78` | `#6B6F78` | `#6B6F78` |
| Font | Inter, 14px | Inter, 14px | Inter, 14px | Inter, 14px |
| Transition | 150ms ease | — | — | — |
| Box-shadow (focus) | none | `0 0 0 3px rgba(199,251,51,0.15)` | `0 0 0 3px rgba(248,113,113,0.15)` | none |

### Select Dropdown

| Property | Value |
|----------|-------|
| Background | `#1C1E24` |
| Border | 1px solid `#2A2D35` |
| Border-radius | 6px |
| Padding | 10px 12px |
| Text color | `#FFFFFF` |
| Font | Inter, 14px |
| Icon | `expand_more` — Material Symbols, 18px, `#A0A3AB` |
| Hover | border: `#3A3D45` |
| Focus | border: `#C7FB33`, box-shadow: `0 0 0 3px rgba(199,251,51,0.15)` |

### Toggle Switch

| Property | Off | On | Disabled |
|----------|-----|-----|----------|
| Width | 44px | 44px | 44px |
| Height | 24px | 24px | 24px |
| Background | `#2A2D35` | `#C7FB33` | `#2A2D35` |
| Border-radius | 9999px | 9999px | 9999px |
| Knob size | 18px | 18px | 18px |
| Knob bg | `#6B6F78` | `#0A0B0E` | `#3A3D45` |
| Knob position (off) | left: 3px | — | left: 3px |
| Knob position (on) | — | left: 23px | left: 3px |
| Transition | 200ms ease | 200ms ease | — |
| Box-shadow (focus) | `0 0 0 3px rgba(199,251,51,0.15)` | `0 0 0 3px rgba(199,251,51,0.15)` | none |
| Cursor | pointer | pointer | not-allowed |

### Number Input

Same as text input, with:
- Right-aligned text
- Increment/decrement arrows (optional, hidden by default)
- Min/max validation

---

## 11. Save Button

| Property | Value |
|----------|-------|
| Position | Sticky bottom of settings area |
| Background | `#14161B` |
| Border-top | 1px solid `#2A2D35` |
| Padding | 16px 24px |
| Layout | Flex row, justify: flex-end, gap: 12px |

| Button | Style |
|--------|-------|
| "Cancel" | Ghost — bg: transparent, border: 1px `#2A2D35`, text: `#A0A3AB`, hover: border `#3A3D45`, text `#FFFFFF` |
| "Save Changes" | Primary — bg: `#C7FB33`, text: `#0A0B0E`, hover: bg `#D4FF5C` |

### Save Button States

| State | Behavior |
|-------|----------|
| No changes | Disabled — opacity: 0.5, cursor: not-allowed |
| Changes made | Enabled — full opacity, clickable |
| Saving | Loading spinner (16px, `#0A0B0E`), button disabled |
| Saved | Checkmark icon (16px) + "Saved" text for 2s, then revert |

---

## 12. Responsive Behavior

### Desktop (≥1280px)

- Full sidebar (240px)
- Tab navigation: horizontal, all tabs visible
- Settings content: max-width 800px
- 2-column grids for integrations and usage meters

### Tablet (768px – 1279px)

- Collapsed sidebar (64px icon-only)
- Tab navigation: horizontal, scrollable
- Settings content: full width
- 2-column grids for integrations and usage meters

### Mobile (< 768px)

- Sidebar hidden (hamburger toggle)
- Tab navigation: horizontal scroll, tabs truncated to icons only
- Settings content: full width, padding: 16px
- Single column for all grids
- Save button: full width, fixed bottom

### Mobile Tab Navigation (Icon-only)

| Tab | Icon | Label (hidden) |
|-----|------|----------------|
| Notifications | `notifications` | "Notifications" |
| Integrations | `extension` | "Integrations" |
| Team | `group` | "Team" |
| Billing | `credit_card` | "Billing" |
| Preferences | `tune` | "Preferences" |
| Security | `shield` | "Security" |

---

## 13. Implementation Notes

### Form State Management

- Use React state or form library (Formik, React Hook Form)
- Track dirty state for save button enable/disable
- Debounce auto-save for preference toggles (300ms)
- Optimistic updates for toggles

### Validation

- Email fields: RFC 5322 validation
- Phone fields: E.164 format
- IP whitelist: IPv4/IPv6 validation
- Required fields: visual indicator (red asterisk `*`)

### Keyboard Navigation

- `Tab` — Move between form elements
- `Enter` — Submit focused input
- `Space` — Toggle switches
- `Arrow keys` — Navigate dropdown options
- `Escape` — Close dropdowns, cancel edit

### Accessibility

- All toggles: `role="switch"` with `aria-checked`
- Tabs: `role="tablist"`, `role="tab"`, `role="tabpanel"`
- Form inputs: `aria-describedby` for help text
- Error states: `aria-invalid="true"`, `aria-describedby` for error message
- Live regions: `aria-live="polite"` for save confirmation
