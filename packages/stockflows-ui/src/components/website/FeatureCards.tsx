import React from 'react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  preview?: React.ReactNode;
}

export const FeatureCards: React.FC<{ features: FeatureCardProps[] }> = ({ features }) => {
  return (
    <section className="py-24 bg-[#0A0B0E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group bg-[#14161B] border-2 border-[#20232A] rounded-lg p-8 hover:border-[#C7FB33] transition-all duration-300"
            >
              <span className="material-symbols-outlined text-4xl text-[#C7FB33] mb-4">
                {feature.icon}
              </span>
              <h3 className="text-xl font-bold text-[#FFFFFF] mb-3">{feature.title}</h3>
              <p className="text-[#A0A3AB] mb-6">{feature.description}</p>
              {feature.preview && (
                <div className="bg-[#0A0B0E] border border-[#20232A] rounded p-4">
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
