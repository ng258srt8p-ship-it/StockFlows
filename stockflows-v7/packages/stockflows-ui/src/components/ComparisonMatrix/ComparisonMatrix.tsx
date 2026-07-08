import React from "react";
import type { ComparisonMatrixProps } from "../../types";

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
  rows,
  className = "",
}) => {
  return (
    <section className={`py-24 bg-[var(--bg-secondary)] ${className}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-[var(--text-primary)] text-center mb-12">
          Stocky vs StockFlows
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full bg-[var(--bg-primary)] border-2 border-[var(--border)] rounded-lg">
            <thead>
              <tr className="border-b-2 border-[var(--border)]">
                <th className="px-6 py-4 text-left text-[var(--text-secondary)] font-medium">Capability</th>
                <th className="px-6 py-4 text-center text-[var(--danger)] font-medium">Stocky</th>
                <th className="px-6 py-4 text-center text-[var(--accent)] font-medium">StockFlows</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-b border-[var(--border)] hover:bg-[var(--bg-secondary)]/50">
                  <td className="px-6 py-4 text-[var(--text-primary)]">{row.capability}</td>
                  <td className="px-6 py-4 text-center">
                    {row.stocky === "Sunsetting" ? (
                      <span className="text-[var(--danger)]">×</span>
                    ) : (
                      <span className="text-[var(--warning)]">~</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[var(--success)]">✓</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
