import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#14161B] border-t-2 border-[#20232A] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <span className="text-[#C7FB33] text-xl font-bold mb-4 block">StockFlows</span>
            <p className="text-[#A0A3AB]">Inventory management for modern retailers.</p>
          </div>
          <div>
            <h4 className="text-[#FFFFFF] font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-[#A0A3AB]">
              <li><a href="#" className="hover:text-[#C7FB33]">Features</a></li>
              <li><a href="#" className="hover:text-[#C7FB33]">Pricing</a></li>
              <li><a href="#" className="hover:text-[#C7FB33]">Demo</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#FFFFFF] font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-[#A0A3AB]">
              <li><a href="#" className="hover:text-[#C7FB33]">About</a></li>
              <li><a href="#" className="hover:text-[#C7FB33]">Blog</a></li>
              <li><a href="#" className="hover:text-[#C7FB33]">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#FFFFFF] font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-[#A0A3AB]">
              <li><a href="#" className="hover:text-[#C7FB33]">Privacy</a></li>
              <li><a href="#" className="hover:text-[#C7FB33]">Terms</a></li>
              <li><a href="#" className="hover:text-[#C7FB33]">Support</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-[#20232A] text-center text-[#6B7280]">
          <p>© 2026 StockFlows. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
