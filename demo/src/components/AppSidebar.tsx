import type { DemoTab } from "../data/demoData";
import { Layers, ArrowLeftRight, TrendingUp, RefreshCw, Barcode, Sparkles, ShieldCheck } from "lucide-react";

interface AppSidebarProps {
  demoTab: DemoTab;
  onSetDemoTab: (tab: DemoTab) => void;
}

const tabs: { id: DemoTab; label: string; icon: typeof Layers }[] = [
  { id: "dashboard", label: "Ledger Dashboard", icon: Layers },
  { id: "transfers", label: "Stock Transfers", icon: ArrowLeftRight },
  { id: "replenishment", label: "PO Replenishment", icon: TrendingUp },
  { id: "stocky", label: "Stocky Import Tool", icon: RefreshCw },
  { id: "barcode", label: "Barcode Scanning", icon: Barcode },
];

export default function AppSidebar({ demoTab, onSetDemoTab }: AppSidebarProps) {
  return (
    <aside className="w-full md:w-60 bg-[#F3F4F6] border-r border-[#D1D5DB] flex flex-col shrink-0 font-mono text-[11px]">
      {/* Shopify Standard Admin Links */}
      <div className="p-4 space-y-1 border-b border-[#E5E7EB]">
        <div className="text-[9px] text-slate-400 uppercase tracking-widest px-2 font-bold mb-2">
          Shopify Admin
        </div>
        {[
          { name: "Home", active: false },
          { name: "Orders", active: false, badge: "3" },
          { name: "Products", active: false },
          { name: "Customers", active: false },
          { name: "Finances", active: false },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between px-2 py-1.5 text-slate-600 hover:bg-[#E5E7EB] cursor-pointer"
          >
            <span className="uppercase font-bold tracking-wider">{item.name}</span>
            {item.badge && (
              <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded-full font-bold">
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* StockFlows App Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="text-[9px] text-slate-400 uppercase tracking-widest px-2 font-bold mb-3 flex items-center justify-between">
            <span>Active Apps</span>
            <Sparkles className="h-3.5 w-3.5 text-[#C7FB33]" />
          </div>

          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = demoTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSetDemoTab(tab.id)}
                className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 transition-all uppercase tracking-wider font-bold ${
                  isActive
                    ? "bg-slate-900 text-[#C7FB33] border-l-4 border-[#C7FB33]"
                    : "text-slate-700 hover:bg-[#E5E7EB] hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-[#C7FB33]" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Simulated App Version Info */}
        <div className="bg-[#E5E7EB] p-4 space-y-2 mt-4 text-[10px] text-slate-600 border border-[#D1D5DB]">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>StockFlows v1.8</span>
          </div>
          <p className="leading-relaxed">
            This workspace emulates the direct Shopify app experience.
          </p>
        </div>
      </div>
    </aside>
  );
}
