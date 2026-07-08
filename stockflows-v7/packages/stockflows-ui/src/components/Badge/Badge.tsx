import React from "react";
import type { BadgeProps } from "../../types";

export const Badge: React.FC<BadgeProps> = ({ type, status, children, className = "" }) => {
  const badgeType = type || status || "info";
  const typeClasses = {
    success: "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30",
    warning: "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30",
    error: "bg-[var(--danger)]/15 text-[var(--danger)] border-[var(--danger)]/30",
    info: "bg-[var(--info)]/15 text-[var(--info)] border-[var(--info)]/30",
  };
  
  const classes = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeClasses[badgeType]} ${className}`;
  
  return (
    <span className={classes}>
      {children}
    </span>
  );
};
