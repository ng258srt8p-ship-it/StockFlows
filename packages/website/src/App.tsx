import React, { useEffect, useRef } from 'react';
import { Navigation, HeroSection, FeatureCards, ComparisonMatrix, Footer, FeatureShowcase } from '@stockflows/ui';
import { Pricing } from './components/Pricing';
import { SocialProof } from './components/SocialProof';

function useSectionReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('animate-reveal');
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function SectionReveal({ children }: { children: React.ReactNode }) {
  const ref = useSectionReveal();
  return (
    <div ref={ref} className="section-reveal">
      {children}
    </div>
  );
}

const showcaseFeatures = [
  {
    title: 'Dashboard',
    description: 'Real-time inventory visibility with KPI cards, low-stock alerts, and activity feed — all at a glance.',
    image: '/screenshots/dashboard.png',
    alt: 'StockFlows Dashboard showing inventory metrics and alerts',
  },
  {
    title: 'Inventory Management',
    description: 'Search, filter, and manage every SKU across locations with stock status indicators and velocity tracking.',
    image: '/screenshots/inventory.png',
    alt: 'StockFlows Inventory list with search and filters',
  },
  {
    title: 'Purchase Orders',
    description: 'End-to-end PO workflow from draft to receiving — track status, vendors, and order history.',
    image: '/screenshots/purchasing.png',
    alt: 'StockFlows Purchase Orders page',
  },
  {
    title: 'AI Forecasting',
    description: 'Demand predictions powered by ETS, linear regression, and moving average models with confidence scores.',
    image: '/screenshots/forecasting.png',
    alt: 'StockFlows AI Forecasting with demand predictions',
  },
  {
    title: 'Reports & Analytics',
    description: 'Generate inventory summaries, PO reports, forecast accuracy, and vendor performance — exportable as CSV or PDF.',
    image: '/screenshots/reports.png',
    alt: 'StockFlows Reports and analytics page',
  },
];

const comparisonData = [
  { capability: 'Dynamic Transfers', stocky: 'Sunsetting' as const, stockflows: 'Full' as const },
  { capability: 'Demand Velocity Rules', stocky: 'Limited' as const, stockflows: 'Full' as const },
  { capability: 'Instant Camera Scan', stocky: 'Sunsetting' as const, stockflows: 'Full' as const },
  { capability: 'Multi-Location Support', stocky: 'Limited' as const, stockflows: 'Full' as const },
  { capability: 'Audit Trail', stocky: 'Sunsetting' as const, stockflows: 'Full' as const },
];

const App: React.FC = () => {
  const features = [
    {
      icon: 'swap_horiz',
      title: 'Dynamic Transfers',
      description: 'Automatically redistribute inventory across locations based on demand velocity and stock levels.',
    },
    {
      icon: 'speed',
      title: 'Demand Velocity Rules',
      description: 'AI-powered forecasting that adapts to seasonal patterns, promotions, and market trends.',
    },
    {
      icon: 'camera_alt',
      title: 'Instant Camera Scan',
      description: 'Scan barcodes to instantly update inventory counts, create POs, or flag discrepancies.',
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navigation
        links={[
          { label: 'Platform', href: '#platform' },
          { label: 'Features', href: '#features' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'Compare', href: '#comparison' },
        ]}
        cta={{ label: 'Launch App', href: 'https://stockflows.fly.dev' }}
      />
      <HeroSection
        headline="Stocky is Sunsetting. We Are the Upgrade."
        subcopy="StockFlows provides audit-ready inventory management with dynamic transfers, AI forecasting, and instant barcode scanning — built for modern Shopify merchants."
        ctaPrimary={{ label: 'Launch Shopify App', href: 'https://stockflows.fly.dev' }}
        ctaSecondary={{ label: 'Try Live Demo', href: '/demo' }}
      />
      <div id="platform" />
      <SectionReveal>
        <FeatureCards features={features} />
      </SectionReveal>
      <div id="features" />
      <SectionReveal>
        <ComparisonMatrix rows={comparisonData} />
      </SectionReveal>
      <div id="comparison" />
      <SectionReveal>
        <FeatureShowcase features={showcaseFeatures} />
      </SectionReveal>
      <SectionReveal>
        <SocialProof />
      </SectionReveal>
      <SectionReveal>
        <Pricing />
      </SectionReveal>
      <Footer />
    </div>
  );
};

export default App;
