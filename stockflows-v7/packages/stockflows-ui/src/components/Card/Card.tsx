import React from "react";
import type { CardProps } from "../../types";

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hoverable = false,
  elevation = "md",
}) => {
  const elevationClasses = {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };
  
  return (
    <div className={`bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-6 ${elevationClasses[elevation]} ${hoverable ? "hover:border-[var(--accent)] hover:bg-[var(--bg-tertiary)] transition-all duration-200" : ""} ${className}`}>
      {children}
    </div>
  );
};
