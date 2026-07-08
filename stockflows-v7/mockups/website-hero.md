# Marketing Website Hero — StockFlows v7

## Overview

The marketing website hero section is the first thing visitors see. It features a terminal-style demo preview showcasing StockFlows' command-line power, paired with compelling headline copy and a clear call-to-action. The design uses a dark gradient background with neon green accents.

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Navigation Bar]                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         ┌───────────────────────┐  ┌────────────────────┐  │
│         │                       │  │                    │  │
│         │    [Headline]         │  │  Terminal Demo     │  │
│         │    [Subcopy]          │  │  (Code Preview)    │  │
│         │                       │  │                    │  │
│         │    [CTA Buttons]      │  │                    │  │
│         │                       │  └────────────────────┘  │
│         └───────────────────────┘                          │
│                                                             │
│         [Trust Logos Row]                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Navigation Bar

| Property | Value |
|----------|-------|
| Height | 64px |
| Background | `rgba(10,11,14,0.8)` — semi-transparent primary bg |
| Backdrop-filter | blur(12px) |
| Border-bottom | 1px solid `rgba(42,45,53,0.5)` |
| Position | Fixed top, full width, z-index: 1000 |
| Padding | 0 40px |

### Nav Contents (Left to Right)

| Element | Style | Details |
|---------|-------|---------|
| Logo (StockFlows) | Fira Code, 20px, weight 700, `#C7FB33` | "Stock" in `#FFFFFF`, "Flows" in `#C7FB33` |
| Nav Links | Inter, 14px, weight 400, `#A0A3AB` | Hover: `#FFFFFF` |
| Links | Features, Pricing, Docs, Blog | Gap: 32px between links |
| CTA Button | Primary — bg: `#C7FB33`, text: `#0A0B0E`, 13px, weight 600 | "Get Started Free" |
| Right secondary | Inter, 14px, `#A0A3AB` | "Sign in" link |

### Mobile Nav

| Property | Value |
|----------|-------|
| Hamburger icon | `menu` — Material Symbols, 24px, `#FFFFFF` |
| Mobile menu | Full-screen overlay, bg: `#0A0B0E`, padding: 24px |
| Close icon | `close` — Material Symbols, 24px, `#FFFFFF` |

---

## 2. Hero Section

| Property | Value |
|----------|-------|
| Background | Linear gradient: `linear-gradient(180deg, #0A0B0E 0%, #0D1117 50%, #0A0B0E 100%)` |
| Min-height | `calc(100vh - 64px)` |
| Padding | 80px 40px 60px |
| Layout | Flex, 2 columns on desktop |
| Max-width | 1200px, centered |
| Position | relative |
| Overflow | hidden (for background effects) |

### Background Effects

| Effect | Property |
|--------|----------|
| Radial glow 1 | `radial-gradient(ellipse at 30% 20%, rgba(199,251,51,0.08) 0%, transparent 50%)` |
| Radial glow 2 | `radial-gradient(ellipse at 70% 80%, rgba(199,251,51,0.05) 0%, transparent 50%)` |
| Grid pattern | Subtle grid overlay, 60px spacing, `rgba(42,45,53,0.3)` |
| Grid line width | 1px |

---

## 3. Left Column — Copy & CTAs

| Property | Value |
|----------|-------|
| Flex | 1 |
| Max-width | 520px |
| Padding-right | 40px |
| Display | flex, flex-direction: column, gap: 24px |
| Align | flex-start |
| Justify | center |

### Headline

| Element | Value |
|---------|-------|
| Tag | h1 |
| Text | "Inventory management that moves at your speed" |
| Font | Inter, 52px, weight 700 |
| Line-height | 1.1 |
| Letter-spacing | -0.02em |
| Color | `#FFFFFF` |

### Subheadline

