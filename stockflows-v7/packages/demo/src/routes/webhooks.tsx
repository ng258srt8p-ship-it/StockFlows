import React from 'react';
import { Card, Badge } from '@stockflows/ui';

const mockWebhooks = [
  { id: 'WH-001', event: 'orders/create', shop: 'stockflows2.myshopify.com', status: 'processed' as const, received: '2026-07-06 14:32', data: { orderId: '5849201', total: 127.50 } },
  { id: 'WH-002', event: 'inventory_levels/update', shop: 'stockflows2.myshopify.com', status: 'processed' as const, received: '2026-07-06 14:30', data: { sku: 'SKU-SW-078', available: 153 } },
  { id: 'WH-003', event: 'products/update', shop: 'stockflows2.myshopify.com', status: 'failed' as const, received: '2026-07-06 12:15', data: { productId: 'gku-sy8q3m-k92d', error: 'Rate limited' } },
  { id: 'WH-004', event: 'orders/create', shop: 'stockflows2.myshopify.com', status: 'pending' as const, received: '2026-07-06 15:01', data: { orderId: '5849202', total: 89.99 } },
  { id: 'WH-005', event: 'inventory_levels/update', shop: 'stockflows2.myshopify.com', status: 'processed' as const, received: '2026-07-06 11:45', data: { sku: 'SKU-SW-045', available: 12 } },
];

const WebhookLog: React.FC = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-[#FFFFFF] mb-8">Webhook Log</h1>

    <Card>
      <div className="space-y-4">
        {mockWebhooks.map(wh => (
          <div key={wh.id} className="py-4 border-b border-[#20232A] last:border-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Badge status={wh.status === 'processed' ? 'success' : wh.status === 'failed' ? 'error' : 'warning'}>
                  {wh.status}
                </Badge>
                <span className="text-[#FFFFFF] font-medium">{wh.event}</span>
              </div>
              <span className="text-[#A0A3AB] text-sm">{wh.received}</span>
            </div>
            <div className="text-[#A0A3AB] text-sm">
              <span>Shop: {wh.shop}</span>
              <span className="ml-4">ID: {wh.id}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

export default WebhookLog;
