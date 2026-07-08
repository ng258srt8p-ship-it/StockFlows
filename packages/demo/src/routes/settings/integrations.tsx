import React from 'react';
import { Card, Badge } from '@stockflows/ui';
import { useDemoStore } from '../../store/useStore';

const IntegrationsPage: React.FC = () => {
  const { integrations, toggleIntegration } = useDemoStore();
  const connectedCount = integrations.filter((i) => i.connected).length;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[#FFFFFF] mb-8">Integrations Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-bold text-[#FFFFFF] mb-4">Connected Services</h2>
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="p-4 bg-[#0A0B0E] rounded-lg border border-[#20232A]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#FFFFFF] font-medium">{integration.name}</span>
                  <button
                    onClick={() => toggleIntegration(integration.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      integration.connected
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/30'
                    }`}
                  >
                    {integration.connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
                <p className="text-[#A0A3AB] text-sm">
                  Status: <Badge status={integration.connected ? 'success' : 'error'}>{integration.connected ? 'Connected' : 'Disconnected'}</Badge>
                </p>
                <p className="text-[#A0A3AB] text-sm">Last sync: {integration.lastSync}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-[#FFFFFF] mb-4">Sync Status</h2>
          <div className="space-y-3 text-[#A0A3AB]">
            <div className="flex justify-between">
              <span>Total Connected:</span>
              <span className="text-[#FFFFFF]">{connectedCount} of {integrations.length} services</span>
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
          <div className="mt-4">
            <button className="w-full px-4 py-2 rounded-lg font-medium text-sm bg-[var(--accent)] text-[var(--bg-primary)]">
              Sync Now
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default IntegrationsPage;
