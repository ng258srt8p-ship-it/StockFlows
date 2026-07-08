import React from 'react';
import { Card, Badge } from '@stockflows/ui';
import { PageHeader } from '@stockflows/ui';
import { useDemoStore } from '../store/useStore';

const Forecasting: React.FC = () => {
  const forecasts = useDemoStore((s) => s.forecasts);
  const inventory = useDemoStore((s) => s.inventory);

  const highConfidence = forecasts.filter(f => f.confidence >= 0.85).length;
  const reorderRecommended = forecasts.filter(f => f.forecast > inventory.find(i => i.sku === f.sku)?.reorderPoint!).length;

  return (
    <div className="p-6">
      <PageHeader title="Forecasting" subtitle="AI-powered demand predictions" />

      {/* Forecast Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <span className="text-[var(--text-secondary)] text-sm">Total SKUs Forecast</span>
          <div className="text-3xl font-bold text-[var(--text-primary)] mt-2">{inventory.length}</div>
        </Card>
        <Card>
          <span className="text-[var(--text-secondary)] text-sm">High Confidence</span>
          <div className="text-3xl font-bold text-[var(--success)] mt-2">{highConfidence}</div>
        </Card>
        <Card>
          <span className="text-[var(--text-secondary)] text-sm">Reorder Recommended</span>
          <div className="text-3xl font-bold text-[var(--accent)] mt-2">{reorderRecommended}</div>
        </Card>
      </div>

      {/* Forecast Details */}
      <Card>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Forecast Results</h2>
        <div className="space-y-4">
          {forecasts.map((f, idx) => (
            <div key={idx} className="flex items-center justify-between py-4 border-b border-[var(--border)] last:border-0">
              <div>
                <span className="text-[var(--text-primary)] font-medium">{f.sku}</span>
                <span className="text-[var(--text-secondary)] ml-4">{f.title}</span>
              </div>
              <div className="flex items-center gap-4">
                <Badge status={f.confidence >= 0.85 ? 'success' : f.confidence >= 0.7 ? 'warning' : 'error'}>
                  {(f.confidence * 100).toFixed(0)}% confidence
                </Badge>
                <span className="text-[var(--text-primary)] font-medium">{f.forecast} units</span>
                <Badge status="info">{f.model}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Forecasting;
