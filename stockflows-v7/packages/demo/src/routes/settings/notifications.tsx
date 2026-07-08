import React from 'react';
import { Card, Badge } from '@stockflows/ui';

const notificationPreferences = {
  emailAlerts: true,
  pushNotifications: true,
  smsAlerts: false,
  frequency: 'real-time',
  lowStockThreshold: 10,
  outOfStockAlerts: true,
  supplierDelayAlerts: true,
  forecastUpdates: true,
};

const NotificationsPage: React.FC = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-[#FFFFFF] mb-8">Notification Preferences</h1>

    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h2 className="text-xl font-bold text-[#FFFFFF] mb-4">Communication Channels</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-[#0A0B0E] rounded-lg">
            <div>
              <p className="text-[#FFFFFF] font-medium">Email Alerts</p>
              <p className="text-[#A0A3AB] text-sm">Receive inventory updates via email</p>
            </div>
            <Badge status="success">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#0A0B0E] rounded-lg">
            <div>
              <p className="text-[#FFFFFF] font-medium">Push Notifications</p>
              <p className="text-[#A0A3AB] text-sm">Browser-based real-time alerts</p>
            </div>
            <Badge status="success">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#0A0B0E] rounded-lg">
            <div>
              <p className="text-[#FFFFFF] font-medium">SMS Alerts</p>
              <p className="text-[#A0A3AB] text-sm">Critical alerts via text message</p>
            </div>
            <Badge status="error">Disabled</Badge>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-[#FFFFFF] mb-4">Alert Configuration</h2>
        <div className="space-y-3 text-[#A0A3AB]">
          <div className="flex justify-between">
            <span>Alert Frequency:</span>
            <span className="text-[#FFFFFF]">{notificationPreferences.frequency}</span>
          </div>
          <div className="flex justify-between">
            <span>Low Stock Threshold:</span>
            <span className="text-[#FFFFFF]">{notificationPreferences.lowStockThreshold} units</span>
          </div>
          <div className="flex justify-between">
            <span>Out-of-Stock Alerts:</span>
            <Badge status={notificationPreferences.outOfStockAlerts ? 'success' : 'error'}>
              {notificationPreferences.outOfStockAlerts ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Supplier Delay Alerts:</span>
            <Badge status={notificationPreferences.supplierDelayAlerts ? 'success' : 'error'}>
              {notificationPreferences.supplierDelayAlerts ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Forecast Updates:</span>
            <Badge status={notificationPreferences.forecastUpdates ? 'success' : 'error'}>
              {notificationPreferences.forecastUpdates ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  </div>
);

export default NotificationsPage;
