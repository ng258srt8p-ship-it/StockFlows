import React, { useState } from 'react';
import type { NavigationProps } from '../../types';

interface DropdownItem {
  label: string;
  href: string;
  description?: string;
  icon?: string;
}

interface DropdownSection {
  label: string;
  items: DropdownItem[];
}

export const Navigation: React.FC<NavigationProps> = ({
  links = [
    { label: 'Platform', href: '#platform' },
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Compare', href: '#comparison' },
  ],
  dropdowns = [],
  cta = { label: 'Get a Demo', href: '/demo' },
  className = '',
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const defaultDropdowns: DropdownSection[] = [
    {
      label: 'Platform',
      items: [
        { label: 'Dashboard', href: '#platform', description: 'Real-time inventory overview', icon: 'dashboard' },
        { label: 'Inventory', href: '#platform', description: 'SKU management and tracking', icon: 'inventory_2' },
        { label: 'Purchasing', href: '#platform', description: 'Purchase order workflow', icon: 'shopping_cart' },
        { label: 'Forecasting', href: '#platform', description: 'AI-powered demand predictions', icon: 'trending_up' },
        { label: 'Reports', href: '#platform', description: 'Analytics and exports', icon: 'bar_chart' },
      ],
    },
    {
      label: 'Features',
      items: [
        { label: 'Dynamic Transfers', href: '#features', description: 'Move stock between locations' },
        { label: 'AI Forecasting', href: '#features', description: 'Predict demand with ML models' },
        { label: 'Barcode Scanning', href: '#features', description: 'Instant camera-based scanning' },
      ],
    },
  ];

  const allDropdowns = dropdowns.length > 0 ? dropdowns : defaultDropdowns;

  return (
    <nav className={`sticky top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-[var(--border)] z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-10">
            <a href="/" className="text-[var(--accent)] text-xl font-bold tracking-tight">
              StockFlows
            </a>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {links.map((link, index) => {
                const dropdown = allDropdowns.find((d) => d.label === link.label);
                if (dropdown) {
                  return (
                    <div key={index} className="relative group">
                      <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors rounded-lg">
                        {link.label}
                        <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div className="absolute hidden group-hover:block top-full left-0 mt-1 w-72 bg-white rounded-xl border border-[var(--border)] shadow-lg py-2 z-50">
                        {dropdown.items.map((item, idx) => (
                          <a key={idx} href={item.href} className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors">
                            {item.icon && (
                              <span className="material-symbols-outlined text-[var(--accent)] text-lg mt-0.5">{item.icon}</span>
                            )}
                            <div>
                              <div className="text-sm font-medium text-[var(--text-primary)]">{item.label}</div>
                              {item.description && (
                                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{item.description}</div>
                              )}
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <a key={index} href={link.href} className="px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors rounded-lg">
                    {link.label}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <a href="https://stockflows.fly.dev" className="hidden sm:block text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-2">
              Sign in
            </a>
            <a href={cta.href} className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors shadow-sm">
              {cta.label}
            </a>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-white">
          <div className="px-4 py-4 space-y-2">
            {links.map((link, index) => (
              <a key={index} href={link.href} onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-secondary)] rounded-lg">
                {link.label}
              </a>
            ))}
            <div className="pt-2 border-t border-[var(--border)]">
              <a href="https://stockflows.fly.dev" className="block px-3 py-2 text-sm font-medium text-[var(--text-secondary)]">Sign in</a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
