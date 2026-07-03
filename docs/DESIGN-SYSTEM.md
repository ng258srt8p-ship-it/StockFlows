# StockFlows UI/UX Design System

Based on the stockflows.app website design.

## Color Palette

### Primary Colors
| Token | Value | Usage |
|-------|-------|-------|
| Background | `#fafafa` | Page background, sidebar |
| Surface/White | `#ffffff` | Cards, inputs, dropdowns |
| Text Primary | `#111111` | Headings, body text, stat numbers |
| Text Secondary | `#666666` | Inactive nav links, secondary labels |
| Text Tertiary | `#999999` | Table headers, stat labels |
| Border | `#e0e0e0` | Sidebar border, table dividers, input borders |

### Status Colors
| Token | Value | Usage |
|-------|-------|-------|
| Critical/Danger | `#dc2626` | "Out of Stock" badge, low stat numbers |
| Warning/Low Stock | `#d97706` | "Low Stock" badge, amber indicators |
| Success/In Stock | `#16a34a` | "In Stock" badge, positive indicators |

## Typography

### Font Stack
- **Primary**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Headings**: `'Instrument Serif', Georgia, 'Times New Roman', 'Courier New', serif`

### Usage
- **Headings (h1-h6)**: Instrument Serif, italic, weight 400
- **Body text**: Inter, weight 400-500
- **Labels/Navigation**: Inter, uppercase, letter-spacing 0.3px
- **Stat numbers**: Instrument Serif, italic, large size

## Layout

### Sidebar
- Width: 220px
- Background: `#fafafa`
- Border-right: 1px solid `#e0e0e0`
- Padding: 24px 0

### Content Area
- Flex: 1
- Padding: 40px 48px
- Background: `#fafafa`
- Overflow-y: auto

## Components

### Cards
- Background: `#ffffff`
- Border: 1px solid `#e0e0e0`
- Padding: 24px
- Border-radius: 0px (brutalist style)
- Hover: border-color `#999999`

### Buttons
- **Brand**: background `#111111`, color `#fff`
- **Ghost**: transparent, border `#e0e0e0`
- **Danger**: transparent, border `#dc2626`
- **Small**: padding 6px 14px, font-size 0.7rem

### Badges
- **Critical**: color `#dc2626`, border `#dc2626`
- **Warning**: color `#d97706`, border `#d97706`
- **Success**: color `#16a34a`, border `#16a34a`
- **Info**: color `#111111`, border `#111111`

### Navigation
- Links: Inter, uppercase, letter-spacing 0.3px
- Active: color `#111111`, font-weight 700
- Active indicator: 3px left border, color `#111111`

## External Resources
- Fonts: Google Fonts (Inter + Instrument Serif)
- Icons: Material Symbols Outlined
- Stylesheet: stockflows.app/tour.css
