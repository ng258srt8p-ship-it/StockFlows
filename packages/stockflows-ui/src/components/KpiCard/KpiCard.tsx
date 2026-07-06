import React from 'react';
import { Card as PolarisCard } from '@shopify/polaris';
import type { ColorBackgroundAlias } from '@shopify/polaris-tokens';
import './KpiCard.css';

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; label: string; direction: 'up' | 'down' };
  icon?: React.ReactNode;
  onClick?: () => void;
  padding?: '100' | '200' | '300' | '400' | '500' | '600';
  background?: ColorBackgroundAlias;
}

export const KpiCard = ({ title, value, subtitle, trend, icon, onClick, padding = '400', background, ...props }: KpiCardProps) => {
  return (
    <div className={`sf-kpi-card ${onClick ? 'sf-kpi-card--clickable' : ''}`} onClick={onClick} {...props}>
      <PolarisCard padding={padding} background={background}>
        <div className="sf-kpi-card__header">
          <div className="sf-kpi-card__title-section">
            <h3 className="sf-kpi-card__title">{title}</h3>
            {subtitle && <p className="sf-kpi-card__subtitle">{subtitle}</p>}
          </div>
          {icon && <div className="sf-kpi-card__icon">{icon}</div>}
        </div>
        <div className="sf-kpi-card__value">{value}</div>
        {trend && (
          <div className={`sf-kpi-card__trend sf-kpi-card__trend--${trend.direction}`}>
            <span className="sf-kpi-card__trend-value">{trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
            <span className="sf-kpi-card__trend-label">{trend.label}</span>
          </div>
        )}
      </PolarisCard>
    </div>
  );
};

KpiCard.displayName = 'KpiCard';