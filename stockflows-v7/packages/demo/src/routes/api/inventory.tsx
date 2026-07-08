import React from 'react';
import { Card, Badge } from '@stockflows/ui';

const apiInventory: React.FC = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-[#FFFFFF] mb-8">API: Inventory</h1>
    <Card>
      <p className="text-[#A0A3AB] mb-4">Demo mode — API endpoint information:</p>
      <div className="bg-[#0A0B0E] p-4 rounded-lg font-mono text-sm text-[#C7FB33]">
        <p>GET /api/inventory</p>
        <p className="mt-2 text-[#A0A3AB]">// Returns current stock levels for all SKUs</p>
        <p className="text-[#10B981]">Status: 200 OK — Demo mode</p>
      </div>
    </Card>
  </div>
);

export default apiInventory;
