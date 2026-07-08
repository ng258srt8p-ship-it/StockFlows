import React, { useState } from 'react';
import { Card } from '@stockflows/ui';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// Mock data for charts
const stockLevelsData = [
  { date: 'Jul 1', total: 2450, low: 180, out: 12 },
  { date: 'Jul 2', total: 2380, low: 210, out: 15 },
  { date: 'Jul 3', total: 2520, low: 165, out: 8 },
  { date: 'Jul 4', total: 2410, low: 195, out: 11 },
  { date: 'Jul 5', total: 2600, low: 150, out: 6 },
  { date: 'Jul 6', total: 2550, low: 170, out: 9 },
  { date: 'Jul 7', total: 2480, low: 185, out: 10 },
  { date: 'Jul 8', total: 2650, low: 140, out: 5 },
];

const poByMonthData = [
  { month: 'Feb', orders: 18, value: 12400 },
  { month: 'Mar', orders: 24, value: 18200 },
  { month: 'Apr', orders: 15, value: 9800 },
  { month: 'May', orders: 28, value: 21500 },
  { month: 'Jun', orders: 22, value: 16800 },
  { month: 'Jul', orders: 19, value: 14200 },
];

const forecastAccuracyData = [
  { actual: 120, predicted: 115, sku: 'SKU-001' },
  { actual: 85, predicted: 92, sku: 'SKU-002' },
  { actual: 200, predicted: 195, sku: 'SKU-003' },
  { actual: 60, predicted: 55, sku: 'SKU-004' },
  { actual: 150, predicted: 160, sku: 'SKU-005' },
  { actual: 95, predicted: 88, sku: 'SKU-006' },
  { actual: 180, predicted: 175, sku: 'SKU-007' },
  { actual: 75, predicted: 82, sku: 'SKU-008' },
];

const vendorPerformanceData = [
  { name: 'Acme Supplies', orders: 45, value: 45 },
  { name: 'Global Parts', orders: 32, value: 32 },
  { name: 'TechSource', orders: 28, value: 28 },
  { name: 'QuickShip', orders: 18, value: 18 },
  { name: 'Others', orders: 12, value: 12 },
];

const COLORS = ['#C7FB33', '#60A5FA', '#F472B6', '#34D399', '#A78BFA'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-[var(--border)] p-3" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <p className="text-sm font-medium text-[var(--text-primary)] mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
};

export default function Reports() {
  const [dateRange, setDateRange] = useState('7d');

  const handleExportCSV = (reportName: string) => {
    const csv = `${reportName}\nGenerated: ${new Date().toISOString()}\n\nSee dashboard for visual data`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Reports & Analytics</h1>
          <p className="text-[var(--text-secondary)] mt-1">Inventory insights and performance data</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm text-[var(--text-primary)] bg-[var(--bg-primary)] border-[var(--border)]"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={() => handleExportCSV('StockFlows Report')}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)]"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inventory Stock Levels */}
        <Card>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Inventory Stock Levels</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stockLevelsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: 12 }} />
              <Area type="monotone" dataKey="total" stroke="#C7FB33" fill="#C7FB33" fillOpacity={0.15} name="Total Stock" />
              <Area type="monotone" dataKey="low" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.15} name="Low Stock" />
              <Area type="monotone" dataKey="out" stroke="#EF4444" fill="#EF4444" fillOpacity={0.15} name="Out of Stock" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Purchase Orders by Month */}
        <Card>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Purchase Orders by Month</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={poByMonthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: 12 }} />
              <Bar dataKey="orders" fill="#60A5FA" name="Orders" radius={[4, 4, 0, 0]} />
              <Bar dataKey="value" fill="#C7FB33" name="Value ($)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Forecast Accuracy */}
        <Card>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Forecast Accuracy</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={forecastAccuracyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="sku" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: 12 }} />
              <Line type="monotone" dataKey="actual" stroke="#C7FB33" strokeWidth={2} name="Actual" dot={{ fill: '#C7FB33' }} />
              <Line type="monotone" dataKey="predicted" stroke="#60A5FA" strokeWidth={2} name="Predicted" strokeDasharray="5 5" dot={{ fill: '#60A5FA' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Vendor Performance */}
        <Card>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Vendor Order Distribution</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={vendorPerformanceData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="orders"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {vendorPerformanceData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
