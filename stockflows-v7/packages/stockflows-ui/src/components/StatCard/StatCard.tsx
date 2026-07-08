import React from "react";
import type { StatCardProps } from "../../types";

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  trend,
  trendValue,
  icon,
  className = "",
}) => {
  const trendColors = {
    up: "text-[var(--success)]",
    down: "text-[var(--danger)]",
    neutral: "text-[var(--text-secondary)]",
  };
  
  const trendIcons = {
    up: "trending_up",
    down: "trending_down",
    neutral: "trending_flat",
  };
  
  return (
    <div className={`bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-6 hover:border-[var(--border-hover)] transition-colors ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[var(--text-secondary)] text-sm font-medium">{label}</span>
        {icon && (
          <span className="material-symbols-outlined text-[var(--text-secondary)]">{icon}</span>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-[var(--text-primary)]">{value}</span>
        {trend && trendValue && (
          <span className={`flex items-center gap-1 text-sm ${trendColors[trend]}`}>
            <span className="material-symbols-outlined text-lg">{trendIcons[trend]}</span>
            <span>{trendValue}</span>
          </span>
        )}
      </div>
    </div>
  );
};