| Element | Value |
|---------|-------|
| Tag | p |
| Text | "Stop guessing. Start knowing. StockFlows gives you real-time visibility, automated reordering, and intelligent alerts — so you never miss a sale or overstock again." |
| Font | Inter, 18px, weight 400 |
| Line-height | 1.6 |
| Color | `#A0A3AB` |
| Max-width | 480px |

### CTA Buttons

| Button | Style | Specs |
|--------|-------|-------|
| "Start Free Trial" | Primary | bg: `#C7FB33`, text: `#0A0B0E`, font: Inter 15px weight 600, height: 48px, padding: 0 24px, radius: 8px, shadow: `0 0 20px rgba(199,251,51,0.3)` |
| "Watch Demo" | Ghost | bg: transparent, border: 1px solid `#3A3D45`, text: `#FFFFFF`, font: Inter 15px weight 500, height: 48px, padding: 0 24px, radius: 8px, icon: `play_circle` 20px left |

### Button Group

| Property | Value |
|----------|-------|
| Layout | Flex row, gap: 12px |
| Margin-top | 8px |

### Button Hover States

| Button | Hover Effect |
|--------|-------------|
| Primary | bg: `#D4FF5C`, shadow: `0 0 30px rgba(199,251,51,0.4)`, transform: `translateY(-1px)` |
| Ghost | border: `#C7FB33`, text: `#C7FB33`, bg: `rgba(199,251,51,0.05)` |

### Social Proof

| Element | Value |
|---------|-------|
| Text | "Trusted by 2,400+ Shopify stores" — Inter, 13px, `#6B6F78` |
| Avatars | 3 overlapping circles (24px), bg: `#252830`, border: 2px `#0A0B0E` |
| Layout | Flex row, gap: 12px, items: center |
| Margin-top | 16px |

---

## 4. Right Column — Terminal Demo

| Property | Value |
|----------|-------|
| Flex | 1 |
| Max-width | 560px |
| Position | relative |

### Terminal Window

| Property | Value |
|----------|-------|
| Background | `#0D1117` |
| Border | 1px solid `#2A2D35` |
| Border-radius | `12px` |
| Box-shadow | `0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(199,251,51,0.05)` |
| Overflow | hidden |
| Transform | `perspective(1000px) rotateY(-2deg) rotateX(1deg)` |

### Terminal Title Bar

| Property | Value |
|----------|-------|
| Height | 40px |
| Background | `#1C1E24` |
| Border-bottom | 1px solid `#2A2D35` |
| Padding | 0 16px |
| Layout | Flex row, items: center, gap: 8px |

### Title Bar Controls

| Element | Size | Color |
|---------|------|-------|
| Red dot (close) | 12px circle | `#F87171` |
| Yellow dot (minimize) | 12px circle | `#FBBF24` |
| Green dot (maximize) | 12px circle | `#34D399` |

### Title Bar Text

| Element | Value |
|---------|-------|
| Title | "StockFlows CLI" — Fira Code, 12px, weight 400, `#6B6F78` |
| Position | Centered |

### Terminal Content Area

| Property | Value |
|----------|-------|
| Padding | 20px |
| Font | Fira Code, 13px, weight 400 |
| Line-height | 1.7 |
| Min-height | 320px |

### Terminal Output (Animated Typing Effect)

```
$ stockflows status

  ╭─────────────────────────────────────╮
  │  📦 StockFlows v7.2.1              │
  │  Store: acme-outdoors.myshopify.com │
  │  Status: ● All systems operational  │
  ╰─────────────────────────────────────╯

$ stockflows inventory:low-stock

  SKU-4821  Running Water Bottle (32oz)   Qty: 3 ⚠️
  SKU-1203  Trail Mix Sampler Pack         Qty: 8 ⚠️
  SKU-7744  Organic Honey Jar (16oz)       Qty: 0 🔴

  3 items need attention

$ stockflows po:create --auto

  ✓ Creating purchase order #PO-2848
  ✓ Vendor: Pacific Supply Co.
  ✓ Items: 3 products, 45 units
  ✓ ETA: July 12, 2026
  ✓ Total: $1,247.50

  Purchase order created successfully! 🎉
```

