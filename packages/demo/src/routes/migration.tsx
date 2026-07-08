import React from 'react';
import { Card, Badge } from '@stockflows/ui';

const features = [
  { name: 'Inventory Sync', status: 'completed' as const },
  { name: 'Purchase Orders', status: 'completed' as const },
  { name: 'Forecasting Engine', status: 'completed' as const },
  { name: 'Vendor Management', status: 'completed' as const },
  { name: 'Real-time Alerts', status: 'completed' as const },
  { name: 'Reports & Export', status: 'completed' as const },
  { name: 'Barcode Scanning', status: 'completed' as const },
  { name: 'Multi-location Support', status: 'in_progress' as const },
  { name: 'AI Recommendations', status: 'in_progress' as const },
  { name: 'Advanced Analytics', status: 'pending' as const },
];

const completedCount = features.filter(f => f.status === 'completed').length;
const totalFeatures = features.length;

const MigrationStatus: React.FC = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Stocky Migration Status</h1>

    <Card className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Progress</h2>
        <span className="text-3xl font-bold text-[var(--accent)]">{((completedCount / totalFeatures) * 100).toFixed(0)}%</span>
      </div>
      <div className="h-4 bg-[var(--bg-primary)] rounded-full overflow-hidden">
        <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${(completedCount / totalFeatures) * 100}%` }} />
      </div>
      <p className="text-[var(--text-secondary)] text-sm mt-2">{completedCount} of {totalFeatures} features migrated</p>
    </Card>

    <Card>
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Feature Parity Checklist</h2>
      <div className="space-y-4">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
            <span className="text-[var(--text-primary)]">{feature.name}</span>
            <Badge status={feature.status === 'completed' ? 'success' : feature.status === 'in_progress' ? 'info' : 'warning'}>
              {feature.status === 'completed' ? 'Completed' : feature.status === 'in_progress' ? 'In Progress' : 'Pending'}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

export default MigrationStatus;
