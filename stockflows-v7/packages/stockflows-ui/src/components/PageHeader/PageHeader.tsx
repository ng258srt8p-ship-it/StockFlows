import React from "react";
import type { PageHeaderProps } from "../../types";

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions = [],
  breadcrumbs,
  className = "",
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      {breadcrumbs && (
        <nav className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-4">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.label}>
              {index > 0 && <span className="text-[var(--text-tertiary)]">/</span>}
              <a href={crumb.href} className="hover:text-[var(--accent)] transition-colors">
                {crumb.label}
              </a>
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">{title}</h1>
          {subtitle && (
            <p className="text-[var(--text-secondary)] mt-2">{subtitle}</p>
          )}
        </div>
        {actions.length > 0 && (
          <div className="flex items-center gap-3">
            {actions.map((action, index) => (
              <button
                key={index}
                className="bg-[var(--accent)] text-[var(--bg-primary)] px-4 py-2 rounded-lg font-medium text-sm hover:bg-[var(--accent-hover)] transition-colors"
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
