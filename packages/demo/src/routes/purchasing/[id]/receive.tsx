import React, { useState } from 'react';
import { Card, Badge } from '@stockflows/ui';
import { useDemoStore } from '../../../store/useStore';

const PurchasingReceive: React.FC = () => {
  const inventory = useDemoStore((s) => s.inventory);
  const [items, setItems] = useState([
    { sku: 'ELEC-SB-003', title: 'Portable Bluetooth Speaker', expected: 50, received: 48, cost: 32.00 },
    { sku: 'CLT-TEE-011', title: 'Classic Cotton Tee (White)', expected: 100, received: 0, cost: 8.50 },
    { sku: 'FDB-BAR-035', title: 'Energy Bars (Mixed)', expected: 200, received: 198, cost: 2.50 },
  ]);

  const totalExpected = items.reduce((s, i) => s + i.expected, 0);
  const totalReceived = items.reduce((s, i) => s + i.received, 0);
  const totalValue = items.reduce((s, i) => s + i.received * i.cost, 0);
  const allComplete = items.every(i => i.received === i.expected);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[#FFFFFF] mb-8">Receive Shipment — PO-1042</h1>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <span className="text-[#A0A3AB] text-sm">Total Expected</span>
          <div className="text-2xl font-bold text-[#FFFFFF] mt-1">{totalExpected}</div>
        </Card>
        <Card>
          <span className="text-[#A0A3AB] text-sm">Total Received</span>
          <div className="text-2xl font-bold text-[#C7FB33] mt-1">{totalReceived}</div>
        </Card>
        <Card>
          <span className="text-[#A0A3AB] text-sm">Value Received</span>
          <div className="text-2xl font-bold text-[#C7FB33] mt-1">${totalValue.toFixed(2)}</div>
        </Card>
        <Card>
          <span className="text-[#A0A3AB] text-sm">Status</span>
          <div className="mt-1">
            <Badge status={allComplete ? 'success' : 'warning'}>
              {allComplete ? 'Complete' : 'In Progress'}
            </Badge>
          </div>
        </Card>
      </div>

      <Card className="mb-8">
        <h2 className="text-xl font-bold text-[#FFFFFF] mb-6">Line Items Receiving</h2>
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-4 border-b border-[#20232A] last:border-0">
              <div>
                <span className="text-[#FFFFFF] font-medium">{item.sku}</span>
                <span className="text-[#A0A3AB] ml-4 text-sm">{item.title}</span>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-[#A0A3AB] text-sm">Expected: {item.expected}</span>
                  <input
                    type="number"
                    value={item.received}
                    onChange={e => {
                      const updated = [...items];
                      updated[idx] = { ...updated[idx], received: parseInt(e.target.value) || 0 };
                      setItems(updated);
                    }}
                    className="w-24 bg-[#0A0B0E] border-2 border-[#20232A] rounded px-3 py-1 text-[#FFFFFF] text-center focus:border-[#C7FB33]"
                  />
                  {item.received < item.expected && (
                    <Badge status="warning">Short</Badge>
                  )}
                  {item.received === item.expected && (
                    <Badge status="success">Complete</Badge>
                  )}
                </div>
              </div>
              <span className="text-[#C7FB33] font-medium">${(item.received * item.cost).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-4">
        <button className="flex-1 bg-[#20232A] text-[#FFFFFF] px-4 py-3 rounded-lg border border-[#373A42] hover:border-[#C7FB33]">
          Report Discrepancy
        </button>
        <button
          className="flex-1 px-4 py-3 rounded-lg font-medium"
          style={{
            backgroundColor: allComplete ? 'var(--accent)' : 'var(--bg-secondary)',
            color: allComplete ? 'var(--bg-primary)' : 'var(--text-primary)',
          }}
        >
          {allComplete ? 'Complete Receiving' : 'Save Progress'}
        </button>
      </div>
    </div>
  );
};

export default PurchasingReceive;
