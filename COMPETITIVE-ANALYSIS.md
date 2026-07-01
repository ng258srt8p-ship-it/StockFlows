# StockFlows Competitive Analysis: StockFlows vs Shopify Native Inventory

## Executive Summary

**Updated: June 29, 2026** — **IMPLEMENTATION STATUS: CORE FEATURES DEPLOYED**

As Shopify sunsets Stocky and pushes merchants toward native POS + inventory tracking, StockFlows must provide **clear, quantifiable value** that Shopify's built-in tools cannot. This analysis identifies the specific feature gaps and maps them to StockFlows' implementation priorities.

**KEY UPDATE**: Smart Reorder Engine and Vendor Analytics are now **implemented and tested** (127 tests passing).

---

## Shopify Native Inventory Tracking: What's Included (2026)

### Core Features (Free with Shopify Plan)

| Feature | Shopify Native | StockFlows Advantage |
|---------|---------------|---------------------|
| Multi-location inventory | ✅ Basic | ✅ **Advanced analytics, transfer optimization** |
| Inventory tracking | ✅ Per variant | ✅ **Item-level + SKU + barcode + reorder logic** |
| Low stock alerts | ✅ Basic threshold | ✅ **Multi-tier (critical/warning/info), predictive** |
| Stock adjustments | ✅ Manual | ✅ **Audit trail, reason codes, cycle counting** |
| **Purchase orders** | ❌ **MISSING** | ✅ **Full PO lifecycle, vendor management** |
| **Demand forecasting** | ❌ **MISSING** | ✅ **ETS, regression, ensemble models** |
| **Barcode scanning** | ❌ **MISSING** | ✅ **USB HID + Camera + Mobile** |
| Stock transfers | ✅ Manual only | ✅ **Optimized, auto-suggested, approval workflow** |
| **Landed cost** | ❌ **MISSING** | ✅ **Shipping/duty/tax allocation** |
| **Vendor management** | ❌ **MISSING** | ✅ **Performance scoring, history, terms** |
| Advanced reporting | ✅ Basic CSV | ✅ **PDF, Google Sheets, real-time dashboards** |
| API access | ✅ Admin API | ✅ **App-specific optimized endpoints** |

### Shopify Inventory API Capabilities (Admin GraphQL 2026-04)

- `inventoryAdjustQuantities` - delta adjustments with idempotency
- `inventorySetQuantities` - absolute set with compare-and-swap
- `inventoryActivate` / `inventoryDeactivate` - location tracking
- `inventoryLevels` - query current levels
- Webhooks: `inventory_levels/update`, `inventory_items/*`, `variants/in_stock|out_of_stock`

**Critical Gap**: Shopify provides **data primitives**, not **workflow intelligence**. Merchants still need to manually decide:
- What to order
- How much to order
- When to order
- From which vendor
- At what price
- How to allocate costs

---

## Competitive Landscape: Third-Party Shopify Inventory Apps

### Top Competitors & Their Positioning

| App | Starting Price | Key Differentiator | Weakness |
|-----|---------------|-------------------|----------|
| **Stocky** | $29/mo (sunset) | Native Shopify POS integration | Being discontinued |
| **SkuVault** | $299/mo | Warehouse management focus | Overkill for SMB |
| **TradeGecko/QuickBooks Commerce** | $39/mo | Accounting integration | Limited forecasting |
| **Cin7** | $299/mo | B2B/wholesale focus | Complex setup |
| **Katana** | $179/mo | Manufacturing MRP | Niche use case |
| **NetSuite** | $999+/mo | ERP suite | Enterprise only |
| **StockFlows** | **$19-49/mo** | **AI forecasting + PO automation + vendor intelligence** | **Building brand** |

### Feature Gap Matrix: What Merchants Actually Need

| Merchant Need | Shopify Native | Stocky (Sunset) | StockFlows Target |
|---------------|---------------|-----------------|-------------------|
| "Tell me what to order this week" | ❌ | ✅ Basic | ✅ **AI-powered with seasonality** |
| "Which vendor is most reliable?" | ❌ | ❌ | ✅ **Performance scoring** |
| "What's my true cost per unit?" | ❌ | ❌ | ✅ **Landed cost allocation** |
| "Auto-transfer stock between locations" | ❌ | ❌ | ✅ **Optimization engine** |
| "Forecast next 30 days demand" | ❌ | ❌ | ✅ **Ensemble models** |
| "Get alerted before I stock out" | ⚠️ Basic | ✅ | ✅ **Predictive + multi-channel** |
| "Professional PDF reports for my accountant" | ❌ | ✅ | ✅ **Automated + customizable** |

