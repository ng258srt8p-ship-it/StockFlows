import React from 'react';
import { Card, Badge } from '@stockflows/ui';

const billingInfo = {
  plan: 'Professional',
  billingCycle: 'Monthly',
  nextBillingDate: 'August 7, 2026',
  amount: '$49.00',
  paymentMethod: 'Visa ending in 4242',
  usageStats: {
    skuCount: 47,
    maxSkus: 100,
    orderCount: 234,
    maxOrders: 500,
    apiCalls: 1250,
    maxApiCalls: 5000,
  },
  invoices: [
    { id: 'INV-001', date: 'July 7, 2026', amount: '$49.00', status: 'paid' },
    { id: 'INV-002', date: 'June 7, 2026', amount: '$49.00', status: 'paid' },
    { id: 'INV-003', date: 'May 7, 2026', amount: '$49.00', status: 'paid' },
  ],
};

const BillingPage: React.FC = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-[#FFFFFF] mb-8">Billing & Plans</h1>

    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h2 className="text-xl font-bold text-[#FFFFFF] mb-4">Current Plan</h2>
        <div className="space-y-3 text-[#A0A3AB]">
          <div className="flex justify-between">
            <span>Plan:</span>
            <Badge status="success">{billingInfo.plan}</Badge>
          </div>
          <div className="flex justify-between">
            <span>Billing Cycle:</span>
            <span className="text-[#FFFFFF]">{billingInfo.billingCycle}</span>
          </div>
          <div className="flex justify-between">
            <span>Next Billing:</span>
            <span className="text-[#FFFFFF]">{billingInfo.nextBillingDate}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="text-[#FFFFFF] font-semibold">{billingInfo.amount}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span className="text-[#FFFFFF]">{billingInfo.paymentMethod}</span>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-[#FFFFFF] mb-4">Usage Statistics</h2>
        <div className="space-y-3 text-[#A0A3AB]">
          <div className="flex justify-between">
            <span>SKUs Used:</span>
            <span className="text-[#FFFFFF]">{billingInfo.usageStats.skuCount} / {billingInfo.usageStats.maxSkus}</span>
          </div>
          <div className="flex justify-between">
            <span>Orders This Period:</span>
            <span className="text-[#FFFFFF]">{billingInfo.usageStats.orderCount} / {billingInfo.usageStats.maxOrders}</span>
          </div>
          <div className="flex justify-between">
            <span>API Calls:</span>
            <span className="text-[#FFFFFF]">{billingInfo.usageStats.apiCalls} / {billingInfo.usageStats.maxApiCalls}</span>
          </div>
        </div>
      </Card>

      <Card className="md:col-span-2">
        <h2 className="text-xl font-bold text-[#FFFFFF] mb-4">Invoice History</h2>
        <div className="space-y-3">
          {billingInfo.invoices.map(invoice => (
            <div key={invoice.id} className="flex items-center justify-between p-3 bg-[#0A0B0E] rounded-lg">
              <div>
                <span className="text-[#FFFFFF] font-medium">{invoice.id}</span>
                <span className="text-[#A0A3AB] text-sm ml-2">{invoice.date}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#FFFFFF]">{invoice.amount}</span>
                <Badge status={invoice.status === 'paid' ? 'success' : 'error'}>
                  {invoice.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

export default BillingPage;
