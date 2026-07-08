import React from 'react';
import { Card, Badge } from '@stockflows/ui';
import { useDemoStore } from '../../store/useStore';

const mockStockHistory = [
  { date: '2026-07-01', change: -5, reason: 'Sold' },
  { date: '2026-07-03', change: +100, reason: 'PO received' },
  { date: '2026-07-05', change: -12, reason: 'Transfer' },
];

const InventoryDetail: React.FC = () => {
  const inventory = useDemoStore((s) => s.inventory);
  const mockItem = inventory[0] || {
    id: '1', sku: 'SKU-DEFAULT', title: 'Default Item', quantity: 0,
    reorderPoint: 0, costPerUnit: 0, location: 'Warehouse A',
    velocity: 'medium' as const, category: 'General', vendor: 'Unknown',
  };
  const stockPercent = (mockItem.quantity / 500) * 100;
  const isLowStock = mockItem.quantity <= mockItem.reorderPoint;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">{mockItem.sku}</h1>
        <div className="flex gap-3">
          <button className="bg-[var(--bg-tertiary)] text-[var(--text-primary)] px-4 py-2 rounded-lg text-sm border border-[var(--border-hover)] hover:border-[var(--accent)]">
            Transfer
          </button>
          <button className="bg-[var(--accent)] text-[var(--bg-primary)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)]">
            Adjust Stock
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Item Details</h2>
          <div className="space-y-3 text-[var(--text-secondary)]">
            <div className="flex justify-between"><span>Title:</span><span className="text-[var(--text-primary)]">{mockItem.title}</span></div>
            <div className="flex justify-between"><span>Location:</span><span className="text-[var(--text-primary)]">{mockItem.location}</span></div>
            <div className="flex justify-between"><span>Category:</span><span className="text-[var(--text-primary)]">{mockItem.category}</span></div>
            <div className="flex justify-between"><span>Vendor:</span><span className="text-[var(--text-primary)]">{mockItem.vendor}</span></div>
            <div className="flex justify-between"><span>Velocity:</span><Badge status={mockItem.velocity === 'high' ? 'error' : mockItem.velocity === 'medium' ? 'warning' : 'success'}>{mockItem.velocity}</Badge></div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Stock Level</h2>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[var(--text-secondary)]">Current Stock</span>
              <span className="text-[var(--text-primary)]">{mockItem.quantity} / 500</span>
            </div>
            <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all"
                style={{
                  width: `${stockPercent}%`,
                  backgroundColor: isLowStock ? 'var(--danger)' : 'var(--success)',
                }}
              />
            </div>
          </div>
          <div className="space-y-2 text-sm text-[var(--text-secondary)]">
            <div className="flex justify-between"><span>Cost per Unit:</span><span className="text-[var(--text-primary)]">${mockItem.costPerUnit.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Total Value:</span><span className="text-[var(--accent)] font-bold">${(mockItem.quantity * mockItem.costPerUnit).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Reorder Point:</span><span className="text-[var(--text-primary)]">{mockItem.reorderPoint}</span></div>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Stock History</h2>
        <div className="space-y-3">
          {mockStockHistory.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
              <span className="text-[var(--text-secondary)]">{entry.date}</span>
              <span className={`font-medium ${entry.change > 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                {entry.change > 0 ? '+' : ''}{entry.change}
              </span>
              <span className="text-[var(--text-primary)]">{entry.reason}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default InventoryDetail;
