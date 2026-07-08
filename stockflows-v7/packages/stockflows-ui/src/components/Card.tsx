import React from "react";

export interface CardSectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  elevation?: "sm" | "md" | "lg";
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hoverable = false,
  elevation = "md",
  header,
  footer,
}) => {
  const elevationClasses = {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  const baseClasses = `bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-lg overflow-hidden ${elevationClasses[elevation]} ${className}`;
  const hoverClasses = hoverable
    ? "hover:border-[var(--accent)] hover:shadow-accent transition-all duration-150 cursor-pointer"
    : "";

  return (
    <div className={`${baseClasses} ${hoverClasses}`}>
      {header && (
        <div className="px-4 py-3 border-b border-[var(--border)]">
          {header}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
      {footer && (
        <div className="px-4 py-3 border-t border-[var(--border)]">
          {footer}
        </div>
      )}
    </div>
  );
};

const CardHeader: React.FC<CardSectionProps> = ({ title, subtitle, children, className = "", action }) => (
  <div className={`flex items-center justify-between ${className}`}>
    <div>
      {title && (
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
      )}
      {subtitle && (
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
      )}
    </div>
    {action && <div className="ml-2">{action}</div>}
    {children}
  </div>
);

const CardBody: React.FC<CardSectionProps> = ({ children, className = "" }) => (
  <div className={className}>
    {children}
  </div>
);

const CardFooter: React.FC<CardSectionProps> = ({ children, className = "" }) => (
  <div className={`flex items-center justify-end gap-2 ${className}`}>
    {children}
  </div>
);

export { CardHeader, CardBody, CardFooter };
export default Card;