import React from 'react';

interface FeatureItem {
  title: string;
  description: string;
  image: string;
  alt: string;
}

interface FeatureShowcaseProps {
  features: FeatureItem[];
  className?: string;
}

export const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({
  features,
  className = '',
}) => {
  return (
    <section className={`py-24 bg-[var(--bg-secondary)] ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-4 animate-fade-in-up">
            See StockFlows in Action
          </h2>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Real screenshots from the app — no mockups, no renderings
          </p>
        </div>
        <div className="space-y-24">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } gap-12 items-center`}
            >
              <div className="flex-1 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                  {feature.title}
                </h3>
                <p className="text-lg text-[var(--text-secondary)]">
                  {feature.description}
                </p>
              </div>
              <div className="flex-1 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                <div className="rounded-2xl border border-[var(--border)] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <img
                    src={feature.image}
                    alt={feature.alt}
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
