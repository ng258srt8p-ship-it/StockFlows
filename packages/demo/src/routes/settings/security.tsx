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

export default function SecurityPage() {
  const { securitySettings, updateSecuritySettings } = useDemoStore();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Security Settings</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Authentication</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-primary)] font-medium">Two-Factor Authentication</p>
                <p className="text-[var(--text-secondary)] text-sm">Add an extra layer of security</p>
              </div>
              <Toggle
                enabled={securitySettings.twoFactorAuth}
                onToggle={() => updateSecuritySettings({ twoFactorAuth: !securitySettings.twoFactorAuth })}
              />
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Last Password Change:</span>
              <span className="text-[var(--text-primary)]">{securitySettings.lastPasswordChange}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Active Sessions:</span>
              <span className="text-[var(--text-primary)]">{securitySettings.activeSessions}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">API Keys</h2>
          <div className="space-y-3">
            {securitySettings.apiKeys.map((key) => (
              <div key={key.id} className="p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[var(--text-primary)] font-medium">{key.name}</span>
                  <Badge status="info">Active</Badge>
                </div>
                <p className="text-[var(--text-secondary)] text-sm">Created: {key.created}</p>
                <p className="text-[var(--text-secondary)] text-sm">Last used: {key.lastUsed}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="md:col-span-2">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Security Recommendations</h2>
          <div className="space-y-3 text-[var(--text-secondary)]">
            <div className="flex items-start gap-2">
              <span className="text-[var(--text-primary)]">✓</span>
              <span>Two-factor authentication is enabled — keep it that way</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--text-primary)]">✓</span>
              <span>Session management is within safe limits</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--text-primary)]">!</span>
              <span>Consider rotating API keys every 90 days</span>
            </div>
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