### Terminal Text Colors

| Element | Color | Hex |
|---------|-------|-----|
| Command prompt (`$`) | Neon green | `#C7FB33` |
| Command text | White | `#FFFFFF` |
| Box border | Neon green (dim) | `rgba(199,251,51,0.4)` |
| Box content | White | `#FFFFFF` |
| Status dot (green) | Green | `#34D399` |
| Warning icon | Yellow | `#FBBF24` |
| Error icon | Red | `#F87171` |
| Success check | Neon green | `#C7FB33` |
| Output text | Secondary | `#A0A3AB` |
| Filename/path | Cyan | `#60A5FA` |

### Typing Animation

| Property | Value |
|----------|-------|
| Typing speed | 40ms per character |
| Command delay | 800ms between commands |
| Cursor | Blinking block — `█` — 13px, `#C7FB33` |
| Cursor blink | 1s infinite |
| Loop | After full output, 3s pause, then restart |

### Terminal Glow Effect

| Property | Value |
|----------|-------|
| Inner glow | `inset 0 0 60px rgba(199,251,51,0.03)` |
| Outer glow | `0 0 40px rgba(199,251,51,0.08)` |
| Glow pulse | Subtle 4s infinite animation, opacity 0.05 → 0.1 → 0.05 |

---

## 5. Trust Logos Section

| Property | Value |
|----------|-------|
| Position | Below hero, full width |
| Padding | 40px 0 |
| Border-top | 1px solid `#2A2D35` |
| Border-bottom | 1px solid `#2A2D35` |
| Background | `rgba(20,22,27,0.5)` |

### Logos Container

| Property | Value |
|----------|-------|
| Max-width | 1200px |
| Margin | 0 auto |
| Display | Flex row, justify: center, items: center, gap: 48px |
| Flex-wrap | wrap |

### Logo Specs

| Property | Value |
|----------|-------|
| Height | 28px |
| Opacity | 0.5 |
| Filter | grayscale(100%) brightness(200%) |
| Hover | opacity: 0.8, filter: none, transition: 200ms ease |
| Object-fit | contain |

### Logo Row Label

| Element | Value |
|---------|-------|
| Text | "Trusted by 2,400+ stores worldwide" — Inter, 12px, weight 500, `#6B6F78`, uppercase, letter-spacing: 0.1em |
| Position | Centered above logos |
| Margin-bottom | 24px |

### Sample Logos

- Alpine Outfitters
- Coastal Goods
- Summit Supply Co.
- Peak Performance
- Valley Trading Co.
- Ridge Running Co.

---

## 6. Features Preview Strip

Below the trust logos, a horizontal scrollable strip of feature highlights.

| Property | Value |
|----------|-------|
| Padding | 60px 0 |
| Background | `#0A0B0E` |

### Feature Cards (Horizontal scroll on mobile)

| Property | Value |
|----------|-------|
| Layout | Flex row, gap: 24px |
| Scroll | Horizontal on mobile, grid on desktop |
| Card width | 280px (fixed) |
| Card background | `#14161B` |
| Card border | 1px solid `#2A2D35` |
| Card border-radius | `8px` |
| Card padding | `20px` |
| Card hover | border: `#3A3D45`, transform: `translateY(-2px)` |

### Feature Card Content

| Element | Value |
|---------|-------|
| Icon | Material Symbols, 24px, `#C7FB33` |
| Icon container | 40x40px, bg: `rgba(199,251,51,0.1)`, radius: 8px |
| Title | Inter, 16px, weight 600, `#FFFFFF` |
| Description | Inter, 14px, `#A0A3AB`, max-height: 48px, overflow: hidden |
| Spacing | Icon → Title: 12px, Title → Description: 8px |

### Sample Features

