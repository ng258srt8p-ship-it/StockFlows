import React from 'react';
import { Card, Badge } from '@stockflows/ui';
import { useDemoStore } from '../../store/useStore';

const Toggle: React.FC<{ enabled: boolean; onToggle: () => void }> = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
    style={{ backgroundColor: enabled ? 'var(--accent)' : 'var(--border-default)' }}
  >
    <span
      className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
      style={{ transform: enabled ? 'translateX(22px)' : 'translateX(2px)' }}
    />
  </button>
);

export default function NotificationsPage() {
  const { notificationSettings, updateNotificationSettings } = useDemoStore();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Notification Preferences</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Communication Channels</h2>
          <div className="space-y-4">
            {[
              { key: 'emailAlerts' as const, label: 'Email Alerts', desc: 'Receive inventory updates via email' },
              { key: 'pushNotifications' as const, label: 'Push Notifications', desc: 'Browser-based real-time alerts' },
              { key: 'smsAlerts' as const, label: 'SMS Alerts', desc: 'Critical alerts via text message' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-lg">
                <div>
                  <p className="text-[var(--text-primary)] font-medium">{label}</p>
                  <p className="text-[var(--text-secondary)] text-sm">{desc}</p>
                </div>
                <Toggle
                  enabled={notificationSettings[key]}
                  onToggle={() => updateNotificationSettings({ [key]: !notificationSettings[key] })}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Alert Configuration</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Alert Frequency:</span>
              <select
                value={notificationSettings.alertFrequency}
                onChange={(e) => updateNotificationSettings({ alertFrequency: e.target.value as any })}
                className="rounded-lg border px-3 py-1.5 text-sm text-[var(--text-primary)] bg-[var(--bg-primary)] border-[var(--border)]"
              >
                <option value="realtime">Real-time</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Low Stock Threshold:</span>
              <input
                type="number"
                value={notificationSettings.lowStockThreshold}
                onChange={(e) => updateNotificationSettings({ lowStockThreshold: parseInt(e.target.value) || 0 })}
                className="rounded-lg border px-3 py-1.5 text-sm w-20 text-right text-[var(--text-primary)] bg-[var(--bg-primary)] border-[var(--border)]"
              />
            </div>
            {[
              { key: 'outOfStockAlerts' as const, label: 'Out-of-Stock Alerts' },
              { key: 'supplierDelayAlerts' as const, label: 'Supplier Delay Alerts' },
              { key: 'forecastUpdates' as const, label: 'Forecast Updates' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">{label}:</span>
                <Toggle
                  enabled={notificationSettings[key]}
                  onToggle={() => updateNotificationSettings({ [key]: !notificationSettings[key] })}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <button className="px-6 py-2 rounded-lg font-medium text-sm bg-[var(--accent)] text-[var(--bg-primary)]">
          Save Changes
        </button>
      </div>
    </div>
  );
}
