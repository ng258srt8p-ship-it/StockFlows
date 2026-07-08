import type { ReactNode } from 'react';

export interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  fullWidth?: boolean;
}

export interface BadgeProps {
  type?: "success" | "warning" | "error" | "info";
  status?: "success" | "warning" | "error" | "info";
  children: ReactNode;
  className?: string;
}

export interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  elevation?: "sm" | "md" | "lg";
}

export interface NavigationProps {
  links?: Array<{ label: string; href: string }>;
  dropdowns?: Array<{
    label: string;
    items: Array<{ label: string; href: string }>;
  }>;
  cta?: { label: string; href: string };
  className?: string;
}

export interface FooterProps {
  links?: Array<{ label: string; href: string }>;
  copyright?: string;
  className?: string;
}

export interface HeroSectionProps {
  headline: string;
  subcopy: string;
  ctaPrimary?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  terminalContent?: string;
  className?: string;
}

export interface FeatureCardsProps {
  features: Array<{
    icon: string;
    title: string;
    description: string;
    preview?: string;
  }>;
  className?: string;
}

export interface ComparisonMatrixProps {
  rows: Array<{
    capability: string;
    stocky: "Sunsetting" | "Limited";
    stockflows: "Upgrade" | "Full";
  }>;
  className?: string;
}

export interface CustomerLogosProps {
  logos: Array<{ name: string; src: string }>;
  heading?: string;
  className?: string;
}

export interface LoadingSkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export interface StatCardProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: string;
  className?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: Array<{ label: string; onClick: () => void }>;
  breadcrumbs?: Array<{ label: string; href: string }>;
  className?: string;
}

export interface StockBadgeProps {
  quantity: number;
  threshold: number;
  className?: string;
}

export interface TourStepProps {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  targetElement?: HTMLElement | null;
  onNext?: () => void;
  onPrev?: () => void;
  onComplete?: () => void;
  onClose?: () => void;
}

export interface AppSidebarProps {
  items: Array<{
    label: string;
    href: string;
    icon: string;
    badge?: string;
  }>;
  collapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

export interface MockDataProviderProps {
  children: ReactNode;
  mockData?: Record<string, any>;
  className?: string;
}
