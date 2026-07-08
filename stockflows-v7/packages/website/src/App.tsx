import React, { useEffect, useRef } from 'react';
import { Navigation, HeroSection, FeatureCards, ComparisonMatrix, CustomerLogos, Footer } from '@stockflows/ui';
import { SocialProof } from './components/SocialProof';
import { Pricing } from './components/Pricing';

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

const comparisonData = [
  { capability: 'Dynamic Transfers', stocky: 'Sunsetting' as const, stockflows: 'Full' as const },
  { capability: 'Demand Velocity Rules', stocky: 'Limited' as const, stockflows: 'Full' as const },
  { capability: 'Instant Camera Scan', stocky: 'Sunsetting' as const, stockflows: 'Full' as const },
  { capability: 'Multi-Location Support', stocky: 'Limited' as const, stockflows: 'Full' as const },
  { capability: 'Audit Trail', stocky: 'Sunsetting' as const, stockflows: 'Full' as const },
];

const customerLogos = [
  { name: 'Shopify', src: '/logos/shopify.svg' },
  { name: 'Nike', src: '/logos/nike.svg' },
  { name: 'Adidas', src: '/logos/adidas.svg' },
  { name: 'Unilever', src: '/logos/unilever.svg' },
  { name: 'P&G', src: '/logos/pg.svg' },
  { name: 'Nestle', src: '/logos/nestle.svg' },
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navigation />
      <HeroSection
        headline="Stocky is Sunsetting. We Are the Upgrade."
        subcopy="StockFlows provides audit-ready inventory management with dynamic transfers, AI forecasting, and instant barcode scanning — built for modern Shopify merchants."
        ctaPrimary={{ label: 'Launch Shopify App', href: 'https://stockflows.fly.dev' }}
        ctaSecondary={{ label: 'Try Live Demo', href: '/demo' }}
      />
      <SectionReveal>
        <FeatureCards features={features} />
      </SectionReveal>
      <SectionReveal>
        <ComparisonMatrix rows={comparisonData} />
      </SectionReveal>
      <SectionReveal>
        <SocialProof />
      </SectionReveal>
      <SectionReveal>
        <CustomerLogos logos={customerLogos} />
      </SectionReveal>
      <SectionReveal>
        <Pricing />
      </SectionReveal>
      <Footer />
    </div>
  );
};

export default App;
