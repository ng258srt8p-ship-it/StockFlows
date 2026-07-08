import React, { useState } from 'react';
import { Card, Badge } from '@stockflows/ui';
import { useDemoStore } from '../../store/useStore';

const StockTransfer: React.FC = () => {
  const transfers = useDemoStore((s) => s.transfers);
  const locations = useDemoStore((s) => s.locations);
  const inventory = useDemoStore((s) => s.inventory);
  const [searchText, setSearchText] = useState('');

  const filtered = transfers.filter(t =>
    t.sku.toLowerCase().includes(searchText.toLowerCase()) ||
    t.from.toLowerCase().includes(searchText.toLowerCase()) ||
    t.to.toLowerCase().includes(searchText.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge status="success">Completed</Badge>;
      case 'in_transit': return <Badge status="info">In Transit</Badge>;
      case 'pending': return <Badge status="warning">Pending</Badge>;
      default: return <Badge status="error">{status}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Stock Transfers</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">New Transfer</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[var(--text-secondary)] text-sm mb-2">From Location</label>
              <select className="w-full bg-[var(--bg-primary)] border-2 border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)]">
                {locations.map(loc => <option key={loc.id}>{loc.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[var(--text-secondary)] text-sm mb-2">To Location</label>
              <select className="w-full bg-[var(--bg-primary)] border-2 border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)]">
                {locations.map(loc => <option key={loc.id}>{loc.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[var(--text-secondary)] text-sm mb-2">SKU</label>
              <select className="w-full bg-[var(--bg-primary)] border-2 border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)]">
                {inventory.slice(0, 10).map(item => <option key={item.id}>{item.sku}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[var(--text-secondary)] text-sm mb-2">Quantity</label>
              <input type="number" placeholder="Enter quantity" className="w-full bg-[var(--bg-primary)] border-2 border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)]" />
            </div>
            <button className="w-full bg-[var(--accent)] text-[var(--bg-primary)] px-4 py-3 rounded-lg font-medium hover:bg-[#D9FF4A]">
              Create Transfer
            </button>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Location Inventory</h2>
          <div className="space-y-3">
            {locations.map(loc => (
              <div key={loc.id} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
                <div>
                  <span className="text-[var(--text-primary)] font-medium">{loc.name}</span>
                  <span className="text-[var(--text-secondary)] ml-2 text-sm capitalize">({loc.type})</span>
                </div>
                <div className="text-right">
                  <span className="text-[var(--text-primary)]">{loc.skus} SKUs</span>
                  <div className="text-[var(--text-secondary)] text-sm">{loc.used}/{loc.capacity} units</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Transfer History</h2>
        <input
          type="text"
          placeholder="Search transfers..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="w-full bg-[var(--bg-primary)] border-2 border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)] mb-4"
        />
        <div className="space-y-3">
          {filtered.map(t => (
            <div key={t.id} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
              <div>
                <span className="text-[var(--text-primary)] font-medium">{t.id}</span>
                <span className="text-[var(--text-secondary)] ml-4 text-sm">{t.from} → {t.to}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[var(--text-secondary)] text-sm">{t.sku}</span>
                <span className="text-[var(--text-primary)]">{t.quantity} units</span>
                {getStatusBadge(t.status)}
                <span className="text-[var(--text-secondary)] text-sm">{t.date}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default StockTransfer;
