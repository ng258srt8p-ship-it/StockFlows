import type { SKUItem, TransferDoc, MigrationStatus } from "../data/demoData";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Search,
  Barcode,
  Plus,
  Trash2,
  ChevronRight,
  Boxes,
  ArrowLeftRight,
  Layers,
} from "lucide-react";

interface LedgerDashboardProps {
  skus: SKUItem[];
  transfers: TransferDoc[];
  selectedSku: SKUItem | null;
  skuSearch: string;
  migrationStatus: MigrationStatus;
  onSetSkus: (skus: SKUItem[] | ((prev: SKUItem[]) => SKUItem[])) => void;
  onSetSelectedSku: (sku: SKUItem | null) => void;
  onSetSkuSearch: (search: string) => void;
  onSetDemoTab: (tab: "dashboard" | "transfers" | "replenishment" | "stocky" | "barcode") => void;
  onSetScannedCode: (code: string) => void;
  onTriggerToast: (message: string, type?: "success" | "info") => void;
}

export default function LedgerDashboard({
  skus,
  transfers,
  selectedSku,
  skuSearch,
  migrationStatus,
  onSetSkus,
  onSetSelectedSku,
  onSetSkuSearch,
  onSetDemoTab,
  onSetScannedCode,
  onTriggerToast,
}: LedgerDashboardProps) {
  const filteredSkus = skus.filter(
    (s) =>
      s.name.toLowerCase().includes(skuSearch.toLowerCase()) ||
      s.sku.toLowerCase().includes(skuSearch.toLowerCase()) ||
      s.supplier.toLowerCase().includes(skuSearch.toLowerCase())
  );

  const outOfRiskSkus = skus.filter((s) => s.onHand <= s.minStock).length;

  return (
    <div className="space-y-6">
      {/* Key Stats Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="border border-[#E5E7EB] bg-[#f8f9fa] p-4 space-y-1">
          <div className="text-[#8A8D93] uppercase font-bold tracking-wider">Total Stock Value</div>
          <div className="text-2xl font-black text-slate-900">$24,930</div>
          <div className="text-[10px] text-emerald-600 flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" />
            Integrated with Shopify POS
          </div>
        </div>

        <div className="border border-[#E5E7EB] bg-[#f8f9fa] p-4 space-y-1">
          <div className="text-[#8A8D93] uppercase font-bold tracking-wider">Out-of-Stock Risk SKUs</div>
          <div className="text-2xl font-black text-amber-600">{outOfRiskSkus} SKUs</div>
          <div className="text-[10px] text-amber-700 font-bold uppercase">Sweater and Jacket need replenishment</div>
        </div>

        <div className="border border-[#E5E7EB] bg-[#f8f9fa] p-4 space-y-1">
          <div className="text-[#8A8D93] uppercase font-bold tracking-wider">Audit Ledger Logs</div>
          <div className="text-2xl font-black text-slate-900">{transfers.length} entries</div>
          <div className="text-[10px] text-slate-500">Every change has an audit paper trail</div>
        </div>

        <div className="bg-[#C7FB33]/15 text-slate-900 border border-[#C7FB33]/50 p-4 space-y-1">
          <div className="text-[9px] uppercase font-black tracking-widest text-slate-700">Migration Wizard</div>
          <div className="text-base font-black text-slate-900 uppercase">
            {migrationStatus === "success" ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Migration Complete
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Stocky Data Pending
              </span>
            )}
          </div>
          <button
            onClick={() => onSetDemoTab("stocky")}
            className="text-[10px] text-slate-700 underline block font-bold text-left uppercase tracking-wider"
          >
            {migrationStatus === "success" ? "Review logs" : "Run Migration Wizard"}
          </button>
        </div>
      </div>

      {/* Two Column Layout: SKUs list & Selected SKU audit panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive SKU Table list */}
        <div className="lg:col-span-8 border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#E5E7EB] bg-[#f8f9fa] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
            <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Synchronized Catalog & Stock Levels
            </span>
            <div className="relative w-full sm:w-60 text-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by SKU, Name, Supplier..."
                value={skuSearch}
                onChange={(e) => onSetSkuSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-white border border-[#D1D5DB] rounded-none w-full focus:outline-none focus:border-slate-900 text-slate-800"
              />
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F3F4F6] text-slate-600 border-b border-[#E5E7EB] font-bold">
                  <th className="p-3">SKU / ITEM NAME</th>
                  <th className="p-3">SUPPLIER</th>
                  <th className="p-3">ON HAND</th>
                  <th className="p-3 text-center">SAFETY MIN/MAX</th>
                  <th className="p-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredSkus.map((sku) => {
                  const isLow = sku.onHand <= sku.minStock;
                  return (
                    <tr
                      key={sku.id}
                      onClick={() => onSetSelectedSku(sku)}
                      className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                        selectedSku?.id === sku.id ? "bg-slate-100" : ""
                      }`}
                    >
                      <td className="p-3 space-y-0.5 font-mono">
                        <span className="font-bold text-indigo-600 block">{sku.sku}</span>
                        <span className="font-bold text-slate-800 block">{sku.name}</span>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">
                          Category: {sku.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 font-bold uppercase">{sku.supplier}</td>
                      <td className="p-3">
                        <span className="font-black text-slate-900">{sku.onHand} units</span>
                        <span className="text-[10px] text-slate-400 block font-mono">Reserved: {sku.reserved}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 text-[10px]">
                          Min: {sku.minStock} / Max: {sku.maxStock}
                        </span>
                      </td>
                      <td className="p-3">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5">
                            <AlertTriangle className="h-3 w-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                            <CheckCircle2 className="h-3 w-3" /> Healthy
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Dynamic Inspector Panel */}
        <div className="lg:col-span-4 space-y-4 font-mono">
          {selectedSku ? (
            <div className="bg-slate-900 text-white p-5 space-y-4 shadow-[4px_4px_0px_#000]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#C7FB33]">
                  SKU Inspector
                </span>
                <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5">Live Audit Ready</span>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white text-sm leading-tight uppercase">{selectedSku.name}</h3>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="bg-slate-800 text-slate-300 px-2 py-0.5">{selectedSku.sku}</span>
                  <span className="text-slate-400">Barcode: {selectedSku.barcode}</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase">Supplier:</span>
                  <span className="font-bold text-slate-200">{selectedSku.supplier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase">Daily Velocity:</span>
                  <span className="text-[#C7FB33] font-bold">{selectedSku.dailyVelocity} units/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase">Lead Time:</span>
                  <span className="font-bold text-slate-200">{selectedSku.leadTimeDays} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase">Safety Buffer:</span>
                  <span className="text-slate-200">{selectedSku.minStock} units</span>
                </div>
              </div>

              {/* Quick Interactive Actions inside the Inspector */}
              <div className="pt-4 border-t border-slate-800 space-y-2.5 text-xs">
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  SIMULATE LEDGER ACTIONS:
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onSetSkus((prev: SKUItem[]) =>
                        prev.map((s) =>
                          s.id === selectedSku.id
                            ? { ...s, onHand: s.onHand + 10, available: s.available + 10 }
                            : s
                        )
                      );
                      onSetSelectedSku(
                        selectedSku
                          ? { ...selectedSku, onHand: selectedSku.onHand + 10, available: selectedSku.available + 10 }
                          : null
                      );
                      onTriggerToast(`Logged +10 audit-received units for ${selectedSku.sku}`, "success");
                    }}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-1.5"
                  >
                    <Plus className="h-3 w-3 text-[#C7FB33]" />
                    <span>Receive +10</span>
                  </button>

                  <button
                    onClick={() => {
                      if (selectedSku.onHand < 5) {
                        onTriggerToast("Cannot drop below zero stock.", "info");
                        return;
                      }
                      onSetSkus((prev: SKUItem[]) =>
                        prev.map((s) =>
                          s.id === selectedSku.id
                            ? { ...s, onHand: s.onHand - 5, available: s.available - 5 }
                            : s
                        )
                      );
                      onSetSelectedSku(
                        selectedSku
                          ? { ...selectedSku, onHand: selectedSku.onHand - 5, available: selectedSku.available - 5 }
                          : null
                      );
                      onTriggerToast(`Logged -5 audit-delivery units for ${selectedSku.sku}`, "success");
                    }}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="h-3 w-3 text-rose-400" />
                    <span>Deduct -5</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    onSetDemoTab("barcode");
                    onSetScannedCode(selectedSku.barcode);
                  }}
                  className="w-full py-2 bg-[#C7FB33] hover:bg-[#b0f214] text-black font-black uppercase tracking-wider text-center flex items-center justify-center gap-1.5"
                >
                  <Barcode className="h-3.5 w-3.5" />
                  <span>View Barcode Details</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-[#E5E7EB] bg-[#f8f9fa] p-6 text-center text-slate-500 text-xs">
              <Boxes className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <span>
                Click any row in the inventory catalog list to inspect real-time data, adjust quantities, and print
                ledger logs.
              </span>
            </div>
          )}

          {/* General Transfer Widget */}
          <div className="border border-[#E5E7EB] bg-[#f8f9fa] p-4 space-y-3 text-xs">
            <span className="font-bold text-slate-800 block uppercase tracking-wider">
              The Stocky Alternative Solution:
            </span>
            <p className="text-slate-600 leading-relaxed font-sans">
              Stocky no longer processes native multi-location transfers. Using StockFlows, all transfers trigger
              real-time ledger records, protecting your historical data.
            </p>
            <button
              onClick={() => onSetDemoTab("transfers")}
              className="text-indigo-600 font-bold hover:underline flex items-center gap-1 uppercase tracking-wider text-[10px]"
            >
              <span>Manage Stock Transfers</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
