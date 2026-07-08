import React from 'react';

interface ComparisonRowProps {
  feature: string;
  stocky: boolean;
  stockflows: boolean;
}

const ComparisonRow: React.FC<ComparisonRowProps> = ({ feature, stocky, stockflows }) => (
  <div className="flex items-center justify-between py-4 border-b border-[#20232A]">
    <span className="text-[#FFFFFF]">{feature}</span>
    <div className="flex gap-8">
      <span className={stocky ? 'text-[#10B981]' : 'text-[#EF4444]'}>
        {stocky ? '✓' : '✗'}
      </span>
      <span className={stockflows ? 'text-[#C7FB33]' : 'text-[#EF4444]'}>
        {stockflows ? '✓' : '✗'}
      </span>
    </div>
  </div>
);

export const ComparisonMatrix: React.FC = () => {
  const features = [
    { name: 'Stock Transfers', stocky: true, stockflows: true },
    { name: 'Audit Ledger', stocky: false, stockflows: true },
    { name: 'Forecasting Model', stocky: true, stockflows: true },
    { name: 'Supplier CSV Importer', stocky: true, stockflows: true },
    { name: 'Multi-Location Sync', stocky: false, stockflows: true },
  ];
  
  return (
    <section className="py-24 bg-[#14161B]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-[#FFFFFF] text-center mb-12">
          The Upgrade You Need
        </h2>
        <div className="bg-[#0A0B0E] border-2 border-[#20232A] rounded-lg p-8">
          <div className="grid grid-cols-3 gap-4 mb-6 pb-4 border-b border-[#20232A]">
            <span className="text-[#FFFFFF] font-semibold">Capability</span>
            <span className="text-[#EF4444] text-center">Stocky</span>
            <span className="text-[#C7FB33] text-center">StockFlows</span>
          </div>
          {features.map((f, idx) => (
            <ComparisonRow key={idx} feature={f.name} stocky={f.stocky} stockflows={f.stockflows} />
          ))}
        </div>
      </div>
    </section>
  );
};
