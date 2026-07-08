import React from "react";

export interface BadgeProps {
  type: "success" | "warning" | "error" | "info";
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  success: "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30",
  warning: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/30",
  error: "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/30",
  info: "bg-[var(--info)]/10 text-[var(--info)] border-[var(--info)]/30",
};

export const Badge: React.FC<BadgeProps> = ({ type, children, className = "" }) => {
  const variantStyle = variantStyles[type];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyle} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;