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
  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0B0E] ${className}`}>
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#20232A_1px,transparent_1px),linear-gradient(to_bottom,#20232A_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-[#FFFFFF] mb-6 leading-tight">
          {headline}
        </h1>
        <p className="text-xl text-[#A0A3AB] mb-8 max-w-3xl mx-auto">
          {subcopy}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          {ctaPrimary && (
            <a
              href={ctaPrimary.href}
              className="bg-[#C7FB33] text-[#0A0B0E] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#D9FF4A] transition-all shadow-[2px_2px_0px_#C7FB33] inline-block"
            >
              {ctaPrimary.label}
            </a>
          )}
          {ctaSecondary && (
            <a
              href={ctaSecondary.href}
              className="bg-transparent text-[#FFFFFF] px-8 py-4 rounded-lg text-lg font-semibold border-2 border-[#20232A] hover:border-[#C7FB33] transition-all inline-block"
            >
              {ctaSecondary.label}
            </a>
          )}
        </div>
        
        {/* Terminal preview */}
        <div className="mt-16 max-w-4xl mx-auto bg-[#14161B] border-2 border-[#20232A] rounded-lg p-6 shadow-[2px_2px_0px_#20232A]">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
            <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
            <span className="w-3 h-3 rounded-full bg-[#10B981]" />
          </div>
          <pre className="text-left text-sm text-[#A0A3AB] font-mono">
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
