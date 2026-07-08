import React from 'react';
import { Card, Badge } from '@stockflows/ui';

const securitySettings = {
  twoFactorEnabled: true,
  lastPasswordChange: 'June 15, 2026',
  activeSessions: 2,
  maxSessions: 5,
  apiKeys: [
    { id: 'key-001', name: 'Production API', created: 'January 1, 2026', lastUsed: '2 hours ago' },
    { id: 'key-002', name: 'Development API', created: 'March 15, 2026', lastUsed: '1 day ago' },
  ],
};

const SecurityPage: React.FC = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Security Settings</h1>

    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Authentication</h2>
        <div className="space-y-3 text-[var(--text-secondary)]">
          <div className="flex justify-between">
            <span>Two-Factor Authentication:</span>
            <Badge status={securitySettings.twoFactorEnabled ? 'success' : 'error'}>
              {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Last Password Change:</span>
            <span className="text-[var(--text-primary)]">{securitySettings.lastPasswordChange}</span>
          </div>
          <div className="flex justify-between">
            <span>Active Sessions:</span>
            <span className="text-[var(--text-primary)]">{securitySettings.activeSessions} / {securitySettings.maxSessions}</span>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">API Keys</h2>
        <div className="space-y-3">
          {securitySettings.apiKeys.map(key => (
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
  </div>
);

export default SecurityPage;
