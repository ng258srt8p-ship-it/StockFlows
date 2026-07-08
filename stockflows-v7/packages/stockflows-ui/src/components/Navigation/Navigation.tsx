import React, { useState } from "react";
import type { NavigationProps } from "../../types";

export const Navigation: React.FC<NavigationProps> = ({
  links = [],
  dropdowns = [],
  cta,
  className = "",
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  return (
    <nav className={`sticky top-0 z-[100] bg-[var(--bg-primary)]/95 backdrop-blur-sm border-b border-[var(--border)] ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <a href="/" className="text-xl font-bold text-[var(--accent)]">StockFlows</a>
            <div className="hidden md:flex items-center gap-6">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-sm font-medium"
                >
                  {link.label}
                </a>
              ))}
              {dropdowns.map((dropdown) => (
                <div key={dropdown.label} className="relative">
                  <button
                    className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-sm font-medium flex items-center gap-1"
                    onClick={() => setOpenDropdown(openDropdown === dropdown.label ? null : dropdown.label)}
                    aria-expanded={openDropdown === dropdown.label}
                    aria-haspopup="true"
                  >
                    {dropdown.label}
                    <span className="material-symbols-outlined text-xs">expand_more</span>
                  </button>
                  {openDropdown === dropdown.label && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-lg shadow-md py-1" role="menu">
                      {dropdown.items.map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          role="menuitem"
                          className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-tertiary)]"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {cta && (
            <a
              href={cta.href}
              className="bg-[var(--accent)] text-[var(--bg-primary)] px-4 py-2 rounded-md font-medium text-sm hover:bg-[var(--accent-hover)] transition-colors"
            >
              {cta.label}
            </a>
          )}
        </div>
      </div>
    </nav>
  );
};
