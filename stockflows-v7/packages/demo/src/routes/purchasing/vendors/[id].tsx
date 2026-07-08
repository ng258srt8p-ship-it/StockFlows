import React from 'react';
import { Card, Badge } from '@stockflows/ui';
import { useDemoStore } from '../../../store/useStore';

const mockVendor = {
  contact: 'orders@techgearn.com',
  leadTime: 14,
  onTimeDelivery: 94,
  qualityScore: 98,
  totalOrders: 47,
  recentOrders: [
    { id: 'PO-1042', date: '2026-07-01', total: 2450.00, status: 'waiting' as const },
    { id: 'PO-1043', date: '2026-06-15', total: 1890.00, status: 'done' as const },
    { id: 'PO-1044', date: '2026-05-28', total: 3200.00, status: 'done' as const },
  ],
  performanceHistory: [
    { metric: 'On-Time Delivery', value: '94%', trend: 'up' as const },
    { metric: 'Quality Score', value: '98%', trend: 'stable' as const },
    { metric: 'Lead Time', value: '14 days', trend: 'down' as const },
  ],
};

const VendorDetail: React.FC = () => {
  const purchaseOrders = useDemoStore((s) => s.purchaseOrders);
  const vendors = useDemoStore((s) => s.vendors);
  const mockVendorData = vendors[0] || { name: 'Unknown Vendor', category: 'General' };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting': return <Badge status="info">Waiting</Badge>;
      case 'ready': return <Badge status="success">Ready</Badge>;
      case 'done': return <Badge status="success">Completed</Badge>;
      case 'draft': return <Badge status="warning">Draft</Badge>;
      default: return <Badge status="error">{status}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#FFFFFF]">{mockVendorData.name}</h1>
        <Badge status="info">{mockVendorData.category}</Badge>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <span className="text-[#A0A3AB] text-sm">Lead Time</span>
          <div className="text-2xl font-bold text-[#FFFFFF] mt-1">{mockVendor.leadTime} days</div>
        </Card>
        <Card>
          <span className="text-[#A0A3AB] text-sm">On-Time Delivery</span>
          <div className="text-2xl font-bold text-[#C7FB33] mt-1">{mockVendor.onTimeDelivery}%</div>
        </Card>
        <Card>
          <span className="text-[#A0A3AB] text-sm">Quality Score</span>
          <div className="text-2xl font-bold text-[#C7FB33] mt-1">{mockVendor.qualityScore}%</div>
        </Card>
        <Card>
          <span className="text-[#A0A3AB] text-sm">Total Orders</span>
          <div className="text-2xl font-bold text-[#FFFFFF] mt-1">{mockVendor.totalOrders}</div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-xl font-bold text-[#FFFFFF] mb-4">Contact</h2>
          <div className="space-y-3 text-[#A0A3AB]">
            <div className="flex justify-between">
              <span>Email:</span>
              <span className="text-[#FFFFFF]">{mockVendor.contact}</span>
            </div>
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-bold text-[#FFFFFF] mb-4">Performance</h2>
          <div className="space-y-3">
            {mockVendor.performanceHistory.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-[#A0A3AB]">{p.metric}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#FFFFFF]">{p.value}</span>
                  <span className={`text-xs ${p.trend === 'up' ? 'text-[#10B981]' : p.trend === 'down' ? 'text-[#EF4444]' : 'text-[#A0A3AB]'}`}>
                    {p.trend === 'up' ? '↑' : p.trend === 'down' ? '↓' : '→'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-bold text-[#FFFFFF] mb-6">Recent Orders</h2>
        <div className="space-y-3">
          {mockVendor.recentOrders.map(order => (
            <div key={order.id} className="flex items-center justify-between py-3 border-b border-[#20232A] last:border-0">
              <div>
                <span className="text-[#FFFFFF] font-medium">{order.id}</span>
                <span className="text-[#A0A3AB] ml-4 text-sm">{order.date}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[#C7FB33] font-medium">${order.total.toLocaleString()}</span>
                {getStatusBadge(order.status)}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default VendorDetail;