1. **Real-time Tracking** — "Monitor stock levels across all locations with live updates"
2. **Smart Reordering** — "AI-powered reorder suggestions based on sales velocity"
3. **Multi-location** — "Manage inventory across warehouses, stores, and 3PLs"
4. **Purchase Orders** — "Create, send, and track POs with automated follow-ups"

---

## 7. Responsive Behavior

### Desktop (≥1280px)

- 2-column hero layout (copy left, terminal right)
- Full terminal with all output visible
- Trust logos in single row
- Feature cards in 4-column grid

### Tablet (768px – 1279px)

- 2-column hero, reduced gap
- Terminal scaled to 90%
- Trust logos wrap to 2 rows
- Feature cards in 2-column grid
- Headline: 40px
- Subheadline: 16px

### Mobile (< 768px)

- Single column (stacked)
- Terminal hidden, replaced with static screenshot
- Trust logos: horizontal scroll
- Feature cards: horizontal scroll
- Headline: 32px
- Subheadline: 16px
- CTA buttons: full width, stacked
- Padding: 24px
- Nav: hamburger menu

---

## 8. CSS Implementation Notes

### Terminal Typing Animation

```css
@keyframes typing {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes blink-caret {
  from, to { border-color: transparent; }
  50% { border-color: #C7FB33; }
}

.terminal-line {
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid #C7FB33;
  animation: typing 2s steps(40) forwards, blink-caret 0.75s step-end infinite;
}

.terminal-line:nth-child(1) { animation-delay: 0s; }
.terminal-line:nth-child(2) { animation-delay: 2.5s; }
.terminal-line:nth-child(3) { animation-delay: 5s; }
```

### Hero Gradient

```css
.hero {
  background: 
    radial-gradient(ellipse at 30% 20%, rgba(199,251,51,0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(199,251,51,0.05) 0%, transparent 50%),
    linear-gradient(180deg, #0A0B0E 0%, #0D1117 50%, #0A0B0E 100%);
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(42,45,53,0.3) 1px, transparent 1px),
    linear-gradient(90deg, rgba(42,45,53,0.3) 1px, transparent 1px);
  background-size: 60px 60px;
  opacity: 0.5;
}
```

### Terminal Glow

```css
.terminal-window {
  box-shadow: 
    0 20px 60px rgba(0,0,0,0.5),
    0 0 40px rgba(199,251,51,0.08);
}

.terminal-window::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(199,251,51,0.1), transparent 50%);
  z-index: -1;
  animation: glow-pulse 4s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.05; }
  50% { opacity: 0.1; }
}
```

### Smooth Scroll

```css
html {
  scroll-behavior: smooth;
}

.nav {
  transition: background-color 200ms ease, box-shadow 200ms ease;
}

.nav.scrolled {
  background-color: rgba(10,11,14,0.95);
  box-shadow: 0 1px 0 rgba(42,45,53,0.5);
}
```

---

## 9. Performance Considerations

- **Terminal animation**: Use `requestAnimationFrame` for smooth typing, pause when tab hidden
- **Background effects**: Use CSS `will-change: transform` for gradient animations
- **Logo loading**: Lazy load trust logos, use `loading="lazy"` attribute
- **Font loading**: Preconnect to Google Fonts, use `font-display: swap`
- **Image optimization**: WebP format for static terminal screenshot fallback
- **CLS prevention**: Set explicit dimensions on terminal window to prevent layout shift

---

## 10. SEO & Accessibility

- **Meta title**: "StockFlows — Inventory Management for Shopify"
- **Meta description**: "Real-time inventory tracking, automated reordering, and smart alerts for Shopify stores. Start free."
- **H1**: Single H1 on page ("Inventory management that moves at your speed")
- **Alt text**: Terminal screenshot — "StockFlows CLI showing inventory status and purchase order creation"
- **Focus states**: Visible focus rings on all interactive elements
- **Reduced motion**: Respect `prefers-reduced-motion` — disable typing animation
- **Color contrast**: All text meets WCAG AA (4.5:1) — verified against dark backgrounds
