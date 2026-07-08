import React, { useState } from 'react';
import { Badge, Card, StatCard } from '@stockflows/ui';
import { useDemoStore } from '../store/useStore';

const InventoryList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const inventory = useDemoStore((s) => s.inventory);
  const totalStockValue = useDemoStore((s) => s.totalStockValue);

  const categories = ['all', ...Array.from(new Set(inventory.map(i => i.category)))];

  const filtered = inventory.filter(i => {
    const matchesSearch = i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase()) ||
      i.vendor.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || i.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStockBadge = (item: typeof inventory[0]) => {
    if (item.quantity === 0) return <Badge status="error">Out of Stock</Badge>;
    if (item.quantity <= item.reorderPoint) return <Badge status="warning">Low Stock</Badge>;
    return <Badge status="success">In Stock</Badge>;
  };

  const getVelocityBadge = (velocity: string) => {
    switch (velocity) {
      case 'high': return <Badge status="error">High</Badge>;
      case 'medium': return <Badge status="warning">Medium</Badge>;
      case 'low': return <Badge status="success">Low</Badge>;
      default: return <Badge status="info">{velocity}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Inventory ({inventory.length} SKUs)</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total SKUs" value={String(inventory.length)} trend="neutral" icon="inventory_2" />
        <StatCard label="Total Stock Value" value={`$${totalStockValue().toLocaleString()}`} trend="up" icon="attach_money" />
        <StatCard label="Categories" value={String(categories.length - 1)} trend="neutral" icon="category" />
      </div>

      <Card className="mb-6">
        <input
          type="text"
          placeholder="Search by SKU, title, or vendor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-default)',
            color: 'var(--text-primary)',
            '--tw-ring-color': 'var(--accent)',
          } as React.CSSProperties}
        />
      </Card>

      <div className="flex gap-2 mb-4 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              categoryFilter === cat
                ? 'text-[var(--bg-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            style={{
              backgroundColor: categoryFilter === cat ? 'var(--accent)' : 'var(--bg-tertiary)',
            }}
          >
            {cat === 'all' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: 'var(--text-tertiary)' }}>
                <th className="text-left py-2 px-3">SKU</th>
                <th className="text-left py-2 px-3">Title</th>
                <th className="text-left py-2 px-3">Category</th>
                <th className="text-left py-2 px-3">Vendor</th>
                <th className="text-right py-2 px-3">Qty</th>
                <th className="text-right py-2 px-3">Reorder Pt</th>
                <th className="text-right py-2 px-3">Cost</th>
                <th className="text-left py-2 px-3">Location</th>
                <th className="text-center py-2 px-3">Status</th>
                <th className="text-center py-2 px-3">Velocity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="border-t" style={{ borderColor: 'var(--border-default)' }}>
                  <td className="py-3 px-3 font-mono text-xs" style={{ color: 'var(--accent)' }}>{item.sku}</td>
                  <td className="py-3 px-3" style={{ color: 'var(--text-primary)' }}>{item.title}</td>
                  <td className="py-3 px-3" style={{ color: 'var(--text-secondary)' }}>{item.category}</td>
                  <td className="py-3 px-3" style={{ color: 'var(--text-secondary)' }}>{item.vendor}</td>
                  <td className="py-3 px-3 text-right font-semibold" style={{ color: item.quantity === 0 ? 'var(--danger)' : 'var(--text-primary)' }}>{item.quantity}</td>
                  <td className="py-3 px-3 text-right" style={{ color: 'var(--text-tertiary)' }}>{item.reorderPoint}</td>
                  <td className="py-3 px-3 text-right" style={{ color: 'var(--text-primary)' }}>${item.costPerUnit.toFixed(2)}</td>
                  <td className="py-3 px-3" style={{ color: 'var(--text-secondary)' }}>{item.location}</td>
                  <td className="py-3 px-3 text-center">{getStockBadge(item)}</td>
                  <td className="py-3 px-3 text-center">{getVelocityBadge(item.velocity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default InventoryList;
