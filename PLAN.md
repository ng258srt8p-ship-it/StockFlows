# Plan: AI Transparency & Opt-Out Toggle

## Problem
The tour page and app have AI features (insights on dashboard, forecast explanations) but:
1. No documentation explains what AI technology is used or what data is sent
2. There's no way for users to disable AI if they don't want their data going through an external API
3. The privacy policy doesn't mention AI

## Solution

### 1. Add AI toggle to Settings page

Add a new "AI Features" card in the settings grid (between Notifications and Store Information):

```
┌─────────────────────────────────────┐
│ AI Features                          │
│                                      │
│ ☑ Enable AI Insights                │
│ Uses OpenCode API with Big Pickle    │
│ model to analyze inventory data and  │
│ generate insights. Your inventory    │
│ data, forecasts, and alerts are sent │
│ to an external AI service for        │
│ analysis. Statistical forecasting    │
│ (the core demand engine) still works │
│ when AI is disabled.                 │
│                                      │
│ ☐ Enable Forecast Explanations       │
│ Shows AI-generated natural language  │
│ explanations of forecast data when   │
│ you click a product.                │
└─────────────────────────────────────┘
```

State stored in `SETTINGS.aiInsights = true` and `SETTINGS.forecastExplanations = true`.

### 2. Dashboard: Conditionally render AI insights

In `generateAIInsights()` and the dashboard HTML:
- If `SETTINGS.aiInsights === false`, skip the AI Insights section entirely
- If true, show the insights as currently implemented

### 3. Forecasting: Conditionally render AI insight card

In `generateForecastInsight()` and the forecast detail HTML:
- If `SETTINGS.forecastExplanations === false`, hide the AI Insight card below the sparkline
- The sparkline chart and statistical numbers still show (they're not AI)

### 4. Privacy policy update

Add a new section "AI and Data Processing":
- **What we use:** OpenCode API with Big Pickle model
- **What data is sent:** Aggregated inventory data (product counts, stock levels, forecast summaries, alert lists). No customer PII, no individual order data.
- **Why:** To generate actionable inventory insights and explain forecast trends in plain language
- **Opt-out:** Users can disable AI in Settings > AI Features. Statistical forecasting continues to work without AI.
- **Data retention:** AI requests are not stored by StockFlows. OpenCode's data retention policy applies.

### 5. App Store listing update

Add to the description:
> "AI insights are optional. StockFlows can analyze your inventory data to provide natural language insights and forecast explanations powered by the OpenCode API. You can disable AI features in Settings at any time. The core statistical forecasting engine works without AI."

### 6. Tour step update

Add a step on the Settings page showing the AI toggle with explanation.

## Files Changed

| File | Change |
|------|--------|
| `public/tour.html` | Settings: add AI toggle card. Dashboard: wrap AI insights in `SETTINGS.aiInsights` check. Forecasting: wrap insight card in `SETTINGS.forecastExplanations` check. Tour: add settings tour step. |
| `public/privacy.html` | Add "AI and Data Processing" section |
| `APP-STORE-LISTING.md` | Add AI opt-out bullet point |

## Verification
- Toggle both AI settings off → insights and forecast explanations hidden
- Toggle both on → sections reappear
- Privacy policy documents AI usage
- All 68 E2E tests pass
