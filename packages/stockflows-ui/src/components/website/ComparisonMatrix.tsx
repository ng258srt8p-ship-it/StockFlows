import React from 'react';

interface ComparisonRowProps {
  feature: string;
  stocky: boolean;
  stockflows: boolean;
}

const ComparisonRow: React.FC<ComparisonRowProps> = ({ feature, stocky, stockflows }) => (
  <div className="flex items-center justify-between py-4 border-b border-[var(--border)]">
    <span className="text-[var(--text-primary)]">{feature}</span>
    <div className="flex gap-8">
      <span className={stocky ? 'text-[var(--success)]' : 'text-[var(--danger)]'}>
        {stocky ? '✓' : '✗'}
      </span>
      <span className={stockflows ? 'text-[var(--accent)]' : 'text-[var(--danger)]'}>
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
    <section className="py-24 bg-[var(--bg-primary)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-[var(--text-primary)] text-center mb-12">
          The Upgrade You Need
        </h2>
        <div className="bg-white border border-[var(--border)] rounded-2xl p-8 shadow-sm">
          <div className="grid grid-cols-3 gap-4 mb-6 pb-4 border-b border-[var(--border)]">
            <span className="text-[var(--text-primary)] font-semibold">Capability</span>
            <span className="text-[var(--danger)] text-center font-medium">Stocky</span>
            <span className="text-[var(--accent)] text-center font-medium">StockFlows</span>
          </div>
          {features.map((f, idx) => (
            <ComparisonRow key={idx} feature={f.name} stocky={f.stocky} stockflows={f.stockflows} />
          ))}
        </div>
      </div>
    </section>
  );
};
