import React from 'react';
import { Card, Badge } from '@stockflows/ui';

const settings = {
  shop: { name: 'StockFlows Demo Store', plan: 'Professional', billingCycle: 'Monthly' },
  notifications: { emailAlerts: true, slackIntegration: true, smsAlerts: false },
  aiFeatures: { forecasting: true, autoReorder: false, demandAlerts: true },
};

const SettingsPage: React.FC = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Settings (Read-Only — Demo Mode)</h1>

    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Shop Configuration</h2>
        <div className="space-y-3 text-[var(--text-secondary)]">
          <div className="flex justify-between"><span>Store:</span><span className="text-[var(--text-primary)]">{settings.shop.name}</span></div>
          <div className="flex justify-between"><span>Plan:</span><Badge status="success">{settings.shop.plan}</Badge></div>
          <div className="flex justify-between"><span>Billing:</span><span className="text-[var(--text-primary)]">{settings.shop.billingCycle}</span></div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Notifications</h2>
        <div className="space-y-3 text-[var(--text-secondary)]">
          <div className="flex justify-between"><span>Email Alerts:</span><Badge status={settings.notifications.emailAlerts ? 'success' : 'error'}>{settings.notifications.emailAlerts ? 'Enabled' : 'Disabled'}</Badge></div>
          <div className="flex justify-between"><span>Slack Integration:</span><Badge status={settings.notifications.slackIntegration ? 'success' : 'error'}>{settings.notifications.slackIntegration ? 'Connected' : 'Not Connected'}</Badge></div>
          <div className="flex justify-between"><span>SMS Alerts:</span><Badge status={settings.notifications.smsAlerts ? 'success' : 'error'}>{settings.notifications.smsAlerts ? 'Enabled' : 'Disabled'}</Badge></div>
        </div>
      </Card>

      <Card className="md:col-span-2">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">AI Features</h2>
        <div className="space-y-3 text-[var(--text-secondary)]">
          <div className="flex justify-between"><span>Forecasting Engine:</span><Badge status={settings.aiFeatures.forecasting ? 'success' : 'error'}>{settings.aiFeatures.forecasting ? 'Active' : 'Inactive'}</Badge></div>
          <div className="flex justify-between"><span>Auto-Reorder:</span><Badge status={settings.aiFeatures.autoReorder ? 'success' : 'error'}>{settings.aiFeatures.autoReorder ? 'Active' : 'Inactive'}</Badge></div>
          <div className="flex justify-between"><span>Demand Alerts:</span><Badge status={settings.aiFeatures.demandAlerts ? 'success' : 'error'}>{settings.aiFeatures.demandAlerts ? 'Active' : 'Inactive'}</Badge></div>
        </div>
      </Card>
    </div>
  </div>
);

export default SettingsPage;
