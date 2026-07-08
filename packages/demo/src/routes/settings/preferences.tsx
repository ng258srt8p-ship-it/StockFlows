import React from 'react';
import { Card } from '@stockflows/ui';
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

export default function PreferencesPage() {
  const { userPreferences, updateUserPreferences } = useDemoStore();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">User Preferences</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Display Settings</h2>
          <div className="space-y-4">
            {[
              { key: 'language' as const, label: 'Language', options: ['English', 'Spanish', 'French', 'German'] },
              { key: 'timezone' as const, label: 'Timezone', options: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'UTC'] },
              { key: 'currency' as const, label: 'Currency', options: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] },
              { key: 'theme' as const, label: 'Theme', options: ['dark', 'light', 'system'] },
              { key: 'dateFormat' as const, label: 'Date Format', options: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] },
              { key: 'timeFormat' as const, label: 'Time Format', options: ['12h', '24h'] },
            ].map(({ key, label, options }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">{label}:</span>
                <select
                  value={userPreferences[key]}
                  onChange={(e) => updateUserPreferences({ [key]: e.target.value })}
                  className="rounded-lg border px-3 py-1.5 text-sm text-[var(--text-primary)] bg-[var(--bg-primary)] border-[var(--border)]"
                >
                  {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">System Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Notifications:</span>
              <Toggle
                enabled={userPreferences.notifications}
                onToggle={() => updateUserPreferences({ notifications: !userPreferences.notifications })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Auto-Save:</span>
              <Toggle
                enabled={userPreferences.autoSave}
                onToggle={() => updateUserPreferences({ autoSave: !userPreferences.autoSave })}
              />
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
