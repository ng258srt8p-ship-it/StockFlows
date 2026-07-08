import React, { useState, useEffect } from 'react';
import { StatCard, Badge, Card } from '@stockflows/ui';
import { PageHeader } from '@stockflows/ui';
import { useDemoStore } from '../store/useStore';

/* ── Skeleton helpers ───────────────────────────────────────────── */

const SkeletonBar: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = '',
  style,
}) => (
  <div
    className={`animate-pulse rounded ${className}`}
    style={{
      background: 'var(--bg-tertiary)',
      ...style,
    }}
  />
);

const DashboardSkeleton: React.FC = () => (
  <div className="p-6" aria-busy="true" aria-label="Loading dashboard">
    <div className="mb-6">
      <SkeletonBar className="h-8 w-48" />
    </div>

    {/* KPI Card skeletons */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-xl p-5"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
        >
          <SkeletonBar className="h-4 w-28 mb-3" />
          <SkeletonBar className="h-8 w-20 mb-2" />
          <SkeletonBar className="h-3 w-16" />
        </div>
      ))}
    </div>

    {/* Alert skeletons */}
    <div
      className="rounded-xl p-5 mb-6"
      style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
    >
      <SkeletonBar className="h-5 w-36 mb-4" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg mb-2" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <SkeletonBar className="h-5 w-16 rounded-full shrink-0" />
          <SkeletonBar className="h-4 flex-1" />
        </div>
      ))}
    </div>

    {/* Activity skeletons */}
    <div
      className="rounded-xl p-5"
      style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
    >
      <SkeletonBar className="h-5 w-36 mb-4" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg mb-2" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="flex-1 space-y-2">
            <SkeletonBar className="h-4 w-48" />
            <SkeletonBar className="h-3 w-64" />
            <SkeletonBar className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ── Dashboard ─────────────────────────────────────────────────── */

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const inventory = useDemoStore((s) => s.inventory);
  const alerts = useDemoStore((s) => s.alerts);
  const activity = useDemoStore((s) => s.activity);
  const purchaseOrders = useDemoStore((s) => s.purchaseOrders);
  const totalStockValue = useDemoStore((s) => s.totalStockValue);
  const outOfStockCount = useDemoStore((s) => s.outOfStockCount);

  if (loading) return <DashboardSkeleton />;

  const stockValue = totalStockValue();
  const oosCount = outOfStockCount();
  const totalLogs = inventory.length + purchaseOrders.length + activity.length;

  return (
    <div className="p-6">
      <PageHeader title="Dashboard" subtitle="Real-time inventory overview" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Stock Value" value={`$${stockValue.toLocaleString()}`} trend="up" icon="attach_money" />
        <StatCard label="Out-of-Stock Risk" value={`${oosCount} SKUs`} trend="down" icon="warning" />
        <StatCard label="Audit Ledger Logs" value={`${totalLogs} entries`} trend="up" icon="article" />
        <StatCard label="Active POs" value={`${purchaseOrders.filter((p) => p.status === 'waiting').length}`} trend="neutral" icon="progress_activity" />
      </div>

      {/* Alerts */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Active Alerts</h2>
        <div className="space-y-2">
          {alerts.map(alert => (
            <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
              <Badge status={alert.type === 'critical' ? 'error' : alert.type === 'warning' ? 'warning' : 'info'}>
                {alert.type}
              </Badge>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{alert.message}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Activity</h2>
        <div className="space-y-2">
          {activity.slice(0, 6).map(item => (
            <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.action}</p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{item.detail}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{item.timestamp} — {item.user}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