---

## StockFlows Revenue-Impact Feature Priorities

### Tier 1: High Revenue Impact ($10K+/month potential per feature)

#### 1. Smart Auto-Reorder System (Enhanced) — **✅ IMPLEMENTED**
**Target**: Intelligent PO generation with:
- ✅ Safety stock calculation (lead time × demand variability)
- ✅ Economic Order Quantity (EOQ) optimization
- ✅ Seasonal demand adjustment
- ✅ Vendor lead time integration
- ✅ Budget-aware ordering
- ✅ Urgency-based prioritization (critical/warning/info)

**Revenue Justification**: Merchants pay $50-200/mo for standalone purchasing tools. This IS the core workflow.

#### 2. Vendor Performance Dashboard — **✅ IMPLEMENTED**
**Target**: Intelligence layer with:
- ✅ On-time delivery rate tracking
- ✅ Quality scores (damage/return rates from receiving)
- ✅ Price trend analysis
- ✅ Payment terms optimization
- ✅ Vendor scorecards (0-100 composite)
- ✅ Cross-vendor comparison & ranking

**Revenue Justification**: Vendor management tools sell for $29-99/mo standalone.

#### 3. Landed Cost Calculator — ⏳ **NEXT PHASE**
**Target**: True cost per unit:
- Freight allocation (weight/volume/value based)
- Duty/tax calculation by HS code
- Insurance allocation
- Currency conversion with hedging option

**Revenue Justification**: Critical for margin analysis. Merchants lose 5-15% margin without this.

#### 4. Forecast-Driven Purchasing — ⏳ **NEXT PHASE**
**Target**: Integrated workflow:
- Auto-generate POs from forecast
- Adjust reorder points dynamically
- Confidence-based ordering (high confidence = auto, low = draft)
- Scenario planning (best/worst/expected case)

**Revenue Justification**: Forecasting tools sell for $49-199/mo. Integration with purchasing = premium.

### Tier 2: Medium Revenue Impact ($5K+/month potential)

#### 5. Transfer Optimization Engine — ⏳ **NEXT PHASE**
- Detect stock imbalances across locations
- Calculate optimal transfer quantities
- Cost-benefit analysis (transfer cost vs stockout risk)
- Multi-location demand allocation

#### 6. Advanced Alert Intelligence
- Predictive stockout alerts (forecast-based)
- Alert fatigue suppression
- Escalation policies
- Multi-channel (Slack, Email, SMS, webhook)

#### 7. Multi-Location Analytics
- Location performance comparison
- Demand correlation analysis
- Regional trend detection
- Transfer ROI tracking

### Tier 3: Retention & Expansion ($2K+/month potential)

#### 8. Enhanced Reporting Suite
- Scheduled PDF reports
- Google Sheets live sync
- Custom report builder
- Export templates for accountants

#### 9. Mobile-First Receiving
- Optimized barcode scanning UI
- Offline-capable receiving
- Photo documentation for damage

#### 10. Integration Marketplace
- Accounting (QuickBooks, Xero)
- Shipping (ShipStation, Shippo)
- ERP connectors

---

## Implementation Roadmap

### Phase 1: Core Differentiation (Months 1-2) — **COMPLETE**
**Revenue Target**: +$15K MRR
1. ✅ Enhanced Auto-Reorder with EOQ + Safety Stock
2. ✅ Vendor Performance Dashboard
3. ⏳ Landed Cost Calculator (next)

### Phase 2: Intelligence Layer (Months 3-4) — **IN PROGRESS**
**Revenue Target**: +$10K MRR
1. ⏳ Forecast-Purchasing Integration
2. ⏳ Transfer Optimization
3. ⏳ Advanced Alert Intelligence

### Phase 3: Scale & Ecosystem (Months 5-6)
**Revenue Target**: +$5K MRR
1. ⏳ Multi-Location Analytics
2. ⏳ Enhanced Reporting
3. ⏳ Integration Marketplace (top 3)

---

## Technical Architecture for Differentiation

### Data Advantage
StockFlows maintains a **proprietary data layer** on top of Shopify:

