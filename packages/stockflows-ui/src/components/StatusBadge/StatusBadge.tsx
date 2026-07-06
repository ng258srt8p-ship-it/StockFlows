import React from 'react';
import { Badge as PolarisBadge } from '@shopify/polaris';
import './StatusBadge.css';

export interface StatusBadgeProps {
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'incoming' | 'committed';
  showDot?: boolean;
}

export const StatusBadge = ({ status, showDot = true }: StatusBadgeProps) => {
  const config = {
    in_stock: { tone: 'success' as const, label: 'In Stock', dotColor: 'var(--p-color-status-success)' },
    low_stock: { tone: 'warning' as const, label: 'Low Stock', dotColor: 'var(--p-color-status-warning)' },
    out_of_stock: { tone: 'critical' as const, label: 'Out of Stock', dotColor: 'var(--p-color-status-critical)' },
    incoming: { tone: 'info' as const, label: 'Incoming', dotColor: 'var(--p-color-status-info)' },
    committed: { tone: 'info' as const, label: 'Committed', dotColor: 'var(--p-color-status-info)' },
  }[status];

  return (
    <span className={`sf-status-badge sf-status-badge--${status}`}>
      {showDot && <span className="sf-status-badge__dot" style={{ backgroundColor: config.dotColor }} />}
      <PolarisBadge tone={config.tone}>{config.label}</PolarisBadge>
    </span>
  );
};

export default StatusBadge;