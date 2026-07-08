import React from "react";
import type { HeroSectionProps } from "../../types";

export const HeroSection: React.FC<HeroSectionProps> = ({
  headline,
  subcopy,
  ctaPrimary,
  ctaSecondary,
  terminalContent = "",
  className = "",
}) => {
  return (
    <section className={`relative min-h-[80vh] md:min-h-screen flex items-center justify-center overflow-hidden ${className}`}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-[var(--text-primary)] mb-6 leading-tight">
          {headline}
        </h1>
        <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-8 max-w-3xl mx-auto">
          {subcopy}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          {ctaPrimary && (
            <a
              href={ctaPrimary.href}
              className="bg-[var(--accent)] text-[var(--bg-primary)] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[var(--accent-hover)] transition-colors shadow-accent"
            >
              {ctaPrimary.label}
            </a>
          )}
          {ctaSecondary && (
            <a
              href={ctaSecondary.href}
              className="bg-transparent text-[var(--accent)] border-2 border-[var(--accent)] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[var(--bg-secondary)] transition-colors"
            >
              {ctaSecondary.label}
            </a>
          )}
        </div>

        {/* Terminal mockup */}
        {terminalContent && (
          <div className="max-w-4xl mx-auto bg-[var(--bg-primary)] border-2 border-[var(--border)] rounded-lg p-6 shadow-lg text-left">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-[var(--danger)]" />
              <div className="w-3 h-3 rounded-full bg-[var(--warning)]" />
              <div className="w-3 h-3 rounded-full bg-[var(--success)]" />
            </div>
            <pre className="text-[var(--accent)] text-sm font-mono overflow-x-auto">
              {terminalContent}
            </pre>
          </div>
        )}
      </div>
    </section>
  );
};
