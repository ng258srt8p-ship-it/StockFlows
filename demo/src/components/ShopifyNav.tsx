import { Search, ChevronDown, ShoppingBag, ArrowLeftRight } from "lucide-react";

interface ShopifyNavProps {
  view: "landing" | "demo";
  onSetView: (view: "landing" | "demo") => void;
}

export default function ShopifyNav({ view, onSetView }: ShopifyNavProps) {
  return (
    <div className="bg-white text-[var(--text-primary)] h-16 px-6 flex items-center justify-between border-b border-[var(--border)] shrink-0">
      {/* Shopify Brand & Store Selection */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 rounded-lg bg-emerald-600 flex items-center justify-center">
            <ShoppingBag className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold text-[var(--text-primary)] text-xs tracking-tight">shopify</span>
        </div>
        <span className="text-[var(--border)]">|</span>
        <div className="flex items-center gap-1.5 cursor-pointer hover:bg-[var(--bg-secondary)] px-2.5 py-1 rounded-lg">
          <div className="w-5 h-5 bg-[var(--accent)] rounded-full flex items-center justify-center text-[9px] font-bold text-white">
            C
          </div>
          <span className="text-[11px] font-bold text-[var(--text-primary)]">CozyThreads Boutique</span>
          <ChevronDown className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
        </div>
      </div>

      {/* Shopify Search */}
      <div className="hidden md:flex items-center gap-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg px-3 py-1.5 w-96 text-[10px] text-[var(--text-tertiary)] cursor-pointer">
        <Search className="h-3.5 w-3.5" />
        <span>Search products, transfers, orders, and logs...</span>
      </div>

      {/* Shopify Action Buttons */}
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[9px] text-[var(--accent)] bg-[var(--accent-muted)] px-3 py-1 font-bold rounded-full">
          <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse" />
          <span>Active Shopify Link</span>
        </span>

        <button
          onClick={() => onSetView("landing")}
          className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[10px] font-bold px-4 py-2 rounded-lg flex items-center gap-1.5"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          <span>Return to Home</span>
        </button>
      </div>
    </div>
  );
}
