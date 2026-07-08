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
    <aside className="w-full md:w-60 bg-white border-r border-[var(--border)] flex flex-col shrink-0 text-sm">
      {/* Shopify Standard Admin Links */}
      <div className="p-4 space-y-1 border-b border-[var(--border)]">
        <div className="text-xs text-[var(--text-tertiary)] font-medium px-2 mb-2">
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
            className="flex items-center justify-between px-2 py-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] cursor-pointer rounded-lg"
          >
            <span>{item.name}</span>
            {item.badge && (
              <span className="text-[9px] bg-[var(--accent-muted)] text-[var(--accent)] px-1.5 py-0.5 rounded-full font-bold">
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* StockFlows App Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="text-xs text-[var(--text-tertiary)] font-medium px-2 mb-3 flex items-center justify-between">
            <span>Active Apps</span>
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
          </div>

          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = demoTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSetDemoTab(tab.id)}
                className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 transition-all font-medium rounded-lg ${
                  isActive
                    ? "bg-[var(--accent-muted)] text-[var(--accent)] border-l-4 border-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Simulated App Version Info */}
        <div className="bg-[var(--bg-secondary)] p-4 space-y-2 mt-4 text-xs text-[var(--text-secondary)] border border-[var(--border)] rounded-lg">
          <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
            <ShieldCheck className="h-4 w-4 text-[var(--success)]" />
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
