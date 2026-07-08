import React from 'react';
import { Card, Badge } from '@stockflows/ui';

const reportTemplates = [
  { id: '1', name: 'Inventory Summary', description: 'Current stock levels across all locations', icon: 'inventory_2' },
  { id: '2', name: 'Purchase Orders', description: 'All open and recent POs with status', icon: 'shopping_cart' },
  { id: '3', name: 'Forecast Accuracy', description: 'Model performance and prediction history', icon: 'trending_up' },
  { id: '4', name: 'Vendor Performance', description: 'Delivery times and quality metrics', icon: 'store' },
  { id: '5', name: 'Stock Transfers', description: 'Transfer history and current shipments', icon: 'swap_horiz' },
  { id: '6', name: 'Custom Report', description: 'Build your own report with selected criteria', icon: 'add' },
];

const Reports: React.FC = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Reports</h1>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reportTemplates.map(report => (
        <Card key={report.id}>
          <div className="flex items-start justify-between mb-4">
            <span className="text-[var(--accent)] text-2xl">{report.icon}</span>
            <Badge status="success">Export</Badge>
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{report.name}</h3>
          <p className="text-[var(--text-secondary)] text-sm mb-4">{report.description}</p>
          <div className="flex gap-3">
            <button className="bg-[var(--accent)] text-[var(--bg-primary)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#D9FF4A]">
              CSV Export
            </button>
            <button className="bg-[var(--bg-tertiary)] text-[var(--text-primary)] px-4 py-2 rounded-lg text-sm border border-[var(--border-hover)] hover:border-[var(--accent)]">
              PDF View
            </button>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

export default Reports;
