import React, { useState } from 'react';
import { Card, Badge } from '@stockflows/ui';
import { useDemoStore } from '../../../store/useStore';

const InventoryAdjust: React.FC = () => {
  const inventory = useDemoStore((s) => s.inventory);
  const adjustStock = useDemoStore((s) => s.adjustStock);
  const [selectedSku, setSelectedSku] = useState(inventory[0]?.sku || '');
  const [reason, setReason] = useState('');
  const [quantity, setQuantity] = useState('');

  const selectedItem = inventory.find(i => i.sku === selectedSku) || inventory[0];

  const mockAdjustments = [
    { id: 'ADJ-001', sku: 'ELEC-SB-003', quantity: -5, reason: 'Damaged goods', date: '2026-07-01' },
    { id: 'ADJ-002', sku: 'CLT-TEE-011', quantity: +10, reason: 'Found during count', date: '2026-07-03' },
    { id: 'ADJ-003', sku: 'FDB-BAR-035', quantity: -2, reason: 'Customer return', date: '2026-07-05' },
  ];

  const handleSubmit = () => {
    if (selectedItem && quantity) {
      adjustStock(selectedItem.id, parseInt(quantity), reason || 'Manual adjustment');
      setQuantity('');
      setReason('');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Manual Stock Adjustment</h1>

      <Card className="mb-8">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Adjust Stock</h2>
        <div className="mb-6">
          <label className="block text-[var(--text-secondary)] text-sm mb-2">Select SKU</label>
          <select
            value={selectedSku}
            onChange={e => setSelectedSku(e.target.value)}
            className="w-full bg-[var(--bg-primary)] border-2 border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)]"
          >
            {inventory.map(item => (
              <option key={item.id} value={item.sku}>{item.sku} — {item.title}</option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <span className="text-[var(--text-secondary)] block mb-2">Current: {selectedItem?.quantity || 0} units ({selectedSku})</span>
          <input
            type="number"
            placeholder="Enter adjustment (negative to decrease)"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            className="w-full bg-[var(--bg-primary)] border-2 border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)]"
          />
        </div>
        <div className="mb-6">
          <textarea
            placeholder="Reason for adjustment"
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full bg-[var(--bg-primary)] border-2 border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:border-[var(--accent)]"
            rows={3}
          />
        </div>
        <button
          onClick={handleSubmit}
          className="w-full bg-[var(--accent)] text-[var(--bg-primary)] px-4 py-3 rounded-lg font-medium hover:bg-[#D9FF4A]"
        >
          Submit Adjustment
        </button>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Recent Adjustments</h2>
        <div className="space-y-3">
          {mockAdjustments.map(adj => (
            <div key={adj.id} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
              <div>
                <span className="text-[var(--text-primary)] font-medium">{adj.id}</span>
                <span className="text-[var(--text-secondary)] ml-4 text-sm">{adj.sku}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-medium ${adj.quantity > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {adj.quantity > 0 ? '+' : ''}{adj.quantity}
                </span>
                <span className="text-[var(--text-primary)]">{adj.reason}</span>
                <span className="text-[var(--text-secondary)] text-sm">{adj.date}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default InventoryAdjust;
