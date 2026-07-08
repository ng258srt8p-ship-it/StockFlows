import React from 'react';
import { Card, Badge } from '@stockflows/ui';

const integrations = {
  shopify: { connected: true, storeName: 'StockFlows Demo Store', lastSync: '2 hours ago' },
  shipping: { connected: true, provider: 'ShipStation', apiStatus: 'Active' },
  accounting: { connected: false, provider: 'QuickBooks', syncStatus: 'Not Configured' },
  ecommerce: { connected: true, platform: 'WooCommerce', productsSynced: 47 },
};

const IntegrationsPage: React.FC = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-[#FFFFFF] mb-8">Integrations Dashboard</h1>

    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h2 className="text-xl font-bold text-[#FFFFFF] mb-4">Connected Services</h2>
        <div className="space-y-4">
          <div className="p-4 bg-[#0A0B0E] rounded-lg border border-[#20232A]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#FFFFFF] font-medium">Shopify</span>
              <Badge status="success">Connected</Badge>
            </div>
            <p className="text-[#A0A3AB] text-sm">Store: {integrations.shopify.storeName}</p>
            <p className="text-[#A0A3AB] text-sm">Last sync: {integrations.shopify.lastSync}</p>
          </div>
          <div className="p-4 bg-[#0A0B0E] rounded-lg border border-[#20232A]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#FFFFFF] font-medium">Shipping</span>
              <Badge status="success">{integrations.shipping.apiStatus}</Badge>
            </div>
            <p className="text-[#A0A3AB] text-sm">Provider: {integrations.shipping.provider}</p>
          </div>
          <div className="p-4 bg-[#0A0B0E] rounded-lg border border-[#20232A]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#FFFFFF] font-medium">Accounting</span>
              <Badge status="error">{integrations.accounting.syncStatus}</Badge>
            </div>
            <p className="text-[#A0A3AB] text-sm">Provider: {integrations.accounting.provider}</p>
          </div>
          <div className="p-4 bg-[#0A0B0E] rounded-lg border border-[#20232A]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#FFFFFF] font-medium">E-commerce</span>
              <Badge status="success">Synced</Badge>
            </div>
            <p className="text-[#A0A3AB] text-sm">Platform: {integrations.ecommerce.platform}</p>
            <p className="text-[#A0A3AB] text-sm">Products synced: {integrations.ecommerce.productsSynced}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-[#FFFFFF] mb-4">Sync Status</h2>
        <div className="space-y-3 text-[#A0A3AB]">
          <div className="flex justify-between">
            <span>Total Connected:</span>
            <span className="text-[#FFFFFF]">3 of 4 services</span>
          </div>
          <div className="flex justify-between">
            <span>Last Full Sync:</span>
            <span className="text-[#FFFFFF]">Today, 2:30 PM</span>
          </div>
          <div className="flex justify-between">
            <span>Pending Syncs:</span>
            <span className="text-[#FFFFFF]">12 items</span>
          </div>
        </div>
      </Card>
    </div>
  </div>
);

export default IntegrationsPage;
