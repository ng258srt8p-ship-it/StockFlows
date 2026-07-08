import React from 'react';

interface HeroSectionProps {
  headline: string;
  subcopy: string;
  ctaPrimary?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  terminalContent?: string;
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  headline,
  subcopy,
  ctaPrimary,
  ctaSecondary,
  terminalContent,
  className = '',
}) => {
  const words = headline.split(' ');

  return (
    <section className={`relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[var(--bg-primary)] ${className}`}>
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-light)] via-[var(--bg-primary)] to-[var(--accent-pink-muted)] animate-gradient" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Animated headline */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-[var(--text-primary)] mb-6 leading-tight">
          {words.map((word, i) => (
            <span
              key={i}
              className="inline-block animate-fade-in-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {word}{' '}
            </span>
          ))}
        </h1>

        {/* Subtitle fades in after headline */}
        <p
          className="text-lg sm:text-xl text-[var(--text-secondary)] mb-8 max-w-3xl mx-auto animate-fade-in-up"
          style={{ animationDelay: `${words.length * 0.08 + 0.2}s` }}
        >
          {subcopy}
        </p>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto animate-fade-in-up"
          style={{ animationDelay: `${words.length * 0.08 + 0.4}s` }}
        >
          {ctaPrimary && (
            <a
              href={ctaPrimary.href}
              className="bg-[var(--accent)] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[var(--accent-hover)] transition-all shadow-md hover:shadow-lg hover:shadow-[var(--accent)]/20 inline-block"
            >
              {ctaPrimary.label}
            </a>
          )}
          {ctaSecondary && (
            <a
              href={ctaSecondary.href}
              className="bg-white text-[var(--accent)] px-8 py-4 rounded-xl text-lg font-semibold border-2 border-[var(--accent)]/20 hover:border-[var(--accent)] hover:shadow-md transition-all inline-block"
            >
              {ctaSecondary.label}
            </a>
          )}
        </div>

        {/* Terminal preview */}
        <div className="mt-16 max-w-4xl mx-auto bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-6 shadow-lg animate-fade-in-up" style={{ animationDelay: `${words.length * 0.08 + 0.6}s` }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-[var(--danger)]" />
            <span className="w-3 h-3 rounded-full bg-[var(--warning)]" />
            <span className="w-3 h-3 rounded-full bg-[var(--success)]" />
          </div>
          <pre className="text-left text-sm text-[var(--text-secondary)] font-mono">
            <code>{terminalContent || `$ stockflows sync --shop=acme.myshopify.com
✓ Synced 247 products
✓ Updated 89 inventory levels
✓ Generated 12 forecasts`}</code>
          </pre>
        </div>
      </div>
    </section>
  );
};
