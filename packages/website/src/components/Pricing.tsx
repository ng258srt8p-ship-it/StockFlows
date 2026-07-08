import React from 'react';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: { label: string; href: string };
  highlighted?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    description: 'Perfect for getting started with basic inventory management.',
    features: [
      '1 location',
      '100 SKUs',
      'Basic alerts',
      'Community support',
    ],
    cta: { label: 'Get Started Free', href: 'https://stockflows.fly.dev' },
  },
  {
    name: 'Starter',
    price: '$29',
    period: '/mo',
    description: 'For growing merchants who need more power and flexibility.',
    features: [
      '5 locations',
      '1,000 SKUs',
      'Demand forecasting',
      'PO management',
      'Email support',
    ],
    cta: { label: 'Start Starter Plan', href: 'https://stockflows.fly.dev' },
    highlighted: true,
  },
  {
    name: 'Pro',
    price: '$79',
    period: '/mo',
    description: 'For established businesses that need unlimited scale and AI insights.',
    features: [
      'Unlimited locations',
      'Unlimited SKUs',
      'AI-powered insights',
      'Priority support',
      'Advanced analytics',
      'Custom integrations',
    ],
    cta: { label: 'Start Pro Plan', href: 'https://stockflows.fly.dev' },
  },
];

export const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-24 bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            Start free and scale as your business grows. No hidden fees, no surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl p-8 ${
                tier.highlighted
                  ? 'bg-[var(--bg-primary)] border-2 border-[var(--accent)] relative'
                  : 'bg-[var(--bg-primary)] border border-[var(--border)]'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--accent)] text-[var(--bg-primary)] px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{tier.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-5xl font-bold text-[var(--accent)]">{tier.price}</span>
                <span className="text-[var(--text-secondary)]">{tier.period}</span>
              </div>
              <p className="text-[var(--text-secondary)] mb-8">{tier.description}</p>
              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="text-[var(--accent)]">✓</span>
                    <span className="text-[var(--text-primary)]">{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href={tier.cta.href}
                className={`block text-center py-4 rounded-lg font-semibold transition-colors ${
                  tier.highlighted
                    ? 'bg-[var(--accent)] text-[var(--bg-primary)] hover:bg-[var(--accent-hover)]'
                    : 'bg-transparent text-[var(--accent)] border-2 border-[var(--accent)] hover:bg-[var(--bg-secondary)]'
                }`}
              >
                {tier.cta.label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
