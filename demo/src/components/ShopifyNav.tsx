import { Search, ChevronDown, ShoppingBag, ArrowLeftRight } from "lucide-react";

interface ShopifyNavProps {
  view: "landing" | "demo";
  onSetView: (view: "landing" | "demo") => void;
}

export default function ShopifyNav({ view, onSetView }: ShopifyNavProps) {
  return (
    <div className="bg-[#1A1A1A] text-slate-300 h-16 px-6 flex items-center justify-between border-b border-[#2d2d2d] shrink-0 font-mono">
      {/* Shopify Brand & Store Selection */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 rounded bg-emerald-600 flex items-center justify-center">
            <ShoppingBag className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold text-white text-xs tracking-tight">shopify</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-800 px-2.5 py-1 rounded">
          <div className="w-5 h-5 bg-[#C7FB33] rounded-full flex items-center justify-center text-[9px] font-bold text-black uppercase">
            C
          </div>
          <span className="text-[11px] font-bold text-white uppercase tracking-wider">CozyThreads Boutique</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>

      {/* Shopify Search */}
      <div className="hidden md:flex items-center gap-2 bg-[#2d2d2d] hover:bg-[#3d3d3d] rounded px-3 py-1.5 w-96 text-[10px] text-slate-400 cursor-pointer">
        <Search className="h-3.5 w-3.5" />
        <span>Search products, transfers, orders, and logs...</span>
      </div>

      {/* Shopify Action Buttons */}
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[9px] text-[#C7FB33] bg-[#C7FB33]/10 border border-[#C7FB33]/30 px-3 py-1 font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 bg-[#C7FB33] rounded-full animate-pulse" />
          <span>Active Shopify Link</span>
        </span>

        <button
          onClick={() => onSetView("landing")}
          className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] uppercase font-bold tracking-wider px-4 py-2 rounded flex items-center gap-1.5 border border-slate-700"
        >
          <ArrowLeftRight className="h-3.5 w-3.5 text-[#C7FB33]" />
          <span>Return to Home</span>
        </button>
      </div>
    </div>
  );
}
