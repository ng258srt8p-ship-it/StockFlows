import React from 'react';
import { Card, Badge } from '@stockflows/ui';

const checks = [
  { name: 'Database Connection', status: 'healthy' as const },
  { name: 'Shopify API Sync', status: 'healthy' as const },
  { name: 'Forecasting Engine', status: 'healthy' as const },
  { name: 'Webhook Processing', status: 'degraded' as const },
  { name: 'Email Service', status: 'healthy' as const },
  { name: 'Background Jobs', status: 'healthy' as const },
];

const HealthPage: React.FC = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">System Health</h1>

    <Card>
      <div className="space-y-4">
        {checks.map(check => (
          <div key={check.name} className="flex items-center justify-between py-4 border-b border-[var(--border)] last:border-0">
            <span className="text-[var(--text-primary)]">{check.name}</span>
            <Badge status={check.status === 'healthy' ? 'success' : check.status === 'degraded' ? 'warning' : 'error'}>
              {check.status}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

export default HealthPage;
