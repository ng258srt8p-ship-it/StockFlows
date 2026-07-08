import React from "react";
import type { FeatureCardsProps } from "../../types";

export const FeatureCards: React.FC<FeatureCardsProps> = ({
  features,
  className = "",
}) => {
  return (
    <section className={`py-24 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-lg p-6 hover:border-[var(--accent)] transition-all duration-150 group"
            >
              <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[var(--accent)]/20 transition-colors">
                <span className="material-symbols-outlined text-[var(--accent)] text-2xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">{feature.title}</h3>
              <p className="text-[var(--text-secondary)] mb-4">{feature.description}</p>
              {feature.preview && (
                <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded p-3 text-xs font-mono text-[var(--accent)] overflow-x-auto whitespace-pre">
                  {feature.preview}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
