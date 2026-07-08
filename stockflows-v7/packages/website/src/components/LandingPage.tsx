import React from "react";
import {
  Navigation,
  Footer,
  HeroSection,
  FeatureCards,
  ComparisonMatrix,
  CustomerLogos,
  Badge,
} from "@stockflows/ui";

export const LandingPage: React.FC = () => {
  const navigationLinks = [
    { label: "Platform", href: "#platform" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Resources", href: "#resources" },
  ];

  const dropdowns = [
    {
      label: "Solutions",
      items: [
        { label: "Inventory Management", href: "/solutions/inventory" },
        { label: "Demand Forecasting", href: "/solutions/forecasting" },
        { label: "Purchase Orders", href: "/solutions/purchasing" },
      ],
    },
  ];

  const cta = {
    label: "Launch App",
    href: "https://stockflows.fly.dev",
  };

  const features = [
    {
      icon: "transfer_within_a_station",
      title: "Dynamic Transfers",
      description: "Multi-location stock transfers with real-time tracking and audit trails.",
      preview: `// Dynamic transfer with audit ledger
const result = await createTransfer({
  from: 'WH-001',
  to: 'RET-042',
  items: [{ sku: 'SKU-123', qty: 50 }],
  auditId: 'AUD-2026-001'
});`,
    },
    {
      icon: "speed",
      title: "Demand Velocity Rules",
      description: "AI-powered forecasting with configurable velocity thresholds and safety stock levels.",
      preview: `// Velocity-based reorder
const forecast = await runForecast({
  sku: 'SKU-123',
  model: 'ETS',
  horizon: 30,
  confidence: 0.95
});`,
    },
    {
      icon: "camera_alt",
      title: "Instant Camera Scan",
      description: "Mobile-first barcode scanning with real-time inventory updates and photo capture.",
      preview: `// Camera scan integration
const scan = await cameraScan({
  format: 'EAN-13',
  autoDetect: true,
  uploadPhoto: true
});`,
    },
  ];

  const comparisonRows = [
    { capability: "Stock Transfers", stocky: "Sunsetting" as const, stockflows: "Upgrade" as const },
    { capability: "Audit Ledger", stocky: "Sunsetting" as const, stockflows: "Full" as const },
    { capability: "Forecasting Model", stocky: "Limited" as const, stockflows: "Full" as const },
    { capability: "Supplier CSV Importer", stocky: "Limited" as const, stockflows: "Full" as const },
    { capability: "Multi-Location Support", stocky: "Limited" as const, stockflows: "Full" as const },
    { capability: "API Access", stocky: "Limited" as const, stockflows: "Full" as const },
  ];

  const customerLogos = [
    { name: "Morgan Stanley", src: "" },
    { name: "Chipotle", src: "" },
    { name: "Siemens", src: "" },
    { name: "Fox", src: "" },
    { name: "BMW", src: "" },
    { name: "Slack", src: "" },
  ];

  const footerLinks = [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Support", href: "/support" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Navigation */}
      <Navigation
        links={navigationLinks}
        dropdowns={dropdowns}
        cta={cta}
      />

      {/* Hero Section */}
      <HeroSection
        headline="Stocky is Sunsetting. We Are the Upgrade."
        subcopy="StockFlows is the modern inventory management platform built for Shopify merchants. Migrate from Stocky with zero data loss and full audit compliance."
        ctaPrimary={{ label: "Launch Shopify App", href: "https://stockflows.fly.dev" }}
        ctaSecondary={{ label: "Try Live Demo", href: "/demo" }}
        terminalContent={`$ stockflows migrate --from=stocky
✓ Migrating inventory items (1,247)
✓ Migrating purchase orders (892)
✓ Migrating vendor records (156)
✓ Running forecast models
✓ Audit ledger complete

Migration completed in 4.2s` }
      />

      {/* Problem Statement Section */}
      <section id="platform" className="py-24 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge type="warning" className="mb-4">
              Deprecation Notice
            </Badge>
            <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-6">
              The Deprecation Challenge
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto">
              Stocky's primary capabilities are being disabled. Multi-location transfers,
              supplier rules, and forecasting models will no longer be available.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-[var(--bg-primary)] border-2 border-[var(--danger)]/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-[var(--danger)] mb-3">Stocky (Sunsetting)</h3>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--danger)]">✕</span>
                  <span>Multi-location transfers disabled</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--danger)]">✕</span>
                  <span>No audit ledger</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--danger)]">✕</span>
                  <span>Forecasting models removed</span>
                </li>
              </ul>
            </div>

            <div className="bg-[var(--bg-primary)] border-2 border-[var(--success)]/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-[var(--success)] mb-3">StockFlows (Upgrade)</h3>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--success)]">✓</span>
                  <span>Full transfer management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--success)]">✓</span>
                  <span>Complete audit ledger</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--success)]">✓</span>
                  <span>Advanced forecasting models</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <FeatureCards features={features} className="py-24" />

      {/* Comparison Matrix */}
      <ComparisonMatrix rows={comparisonRows} />

      {/* Customer Logos */}
      <CustomerLogos logos={customerLogos} />

      {/* CTA Section */}
      <section className="py-24 bg-[var(--bg-secondary)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-6">
            Ready to Migrate from Stocky?
          </h2>
          <p className="text-xl text-[var(--text-secondary)] mb-8">
            Join thousands of merchants who have already upgraded to StockFlows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://stockflows.fly.dev"
              className="bg-[var(--accent)] text-[var(--bg-primary)] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[var(--accent-hover)] transition-colors shadow-accent"
            >
              Launch Shopify App
            </a>
            <a
              href="/demo"
              className="bg-transparent text-[var(--accent)] border-2 border-[var(--accent)] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[var(--bg-secondary)] transition-colors"
            >
              Try Live Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer links={footerLinks} />
    </div>
  );
};
