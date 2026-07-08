import React, { useState } from 'react';
import { Card, Badge } from '@stockflows/ui';
import { useDemoStore } from '../../../store/useStore';

const VendorsIndex: React.FC = () => {
  const vendors = useDemoStore((s) => s.vendors);
  const purchaseOrders = useDemoStore((s) => s.purchaseOrders);
  const [searchText, setSearchText] = useState('');

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(searchText.toLowerCase()) ||
    v.category.toLowerCase().includes(searchText.toLowerCase())
  );

  const getVendorsWithActivePOs = () => {
    const activeVendorNames = new Set(
      purchaseOrders.filter(po => po.status === 'waiting' || po.status === 'ready').map(po => po.vendor)
    );
    return activeVendorNames;
  };

  const activeVendors = getVendorsWithActivePOs();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#FFFFFF]">Vendors ({vendors.length})</h1>
        <button className="bg-[#C7FB33] text-[#0A0B0E] px-4 py-2 rounded-lg font-medium">
          Add Vendor
        </button>
      </div>

      <Card className="mb-6">
        <input
          type="text"
          placeholder="Search vendors..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="w-full bg-[#0A0B0E] border-2 border-[#20232A] rounded-lg px-4 py-3 text-[#FFFFFF] focus:border-[#C7FB33]"
        />
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map(vendor => (
          <Card key={vendor.id} className="hover:border-[#C7FB33] transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-[#FFFFFF]">{vendor.name}</h2>
                <span className="text-[#A0A3AB] text-sm">{vendor.contact}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge status="info">{vendor.category}</Badge>
                {activeVendors.has(vendor.name) && (
                  <Badge status="warning">Active POs</Badge>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <span className="text-[#A0A3AB] text-sm">Lead Time</span>
                <div className="text-[#FFFFFF] font-medium">{vendor.leadTime}d</div>
              </div>
              <div>
                <span className="text-[#A0A3AB] text-sm">On-Time</span>
                <div className="text-[#C7FB33] font-medium">{vendor.onTimeDelivery}%</div>
              </div>
              <div>
                <span className="text-[#A0A3AB] text-sm">Quality</span>
                <div className="text-[#C7FB33] font-medium">{vendor.qualityScore}%</div>
              </div>
              <div>
                <span className="text-[#A0A3AB] text-sm">Total POs</span>
                <div className="text-[#FFFFFF] font-medium">{vendor.totalOrders}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VendorsIndex;