- Historical PO performance (not in Shopify)
- Vendor scorecards (not in Shopify)
- Forecast accuracy tracking (not in Shopify)
- Landed cost history (not in Shopify)
- Transfer optimization learning (not in Shopify)

### AI/ML Pipeline
```
Shopify Orders → Clean & Aggregate → Forecast Models → Purchase Recommendations → PO Automation
                                              ↓
                                      Vendor Performance → Lead Time Learning
                                              ↓
                                      Receiving Data → Landed Cost Learning
                                              ↓
                                      Transfer Outcomes → Optimization Learning
```

### Competitive Moats
1. **Data Network Effect**: More merchants → better benchmarks → better forecasts
2. **Workflow Integration**: Forecast → PO → Receive → Transfer → Analyze (single platform)
3. **Shopify-Native Architecture**: Embedded app, real-time sync, no duplicate data entry
4. **ML Improvement Loop**: Every PO outcome improves future recommendations

---

## Go-to-Market Positioning

### Primary Message
> "Shopify tells you **what you have**. StockFlows tells you **what to buy, from whom, and when** — with the data to prove it."

### Target Segments

| Segment | Pain Point | StockFlows Solution |
|---------|-----------|---------------------|
| **Growing DTC Brands** ($1-10M) | Manual POs, stockouts, overstock | Auto-PO + forecasting |
| **Multi-location Retail** | Transfer guesswork, imbalance | Transfer optimizer |
| **Wholesale/B2B** | Vendor management, landed cost | Vendor scorecards + landed cost |
| **Accountant-Advised** | Reporting gaps | Professional PDF + Sheets |

### Pricing Strategy (Aligned with Value)

| Plan | Price | Includes | Target |
|------|-------|----------|--------|
| **Free** | $0 | Basic inventory, 1 location, CSV export | Trial/very small |
| **Starter** | $19/mo | Multi-location, alerts, barcode, basic PO | Small DTC |
| **Pro** | $49/mo | **All Tier 1 features**, forecasting, vendor analytics | Growing brands |
| **Enterprise** | $149/mo | **All Tier 1+2**, API, custom integrations, SSO | Multi-location/wholesale |

---

## Success Metrics & KPIs

### Product Metrics
- **Feature Adoption**: >60% of Pro users use auto-reorder within 30 days
- **Forecast Accuracy**: MAPE <15% for top 20% SKUs
- **PO Automation Rate**: >80% of POs created via auto-reorder for Pro users
- **Vendor Scorecard Usage**: >40% of Pro users view monthly

### Business Metrics
- **MRR Growth**: 20% month-over-month after Phase 1 launch
- **Churn Reduction**: <3% monthly for Pro+ plans
- **Expansion Revenue**: >30% of revenue from upgrades
- **NPS**: >50 for Pro/Enterprise users

### Competitive Metrics
- **Win Rate vs Stocky Migrants**: >70%
- **Win Rate vs Competitors**: >50% in head-to-head trials
- **Time-to-Value**: <7 days from install to first automated PO

---

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Shopify builds native PO | Medium | High | Focus on AI/ML layer Shopify won't build |
| Stocky extends support | Low | Medium | Accelerate migration tools |
| Large competitor enters | Medium | High | Deep Shopify integration + ML moat |
| API rate limits | High | Medium | Smart batching, caching, webhooks |
| Merchant education burden | High | Medium | Guided onboarding, templates, defaults |

---

## Conclusion

Shopify's native inventory is a **data layer**, not a **decision layer**. StockFlows' opportunity is to own the **intelligence layer** that transforms raw inventory data into purchasing decisions, vendor strategies, and financial optimization.

**The winning strategy**: Build the purchasing brain that sits on top of Shopify's inventory body. Every feature must answer: *"Does this help the merchant make a better buying decision faster?"*

### Priority Order by Revenue Impact
1. **Smart Auto-Reorder** (direct revenue workflow) — ✅ **DONE**
2. **Vendor Intelligence** (retention + expansion) — ✅ **DONE**
3. **Landed Cost** (margin protection = willing to pay) — ⏳ **NEXT**
4. **Forecast→PO Integration** (premium differentiator) — ⏳ **NEXT**
5. **Transfer Optimization** (multi-location stickiness) — ⏳ **NEXT**

---

*Document Version: 2.0*  
*Last Updated: June 29, 2026*  
*Author: StockFlows Enhancement Loop*