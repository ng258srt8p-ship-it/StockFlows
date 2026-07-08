import React from 'react';
import { Card, Badge } from '@stockflows/ui';

const PreviewSettings: React.FC = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-[#FFFFFF] mb-8">Preview: Settings</h1>
    <Card>
      <div className="space-y-4 text-[#A0A3AB]">
        <div className="flex justify-between"><span>Store:</span><span className="text-[#FFFFFF]">StockFlows Demo</span></div>
        <div className="flex justify-between"><span>Theme:</span><Badge status="success">Dark (#0A0B0E)</Badge></div>
        <div className="flex justify-between"><span>Language:</span><span className="text-[#FFFFFF]">English (US)</span></div>
        <div className="flex justify-between"><span>Timezone:</span><span className="text-[#FFFFFF]">America/New_York (UTC-4)</span></div>
        <div className="flex justify-between"><span>Currency:</span><span className="text-[#FFFFFF]">USD ($)</span></div>
        <div className="flex justify-between"><span>Demo Mode:</span><Badge status="info">Active — no real changes</Badge></div>
      </div>
    </Card>
  </div>
);

export default PreviewSettings;
