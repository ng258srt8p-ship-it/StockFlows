import React from "react";
import type { StockBadgeProps } from "../../types";

export const StockBadge: React.FC<StockBadgeProps> = ({
  quantity,
  threshold,
  className = "",
}) => {
  const isLowStock = quantity <= threshold;
  const isCritical = quantity === 0;
  
  let bgColor: string;
  let textColor: string;
  let label: string;
  
  if (isCritical) {
    bgColor = "bg-[var(--danger)]/10";
    textColor = "text-[var(--danger)]";
    label = "Out of Stock";
  } else if (isLowStock) {
    bgColor = "bg-[var(--warning)]/10";
    textColor = "text-[var(--warning)]";
    label = "Low Stock";
  } else {
    bgColor = "bg-[var(--success)]/10";
    textColor = "text-[var(--success)]";
    label = "In Stock";
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${bgColor} ${textColor} border-current ${className}`}>
      {label}
    </span>
  );
};
