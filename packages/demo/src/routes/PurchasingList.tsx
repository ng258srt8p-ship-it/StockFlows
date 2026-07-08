import React, { useState } from 'react';
import { Badge, Card } from '@stockflows/ui';
import { useDemoStore } from '../store/useStore';

const PurchasingList: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const purchaseOrders = useDemoStore((s) => s.purchaseOrders);

  const filtered = statusFilter === 'all'
    ? purchaseOrders
    : purchaseOrders.filter(po => po.status === statusFilter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting': return <Badge status="info">Waiting</Badge>;
      case 'ready': return <Badge status="success">Ready to Receive</Badge>;
      case 'done': return <Badge status="success">Completed</Badge>;
      case 'draft': return <Badge status="warning">Draft</Badge>;
      case 'cancelled': return <Badge status="error">Cancelled</Badge>;
      default: return <Badge status="info">{status}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Purchase Orders ({purchaseOrders.length})</h1>
        <button className="bg-[var(--accent)] text-[var(--bg-primary)] px-4 py-2 rounded-lg font-medium">
          New PO
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-3 mb-6">
        {['all', 'draft', 'waiting', 'ready', 'done'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* PO List */}
      <Card>
        {filtered.map(po => (
          <div key={po.id} className="flex items-center justify-between py-4 border-b border-[var(--border)] last:border-0">
            <div>
              <span className="text-[var(--text-primary)] font-medium">{po.id}</span>
              <span className="text-[var(--text-secondary)] ml-4">{po.vendor}</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-[var(--text-secondary)]">{po.items} items</span>
              <span className="text-[var(--accent)] font-medium">${po.total.toLocaleString()}</span>
              {getStatusBadge(po.status)}
              <span className="text-[var(--text-secondary)] text-sm">ETA: {po.eta}</span>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default PurchasingList;
