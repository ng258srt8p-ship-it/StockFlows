import React, { useState } from 'react';
import { Card, Badge } from '@stockflows/ui';
import { useDemoStore } from '../../store/useStore';

interface LineItem {
  sku: string;
  title: string;
  quantity: number;
  cost: number;
}

const PurchasingNew: React.FC = () => {
  const vendors = useDemoStore((s) => s.vendors);
  const inventory = useDemoStore((s) => s.inventory);
  const [selectedVendor, setSelectedVendor] = useState(vendors[0]?.name || '');
  const [items, setItems] = useState<LineItem[]>([
    { sku: inventory[0]?.sku || '', title: inventory[0]?.title || '', quantity: 10, cost: inventory[0]?.costPerUnit || 0 },
  ]);

  const addItem = () => {
    setItems([...items, { sku: inventory[0]?.sku || '', title: inventory[0]?.title || '', quantity: 10, cost: inventory[0]?.costPerUnit || 0 }]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const total = items.reduce((s, i) => s + i.quantity * i.cost, 0);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[#FFFFFF] mb-8">Create Purchase Order</h1>

      <Card className="mb-8">
        <div className="mb-6">
          <label className="block text-[#A0A3AB] text-sm mb-2">Vendor</label>
          <select
            value={selectedVendor}
            onChange={e => setSelectedVendor(e.target.value)}
            className="w-full bg-[#0A0B0E] border-2 border-[#20232A] rounded-lg px-4 py-3 text-[#FFFFFF] focus:border-[#C7FB33]"
          >
            {vendors.map(v => (
              <option key={v.id} value={v.name}>{v.name}</option>
            ))}
          </select>
        </div>

        <h2 className="text-xl font-bold text-[#FFFFFF] mb-4">Line Items</h2>
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-4 items-end">
              <div className="col-span-4">
                <label className="block text-[#A0A3AB] text-sm mb-2">SKU</label>
                <select
                  value={item.sku}
                  onChange={e => {
                    const inv = inventory.find(i => i.sku === e.target.value);
                    const updated = [...items];
                    updated[idx] = {
                      ...updated[idx],
                      sku: e.target.value,
                      title: inv?.title || '',
                      cost: inv?.costPerUnit || 0,
                    };
                    setItems(updated);
                  }}
                  className="w-full bg-[#0A0B0E] border-2 border-[#20232A] rounded-lg px-4 py-3 text-[#FFFFFF] focus:border-[#C7FB33]"
                >
                  {inventory.map(i => <option key={i.id} value={i.sku}>{i.sku}</option>)}
                </select>
              </div>
              <div className="col-span-3">
                <label className="block text-[#A0A3AB] text-sm mb-2">Quantity</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={e => {
                    const updated = [...items];
                    updated[idx] = { ...updated[idx], quantity: parseInt(e.target.value) || 0 };
                    setItems(updated);
                  }}
                  className="w-full bg-[#0A0B0E] border-2 border-[#20232A] rounded-lg px-4 py-3 text-[#FFFFFF] focus:border-[#C7FB33]"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[#A0A3AB] text-sm mb-2">Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={item.cost}
                  onChange={e => {
                    const updated = [...items];
                    updated[idx] = { ...updated[idx], cost: parseFloat(e.target.value) || 0 };
                    setItems(updated);
                  }}
                  className="w-full bg-[#0A0B0E] border-2 border-[#20232A] rounded-lg px-4 py-3 text-[#FFFFFF] focus:border-[#C7FB33]"
                />
              </div>
              <div className="col-span-2">
                <span className="text-[#C7FB33] font-medium">${(item.quantity * item.cost).toFixed(2)}</span>
              </div>
              <div className="col-span-1">
                <button onClick={() => removeItem(idx)} className="text-[#EF4444] hover:text-[#F87171]">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addItem} className="mt-4 text-[#C7FB33] text-sm font-medium">+ Add Line Item</button>
      </Card>

      <Card className="mb-8">
        <div className="flex justify-between items-center">
          <span className="text-[#A0A3AB]">Total</span>
          <span className="text-3xl font-bold text-[#C7FB33]">${total.toFixed(2)}</span>
        </div>
      </Card>

      <div className="flex gap-4">
        <button className="flex-1 bg-[#20232A] text-[#FFFFFF] px-4 py-3 rounded-lg border border-[#373A42] hover:border-[#C7FB33]">
          Save as Draft
        </button>
        <button className="flex-1 bg-[#C7FB33] text-[#0A0B0E] px-4 py-3 rounded-lg font-medium hover:bg-[#D9FF4A]">
          Submit Purchase Order
        </button>
      </div>
    </div>
  );
};

export default PurchasingNew;
