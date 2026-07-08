import React from 'react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  preview?: React.ReactNode;
}

export const FeatureCards: React.FC<{ features: FeatureCardProps[] }> = ({ features }) => {
  return (
    <section className="py-24 bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 stagger-children">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group bg-white border border-[var(--border)] rounded-2xl p-8 hover:border-[var(--accent)] hover:shadow-lg transition-all duration-300"
            >
              <span className="material-symbols-outlined text-4xl text-[var(--accent)] mb-4">
                {feature.icon}
              </span>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{feature.title}</h3>
              <p className="text-[var(--text-secondary)] mb-6">{feature.description}</p>
              {feature.preview && (
                <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4">
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
