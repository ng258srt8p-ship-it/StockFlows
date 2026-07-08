import React from 'react';

const logos = [
  'Morgan Stanley', 'Chipotle', 'Siemens', 'Fox', 'BMW', 
  'Slack', 'Priceline', 'Bridgewater', 'LVMH', 'ServiceNow'
];

export const CustomerLogos: React.FC = () => {
  return (
    <section className="py-16 bg-[#0A0B0E] border-y-2 border-[#20232A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[#A0A3AB] mb-8">
          Trusted by more than 50% of Fortune 100 companies
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {logos.map((logo, idx) => (
            <div key={idx} className="text-[#6B7280] text-lg font-medium hover:text-[#C7FB33] transition-colors cursor-pointer">
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
