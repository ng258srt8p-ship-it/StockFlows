import React from 'react';
import { Card, Badge } from '@stockflows/ui';

const userPreferences = {
  language: 'English',
  timezone: 'America/New_York',
  currency: 'USD',
  theme: 'dark',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  notifications: true,
  autoSave: true,
};

const PreferencesPage: React.FC = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">User Preferences</h1>

    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Display Settings</h2>
        <div className="space-y-3 text-[var(--text-secondary)]">
          <div className="flex justify-between">
            <span>Language:</span>
            <span className="text-[var(--text-primary)]">{userPreferences.language}</span>
          </div>
          <div className="flex justify-between">
            <span>Timezone:</span>
            <span className="text-[var(--text-primary)]">{userPreferences.timezone}</span>
          </div>
          <div className="flex justify-between">
            <span>Currency:</span>
            <Badge status="info">{userPreferences.currency}</Badge>
          </div>
          <div className="flex justify-between">
            <span>Theme:</span>
            <Badge status={userPreferences.theme === 'dark' ? 'success' : 'info'}>
              {userPreferences.theme}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Date Format:</span>
            <span className="text-[var(--text-primary)]">{userPreferences.dateFormat}</span>
          </div>
          <div className="flex justify-between">
            <span>Time Format:</span>
            <span className="text-[var(--text-primary)]">{userPreferences.timeFormat}</span>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">System Preferences</h2>
        <div className="space-y-3 text-[var(--text-secondary)]">
          <div className="flex justify-between">
            <span>Notifications:</span>
            <Badge status={userPreferences.notifications ? 'success' : 'error'}>
              {userPreferences.notifications ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Auto-Save:</span>
            <Badge status={userPreferences.autoSave ? 'success' : 'error'}>
              {userPreferences.autoSave ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  </div>
);

export default PreferencesPage;
