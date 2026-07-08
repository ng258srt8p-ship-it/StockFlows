import React from "react";
import type { EmptyStateProps } from "../../types";

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = "",
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <span className="material-symbols-outlined text-6xl text-[var(--text-tertiary)] mb-4">{icon}</span>
      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-[var(--text-secondary)] mb-6">{description}</p>
      {action && (
        <button
          type="button"
          className="bg-[var(--accent)] text-[var(--bg-primary)] px-6 py-2 rounded-lg font-medium hover:bg-[var(--accent-hover)] transition-colors"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
