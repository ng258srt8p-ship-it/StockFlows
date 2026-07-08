import React from "react";
import type { ButtonProps } from "../../types";

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  children,
  onClick,
  className = "",
  ariaLabel,
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-white";

  const variantClasses = {
    primary: "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-md hover:shadow-lg",
    secondary: "bg-white text-[var(--accent)] border-2 border-[var(--accent)]/30 hover:border-[var(--accent)] hover:shadow-md",
    ghost: "bg-transparent text-[var(--accent)] hover:bg-[var(--accent-muted)]",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-base gap-2",
    lg: "px-6 py-3 text-lg gap-2.5",
  };

  const disabledClasses = "opacity-50 cursor-not-allowed";

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled || loading ? disabledClasses : ""} ${className}`;

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading}
    >
      {loading && (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {icon && <span className="material-symbols-outlined text-inherit">{icon}</span>}
      {children}
    </button>
  );
};
