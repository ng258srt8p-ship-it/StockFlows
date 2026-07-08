import React, { useState } from 'react';
import type { NavigationProps } from '../../types';

export const Navigation: React.FC<NavigationProps> = ({
  links = [
    { label: 'Platform', href: '#platform' },
    { label: 'Solutions', href: '#solutions' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Customers', href: '#customers' },
  ],
  dropdowns = [],
  cta = { label: 'Get a Demo', href: '/demo' },
  className = '',
}) => {
  const [active, setActive] = useState<string | null>(null);
  
  return (
    <nav className={`fixed top-0 left-0 right-0 bg-[#0D0E11]/95 backdrop-blur-sm border-b-2 border-[#20232A] z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <span className="text-[#C7FB33] text-xl font-bold">StockFlows</span>
            <div className="hidden md:flex items-center gap-6">
              {links.map((link, index) => (
                <a key={index} href={link.href} className="text-[#A0A3AB] hover:text-[#C7FB33] transition-colors">
                  {link.label}
                </a>
              ))}
              {dropdowns.map((dropdown, index) => (
                <div key={index} className="relative group">
                  <button className="text-[#A0A3AB] hover:text-[#C7FB33] transition-colors flex items-center gap-1">
                    {dropdown.label}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute hidden group-hover:block top-full left-0 mt-2 bg-[#14161B] border border-[#20232A] rounded-lg shadow-lg py-2 min-w-[200px]">
                    {dropdown.items.map((item, idx) => (
                      <a key={idx} href={item.href} className="block px-4 py-2 text-[#A0A3AB] hover:text-[#C7FB33] hover:bg-[#1A1C23]">
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-[#A0A3AB] hover:text-[#FFFFFF] transition-colors">Sign in</button>
            <a href={cta.href} className="bg-[#C7FB33] text-[#0A0B0E] px-4 py-2 rounded-lg font-medium hover:bg-[#D9FF4A] transition-colors inline-block">
              {cta.label}
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};
