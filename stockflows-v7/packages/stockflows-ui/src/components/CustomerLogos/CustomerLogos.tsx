import React from "react";
import type { CustomerLogosProps } from "../../types";

export const CustomerLogos: React.FC<CustomerLogosProps> = ({
  logos,
  heading = "Trusted by more than 50% of Fortune 100 companies",
  className = "",
}) => {
  return (
    <section className={`py-24 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-12">{heading}</h2>
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee gap-12 items-center">
            {[...logos, ...logos].map((logo, index) => (
              <div key={index} className="flex-shrink-0 w-32 h-16 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg flex items-center justify-center">
                <span className="text-[var(--text-secondary)] text-xs font-medium">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
