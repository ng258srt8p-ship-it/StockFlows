import React from 'react';
import { Card, Badge } from '@stockflows/ui';
import { useDemoStore } from '../../store/useStore';

const mockPO = {
  items: [
    { sku: 'ELEC-SB-003', title: 'Portable Bluetooth Speaker', qty: 50, cost: 32.00 },
    { sku: 'CLT-TEE-011', title: 'Classic Cotton Tee (White)', qty: 100, cost: 8.50 },
    { sku: 'FDB-BAR-035', title: 'Energy Bars (Mixed)', qty: 200, cost: 2.50 },
  ],
  history: [
    { date: '2026-07-01', action: 'Order placed', user: 'System' },
    { date: '2026-07-03', action: 'Vendor confirmed', user: 'TechGear Direct' },
    { date: '2026-07-05', action: 'Shipped — ETA 2026-07-15', user: 'Logistics' },
  ],
};

const statusColors: Record<string, 'success' | 'warning' | 'info' | 'error'> = {
  waiting: 'info', ready: 'success', done: 'success', cancelled: 'error',
};

const PurchasingDetail: React.FC = () => {
  const purchaseOrders = useDemoStore((s) => s.purchaseOrders);
  const mockPOData = purchaseOrders[0] || { id: 'PO-0000', vendor: 'Unknown', status: 'waiting', eta: 'N/A', total: 0 };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[#FFFFFF] mb-8">{mockPOData.id}</h1>
      <div className="flex items-center gap-3 mb-8">
        <Badge status={statusColors[mockPOData.status] || 'info'}>
          {mockPOData.status === 'waiting' ? 'Waiting for delivery' : mockPOData.status === 'ready' ? 'Ready to receive' : mockPOData.status === 'done' ? 'Completed' : 'Cancelled'}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-xl font-bold text-[#FFFFFF] mb-4">Order Info</h2>
          <div className="space-y-3 text-[#A0A3AB]">
            <div className="flex justify-between"><span>Vendor:</span><span className="text-[#FFFFFF]">{mockPOData.vendor}</span></div>
            <div className="flex justify-between"><span>ETA:</span><span className="text-[#FFFFFF]">{mockPOData.eta}</span></div>
            <div className="flex justify-between"><span>Total:</span><span className="text-[#C7FB33] font-bold">${mockPOData.total.toLocaleString()}</span></div>
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-bold text-[#FFFFFF] mb-4">Actions</h2>
          <div className="space-y-3">
            {mockPOData.status === 'ready' && (
              <button className="w-full bg-[#C7FB33] text-[#0A0B0E] px-4 py-3 rounded-lg font-medium hover:bg-[#D9FF4A]">
                Receive Shipment
              </button>
            )}
            <button className="w-full bg-[#20232A] text-[#FFFFFF] px-4 py-3 rounded-lg border border-[#373A42] hover:border-[#C7FB33]">
              View Vendor
            </button>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-bold text-[#FFFFFF] mb-4">Line Items</h2>
          <div className="space-y-3">
            {mockPO.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-[#20232A] last:border-0">
                <div>
                  <span className="text-[#FFFFFF] font-medium">{item.sku}</span>
                  <span className="text-[#A0A3AB] ml-2 text-sm">{item.title}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#FFFFFF]">{item.qty} x ${item.cost.toFixed(2)}</span>
                  <span className="text-[#C7FB33] ml-3">${(item.qty * item.cost).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-[#FFFFFF] mb-4">Activity History</h2>
          <div className="space-y-3">
            {mockPO.history.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-[#20232A] last:border-0">
                <div>
                  <span className="text-[#FFFFFF]">{entry.action}</span>
                  <span className="text-[#A0A3AB] ml-2 text-sm">by {entry.user}</span>
                </div>
                <span className="text-[#A0A3AB] text-sm">{entry.date}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PurchasingDetail;
