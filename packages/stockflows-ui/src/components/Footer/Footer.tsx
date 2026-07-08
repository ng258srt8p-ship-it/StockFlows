import React from "react";
import type { FooterProps } from "../../types";

export const Footer: React.FC<FooterProps> = ({
  links = [],
  copyright = "© 2026 StockFlows. All rights reserved.",
  className = "",
}) => {
  return (
    <footer className={`bg-[var(--bg-secondary)] border-t border-[var(--border)] py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[var(--text-secondary)] text-sm">
            {copyright}
          </div>
          <div className="flex items-center gap-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-sm"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
