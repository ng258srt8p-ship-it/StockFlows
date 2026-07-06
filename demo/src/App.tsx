import { useState } from "react";
import {
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Plus,
  Search,
  CheckCircle2,
  Info,
  AlertTriangle,
  ChevronRight,
  Send,
  Boxes,
  Database,
  Check,
  X,
} from "lucide-react";
import ShopifyNav from "./components/ShopifyNav";
import AppSidebar from "./components/AppSidebar";
import ToastNotifications from "./components/ToastNotifications";
import {
  INITIAL_SKUS,
  INITIAL_TRANSFERS,
  type SKUItem,
  type TransferDoc,
  type DemoTab,
  type Toast,
} from "./data/demoData";

export default function App() {
  const [view, setView] = useState<"landing" | "demo">("demo");
  const [demoTab, setDemoTab] = useState<DemoTab>("dashboard");

  // Real-time states for demo app
  const [skus, setSkus] = useState<SKUItem[]>(INITIAL_SKUS);
  const [transfers, setTransfers] = useState<TransferDoc[]>(INITIAL_TRANSFERS);
  const [selectedSku, setSelectedSku] = useState<SKUItem | null>(INITIAL_SKUS[0]);
  const [skuSearch, setSkuSearch] = useState("");
  const [migrationStatus, setMigrationStatus] = useState<"idle" | "importing" | "success">("idle");
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [migrationLogs, setMigrationLogs] = useState<string[]>([]);
  const [scannedCode, setScannedCode] = useState("");
  const [newTransfer, setNewTransfer] = useState({
    type: "TRF" as "TRF" | "REC" | "DEL" | "ADJ",
    origin: "Main Distribution Center",
    destination: "Downtown Storefront",
    qty: 25,
    skuId: "1",
  });
  const [toasts, setToasts] = useState<Toast[]>([]);

  const triggerToast = (message: string, type: "success" | "info" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleStockyImport = () => {
    if (migrationStatus === "importing") return;
    setMigrationStatus("importing");
    setMigrationProgress(0);
    setMigrationLogs([
      "Initializing connection with Stocky API database...",
      "Reading supplier codes and location configuration...",
    ]);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setMigrationProgress(currentProgress);

      if (currentProgress === 30) {
        setMigrationLogs((prev) => [
          ...prev,
          "Found 4 active inventory locations (Main, Downtown, Westside, Online Store).",
          "Found 5 key suppliers in Stocky catalog...",
        ]);
      }
      if (currentProgress === 60) {
        setMigrationLogs((prev) => [
          ...prev,
          "Mapping SKU custom fields and barcode numbers successfully.",
          "Generating audit-ready historical transaction logs...",
        ]);
      }
      if (currentProgress === 80) {
        setMigrationLogs((prev) => [
          ...prev,
          "Converting Stocky Min/Max levels into Dynamic Velocity Rules.",
        ]);
      }
      if (currentProgress >= 100) {
        clearInterval(interval);
        setMigrationStatus("success");
        setMigrationLogs((prev) => [
          ...prev,
          "Migration Complete: 5 SKUs, 3 locations, and historical stock ledgers imported.",
        ]);
        triggerToast("Successfully migrated all Stocky records!");
      }
    }, 150);
  };

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const sku = skus.find((s) => s.id === newTransfer.skuId);
    if (!sku) return;

    const doc: TransferDoc = {
      id: `${newTransfer.type}-${Math.floor(1000 + Math.random() * 9000)}`,
      type: newTransfer.type,
      origin: newTransfer.origin,
      destination: newTransfer.destination,
      itemsCount: Number(newTransfer.qty),
      status: "Draft",
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    setTransfers([doc, ...transfers]);

    if (newTransfer.type === "TRF" || newTransfer.type === "DEL") {
      setSkus((prev) =>
        prev.map((s) => {
          if (s.id === newTransfer.skuId) {
            return {
              ...s,
              onHand: Math.max(0, s.onHand - Number(newTransfer.qty)),
              available: Math.max(0, s.available - Number(newTransfer.qty)),
            };
          }
          return s;
        })
      );
    } else if (newTransfer.type === "REC" || newTransfer.type === "ADJ") {
      setSkus((prev) =>
        prev.map((s) => {
          if (s.id === newTransfer.skuId) {
            return {
              ...s,
              onHand: s.onHand + Number(newTransfer.qty),
              available: s.available + Number(newTransfer.qty),
            };
          }
          return s;
        })
      );
    }

    triggerToast(`Document ${doc.id} created as Draft. Stock ledger updated.`, "success");
  };

  const advanceTransferStatus = (id: string) => {
    setTransfers((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          let nextStatus: "Draft" | "Waiting" | "Ready" | "Done" = "Draft";
          if (t.status === "Draft") nextStatus = "Waiting";
          else if (t.status === "Waiting") nextStatus = "Ready";
          else if (t.status === "Ready") nextStatus = "Done";
          else return t;

          triggerToast(`Transfer ${id} updated to [${nextStatus}]`);
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleSimulatedScan = (code: string) => {
    setScannedCode(code);
    const found = skus.find((s) => s.barcode === code || s.sku === code);
    if (found) {
      setSelectedSku(found);
      triggerToast(`Barcode Scanned: Found "${found.name}"`, "success");
    } else {
      triggerToast("Barcode not matched to any registered SKU.", "info");
    }
  };

  const handleReplenishOrder = (skuId: string) => {
    setSkus((prev) =>
      prev.map((s) => {
        if (s.id === skuId) {
          const orderQty = Math.max(50, s.maxStock - s.onHand);
          triggerToast(`PO Created: Ordering +${orderQty} units of ${s.sku}`, "success");
          return {
            ...s,
            onHand: s.onHand + orderQty,
            available: s.available + orderQty,
          };
        }
        return s;
      })
    );
  };

  const handleReset = () => {
    setSkus(INITIAL_SKUS);
    setTransfers(INITIAL_TRANSFERS);
    setSelectedSku(INITIAL_SKUS[0]);
    setSkuSearch("");
    setMigrationStatus("idle");
    setMigrationProgress(0);
    setMigrationLogs([]);
    setScannedCode("");
    triggerToast("Simulation database reset to default values.");
  };

  const filteredSkus = skus.filter(
    (s) =>
      s.name.toLowerCase().includes(skuSearch.toLowerCase()) ||
      s.sku.toLowerCase().includes(skuSearch.toLowerCase()) ||
      s.supplier.toLowerCase().includes(skuSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-slate-800 flex flex-col font-sans">
      <ToastNotifications toasts={toasts} />

      {/* Mock Shopify Top Navigation Bar */}
      <ShopifyNav view={view} onSetView={setView} />

      {/* Workspace Sidebar & Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <AppSidebar demoTab={demoTab} onSetDemoTab={setDemoTab} />

        {/* Main Application Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-white">
          {/* App Area Banner header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E7EB] mb-6 font-mono text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] bg-slate-900 text-[#C7FB33] font-bold px-2 py-0.5 tracking-wider uppercase">
                  STOCKY REPLACEMENT ENGAGED
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-[10px] text-slate-500 font-mono">ID: sf_org_cozy_3840</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-2 uppercase tracking-tight">
                <span>StockFlows App</span>
                <span className="text-slate-300 font-normal">/</span>
                <span className="text-slate-600 font-bold text-lg capitalize">
                  {demoTab === "stocky" ? "Stocky Import" : demoTab}
                </span>
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 font-bold uppercase tracking-wider border border-[#D1D5DB] hover:bg-slate-50 text-slate-700 transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset Simulation</span>
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="px-4 py-2 font-black uppercase tracking-wider bg-slate-900 text-[#C7FB33] hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-[3px_3px_0px_#000]"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                <span>Exit Demo</span>
              </button>
            </div>
          </div>

          {/* TAB: LEDGER DASHBOARD */}
          {demoTab === "dashboard" && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
                <div className="border border-[#E5E7EB] bg-[#f8f9fa] p-4 space-y-1">
                  <div className="text-[#8A8D93] uppercase font-bold tracking-wider">Total Stock Value</div>
                  <div className="text-2xl font-black text-slate-900">$24,930</div>
                  <div className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                    <TrendingUp className="h-3 w-3" /> Integrated with Shopify POS
                  </div>
                </div>

                <div className="border border-[#E5E7EB] bg-[#f8f9fa] p-4 space-y-1">
                  <div className="text-[#8A8D93] uppercase font-bold tracking-wider">Out-of-Stock Risk SKUs</div>
                  <div className="text-2xl font-black text-amber-600">2 SKUs</div>
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
                    {migrationStatus === "success"
                      ? "MIGRATED Stocky Complete"
                      : "Stocky Data Pending"}
                  </div>
                  <button
                    onClick={() => setDemoTab("stocky")}
                    className="text-[10px] text-slate-700 underline block font-bold text-left uppercase tracking-wider"
                  >
                    {migrationStatus === "success" ? "Review logs" : "Run Migration Wizard"}
                  </button>
                </div>
              </div>

              {/* SKU Table + Inspector */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* SKU Table */}
                <div className="lg:col-span-8 border border-[#E5E7EB] shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-[#E5E7EB] bg-[#f8f9fa] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
                    <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      Synchronized Catalog and Stock Levels
                    </span>
                    <div className="relative w-full sm:w-60 text-xs">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by SKU, Name, Supplier..."
                        value={skuSearch}
                        onChange={(e) => setSkuSearch(e.target.value)}
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
                              onClick={() => setSelectedSku(sku)}
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
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  Reserved: {sku.reserved}
                                </span>
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

                {/* SKU Inspector */}
                <div className="lg:col-span-4 space-y-4 font-mono">
                  {selectedSku ? (
                    <div className="bg-slate-900 text-white p-5 space-y-4 shadow-[4px_4px_0px_#000]">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-[#C7FB33]">
                          SKU Inspector
                        </span>
                        <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5">
                          Live Audit Ready
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-bold text-white text-sm leading-tight uppercase">
                          {selectedSku.name}
                        </h3>
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

                      <div className="pt-4 border-t border-slate-800 space-y-2.5 text-xs">
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                          SIMULATE LEDGER ACTIONS:
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setSkus((prev) =>
                                prev.map((s) =>
                                  s.id === selectedSku.id
                                    ? { ...s, onHand: s.onHand + 10, available: s.available + 10 }
                                    : s
                                )
                              );
                              setSelectedSku((prev) =>
                                prev ? { ...prev, onHand: prev.onHand + 10, available: prev.available + 10 } : null
                              );
                              triggerToast(`Logged +10 audit-received units for ${selectedSku.sku}`, "success");
                            }}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-1.5"
                          >
                            <Plus className="h-3 w-3 text-[#C7FB33]" />
                            <span>Receive +10</span>
                          </button>

                          <button
                            onClick={() => {
                              if (selectedSku.onHand < 5)
                                return triggerToast("Cannot drop below zero stock.", "info");
                              setSkus((prev) =>
                                prev.map((s) =>
                                  s.id === selectedSku.id
                                    ? { ...s, onHand: s.onHand - 5, available: s.available - 5 }
                                    : s
                                )
                              );
                              setSelectedSku((prev) =>
                                prev ? { ...prev, onHand: prev.onHand - 5, available: prev.available - 5 } : null
                              );
                              triggerToast(`Logged -5 audit-delivery units for ${selectedSku.sku}`, "success");
                            }}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-1.5"
                          >
                            <X className="h-3 w-3 text-rose-400" />
                            <span>Deduct -5</span>
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            setDemoTab("barcode");
                            setScannedCode(selectedSku.barcode);
                          }}
                          className="w-full py-2 bg-[#C7FB33] hover:bg-[#b0f214] text-black font-black uppercase tracking-wider text-center flex items-center justify-center gap-1.5"
                        >
                          <span>View Barcode Details</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-[#E5E7EB] bg-[#f8f9fa] p-6 text-center text-slate-500 text-xs">
                      <Boxes className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <span>
                        Click any row in the inventory catalog list to inspect real-time data, adjust quantities, and
                        print ledger logs.
                      </span>
                    </div>
                  )}

                  {/* Stocky Alternative Info */}
                  <div className="border border-[#E5E7EB] bg-[#f8f9fa] p-4 space-y-3 text-xs">
                    <span className="font-bold text-slate-800 block uppercase tracking-wider">
                      The Stocky Alternative Solution:
                    </span>
                    <p className="text-slate-600 leading-relaxed font-sans">
                      Stocky no longer processes native multi-location transfers. Using StockFlows, all transfers
                      trigger real-time ledger records, protecting your historical data.
                    </p>
                    <button
                      onClick={() => setDemoTab("transfers")}
                      className="text-indigo-600 font-bold hover:underline flex items-center gap-1 uppercase tracking-wider text-[10px]"
                    >
                      <span>Manage Stock Transfers</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: STOCK TRANSFERS */}
          {demoTab === "transfers" && (
            <div className="space-y-6">
              <div className="bg-indigo-50 border border-indigo-200 text-indigo-950 p-4 text-xs flex items-start gap-3 font-mono">
                <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block text-indigo-900 uppercase tracking-wider">
                    Replace stock transfers with a document-driven audit ledger
                  </strong>
                  <p className="text-indigo-800 leading-relaxed font-sans">
                    Create receipts (REC), deliveries (DEL), transfers (TRF), or adjustments (ADJ). As each document
                    advances through Draft to Waiting to Ready to Done, on-hand quantities automatically reconcile
                    without shadow spreadsheets.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
                {/* Transfer Form */}
                <div className="lg:col-span-5 border border-[#E5E7EB] p-5 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 border-b border-[#E5E7EB] pb-2 flex items-center gap-1.5 uppercase tracking-wider">
                    <Plus className="h-4 w-4 text-emerald-600" />
                    <span>Create New Stock Document</span>
                  </h3>

                  <form onSubmit={handleCreateTransfer} className="space-y-3">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wider">
                        Document Type
                      </label>
                      <select
                        value={newTransfer.type}
                        onChange={(e) => setNewTransfer({ ...newTransfer, type: e.target.value as any })}
                        className="w-full bg-white border border-[#D1D5DB] p-2 focus:outline-none focus:border-slate-900"
                      >
                        <option value="TRF">Transfer (TRF) -- Between Locations</option>
                        <option value="REC">Receipt (REC) -- Incoming Stock</option>
                        <option value="DEL">Delivery (DEL) -- Outgoing Shipment</option>
                        <option value="ADJ">Adjustment (ADJ) -- Stock Audit Correction</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wider">
                        Target Variant
                      </label>
                      <select
                        value={newTransfer.skuId}
                        onChange={(e) => setNewTransfer({ ...newTransfer, skuId: e.target.value })}
                        className="w-full bg-white border border-[#D1D5DB] p-2 focus:outline-none focus:border-slate-900"
                      >
                        {skus.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.sku}) -- {s.onHand} On Hand
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wider">Origin</label>
                        <input
                          type="text"
                          value={newTransfer.origin}
                          onChange={(e) => setNewTransfer({ ...newTransfer, origin: e.target.value })}
                          className="w-full bg-white border border-[#D1D5DB] p-2 focus:outline-none focus:border-slate-900"
                          placeholder="e.g. Supplier"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wider">
                          Destination
                        </label>
                        <input
                          type="text"
                          value={newTransfer.destination}
                          onChange={(e) => setNewTransfer({ ...newTransfer, destination: e.target.value })}
                          className="w-full bg-white border border-[#D1D5DB] p-2 focus:outline-none focus:border-slate-900"
                          placeholder="e.g. Retail Store"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wider">
                        Quantity of Units
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newTransfer.qty}
                        onChange={(e) => setNewTransfer({ ...newTransfer, qty: Number(e.target.value) })}
                        className="w-full bg-white border border-[#D1D5DB] p-2 focus:outline-none focus:border-slate-900"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-[#C7FB33] font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_#000]"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Log to Ledger</span>
                    </button>
                  </form>
                </div>

                {/* Active Ledgers List */}
                <div className="lg:col-span-7 border border-[#E5E7EB] p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                    <h3 className="font-bold text-slate-900 uppercase tracking-wider">Active Document Ledger Logs</h3>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                      Live Sync
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {transfers.length === 0 && (
                      <div className="text-center text-slate-400 py-8 text-xs">No transfer documents yet.</div>
                    )}
                    {transfers.map((doc, idx) => {
                      let badgeStyle = "bg-slate-100 text-slate-700";
                      if (doc.status === "Done") badgeStyle = "bg-emerald-100 text-emerald-800";
                      if (doc.status === "Waiting") badgeStyle = "bg-amber-100 text-amber-800";
                      if (doc.status === "Ready") badgeStyle = "bg-indigo-100 text-indigo-800";

                      return (
                        <div
                          key={idx}
                          className="p-3 border border-[#E5E7EB] hover:border-indigo-400 transition-colors bg-[#f8f9fa] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-indigo-700">{doc.id}</span>
                              <span className="text-[9px] uppercase font-bold text-slate-400">[{doc.type}]</span>
                              <span
                                className={`px-2 py-0.2 font-mono text-[9px] uppercase font-bold ${badgeStyle}`}
                              >
                                {doc.status}
                              </span>
                            </div>
                            <div className="text-slate-600 text-[11px]">
                              <span>
                                Route: {doc.origin} &gt; {doc.destination}
                              </span>
                              <span className="mx-2">|</span>
                              <span>Total: {doc.itemsCount} units</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              Logged: {doc.createdAt}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {doc.status !== "Done" ? (
                              <button
                                onClick={() => advanceTransferStatus(doc.id)}
                                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-[#C7FB33] font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1"
                              >
                                <span>Next Status</span>
                                <ChevronRight className="h-3 w-3" />
                              </button>
                            ) : (
                              <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1 uppercase tracking-wider">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Reconciled
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PO REPLENISHMENT */}
          {demoTab === "replenishment" && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-4 text-xs space-y-1 font-mono">
                <strong className="block text-emerald-900 uppercase tracking-wider">
                  Replacing Stocky's deprecated min/max levels
                </strong>
                <p className="text-emerald-800 leading-relaxed font-sans">
                  StockFlows dynamically monitors daily sales velocity and delivery lead times. Instead of relying on
                  static variables, generate instant Purchase Orders (POs) automatically calculated to maintain your
                  required safety runway buffer.
                </p>
              </div>

              <div className="border border-[#E5E7EB] shadow-sm font-mono text-xs">
                <div className="p-4 border-b border-[#E5E7EB] bg-[#f8f9fa] flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider">
                    Replenishment Recommendations Tool
                  </span>
                  <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
                    Dynamic Velocity Model
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F3F4F6] text-slate-600 border-b border-[#E5E7EB] font-bold">
                        <th className="p-3">SKU</th>
                        <th className="p-3">DAILY VELOCITY</th>
                        <th className="p-3">LEAD TIME</th>
                        <th className="p-3">CURRENT RUNWAY</th>
                        <th className="p-3">RECOMMENDED QTY TO ORDER</th>
                        <th className="p-3 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {skus.map((sku) => {
                        const runwayDays = Math.round(sku.onHand / sku.dailyVelocity);
                        const urgent = runwayDays <= sku.leadTimeDays;
                        const recommendedOrder = Math.max(50, sku.maxStock - sku.onHand);

                        return (
                          <tr key={sku.id} className="hover:bg-slate-50">
                            <td className="p-3">
                              <span className="font-bold text-slate-800 block uppercase">{sku.name}</span>
                              <span className="text-indigo-600 block text-[10px]">{sku.sku}</span>
                            </td>
                            <td className="p-3 font-bold text-slate-700">{sku.dailyVelocity} units / day</td>
                            <td className="p-3 text-slate-600">{sku.leadTimeDays} Days</td>
                            <td className="p-3">
                              <div className="space-y-1">
                                <span
                                  className={`font-bold px-2 py-0.5 text-[10px] uppercase ${
                                    urgent
                                      ? "bg-red-100 text-red-800"
                                      : "bg-emerald-100 text-emerald-800"
                                  }`}
                                >
                                  {runwayDays} Days remaining
                                </span>
                                {urgent && (
                                  <span className="text-[9px] text-red-500 block uppercase font-bold">
                                    Out-of-Stock Risk
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 font-bold text-slate-900">
                              +{recommendedOrder} units
                              <span className="text-[10px] text-slate-400 block font-normal">
                                Restocks back to maximum ({sku.maxStock})
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleReplenishOrder(sku.id)}
                                className="px-3 py-1.5 bg-[#C7FB33] hover:bg-[#b0f214] text-black font-black uppercase text-[10px] tracking-wider transition-all"
                              >
                                Generate PO Draft
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: STOCKY IMPORT TOOL */}
          {demoTab === "stocky" && (
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-6 border-2 border-slate-800 space-y-4 font-mono text-xs">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-[#C7FB33] flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 text-black animate-spin" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider">Stocky {'>'} StockFlows Migration Wizard</h2>
                    <p className="text-slate-400 text-[10px] font-sans">
                      Instantly secure your supplier information, catalog custom codes, and active location mappings
                      before sunset.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-[#8A8D93]">
                  <div className="bg-slate-800/40 p-3 border border-slate-700/30 space-y-1">
                    <span className="font-bold text-white block uppercase text-[10px]">1. Sync Supplier SKUs</span>
                    <p className="text-[10px] font-sans">
                      Auto-mapping of custom supplier barcode variables to avoid scanning downtime.
                    </p>
                  </div>
                  <div className="bg-slate-800/40 p-3 border border-slate-700/30 space-y-1">
                    <span className="font-bold text-white block uppercase text-[10px]">2. Location On-Hand State</span>
                    <p className="text-[10px] font-sans">
                      Transfers your physical locations so ledger starts with precise numbers.
                    </p>
                  </div>
                  <div className="bg-slate-800/40 p-3 border border-slate-700/30 space-y-1">
                    <span className="font-bold text-white block uppercase text-[10px]">3. Min/Max Target Setup</span>
                    <p className="text-[10px] font-sans">
                      Converts static limits into active demand forecasting velocities automatically.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-[#E5E7EB] p-6 shadow-sm space-y-6 font-mono text-xs">
                <div className="border-b border-[#E5E7EB] pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest font-bold text-indigo-600">
                      Secure Database Importer
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                      Run 1-Click Migration
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    STOCKY API INTEGRATION: ACTIVE
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#D1D5DB] bg-[#fcfcfd] space-y-4">
                  {migrationStatus === "idle" && (
                    <div className="text-center space-y-3">
                      <div className="h-14 w-14 bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto">
                        <Database className="h-7 w-7" />
                      </div>
                      <div className="space-y-1 max-w-md font-sans">
                        <h4 className="font-bold text-slate-900 text-sm uppercase font-mono tracking-wider">
                          Start Safe Import Process
                        </h4>
                        <p className="text-slate-500 text-xs leading-relaxed">
                          This emulator runs a live test of our real Shopify migration engine. No current catalog
                          records will be overwritten. We read supplier codes and location stocks.
                        </p>
                      </div>
                      <button
                        onClick={handleStockyImport}
                        className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-[#C7FB33] font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_#000]"
                      >
                        Execute Importer Simulation
                      </button>
                    </div>
                  )}

                  {migrationStatus === "importing" && (
                    <div className="w-full max-w-md space-y-4">
                      <div className="flex items-center justify-between text-[10px] text-slate-700 font-bold">
                        <span>MIGRATING ACTIVE STOCKY DATABASES...</span>
                        <span>{migrationProgress}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 border border-slate-200">
                        <div
                          className="h-full bg-slate-900 transition-all duration-300"
                          style={{ width: `${migrationProgress}%` }}
                        ></div>
                      </div>
                      <div className="text-center text-[10px] text-slate-500 italic animate-pulse">
                        Converting parameters and safety variables safely...
                      </div>
                    </div>
                  )}

                  {migrationStatus === "success" && (
                    <div className="text-center space-y-3">
                      <div className="h-14 w-14 bg-emerald-50 flex items-center justify-center text-emerald-600 mx-auto">
                        <CheckCircle2 className="h-7 w-7" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-sm uppercase">Migration Simulation Successful!</h4>
                        <p className="text-slate-500 text-xs">All records mapped and stored inside StockFlows.</p>
                      </div>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setDemoTab("dashboard")}
                          className="px-4 py-2 bg-slate-900 text-[#C7FB33] text-[10px] font-bold uppercase tracking-wider"
                        >
                          Go to Dashboard
                        </button>
                        <button
                          onClick={() => {
                            setMigrationStatus("idle");
                            setMigrationProgress(0);
                            setMigrationLogs([]);
                          }}
                          className="px-4 py-2 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider"
                        >
                          Run Again
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {migrationLogs.length > 0 && (
                  <div className="bg-[#f8f9fa] border border-[#E5E7EB] p-4 space-y-2">
                    <span className="text-xs font-bold text-slate-800 block uppercase tracking-wider">
                      Security Log Console:
                    </span>
                    <div className="font-mono text-[10px] text-slate-600 space-y-1 max-h-40 overflow-y-auto">
                      {migrationLogs.map((log, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <span className="text-slate-400">[{new Date().toLocaleTimeString()}]</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: BARCODE SCANNING */}
          {demoTab === "barcode" && (
            <div className="space-y-6">
              <div className="bg-indigo-50 border border-indigo-200 text-indigo-950 p-4 text-xs space-y-1 font-mono">
                <strong className="block text-indigo-900 uppercase tracking-wider">
                  Modern mobile phone barcode scanning
                </strong>
                <p className="text-indigo-800 leading-relaxed font-sans">
                  StockFlows eliminates the need for expensive physical scanning guns. Store assistants can open their
                  Shopify Admin on any device, scan a variant's barcode, and immediately review on-hand quantity or log
                  stock transfers.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
                {/* SKU Selection Panel */}
                <div className="lg:col-span-5 border border-[#E5E7EB] p-5 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider">
                    Simulate Barcode Hardware Scan
                  </h3>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Click on any SKU below to test the instant barcode detection software. It will pull the data
                    directly.
                  </p>

                  <div className="space-y-2">
                    {skus.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleSimulatedScan(s.barcode)}
                        className="w-full text-left p-3 border border-[#E5E7EB] hover:border-slate-900 hover:bg-slate-50 transition-all flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block uppercase">{s.name}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">Barcode ID: {s.barcode}</span>
                        </div>
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                          SIMULATE SCAN
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scan Output Panel */}
                <div className="lg:col-span-7 bg-slate-900 text-white p-5 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-[10px] font-bold text-[#C7FB33] uppercase tracking-widest">
                      Device Camera Feed Simulation
                    </span>
                    <span className="text-[9px] bg-red-500 text-white px-2 py-0.5 font-bold animate-pulse uppercase tracking-wider">
                      [SCAN CAMERA LIVE]
                    </span>
                  </div>

                  <div className="h-44 bg-slate-950 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-rose-500 shadow-lg shadow-rose-500/50 animate-pulse"></div>

                    <div className="text-center space-y-2 z-10 p-4">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                        Position barcode within frame
                      </span>
                    </div>
                  </div>

                  {scannedCode ? (
                    <div className="bg-slate-800/80 p-4 border border-slate-700/50 space-y-3">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
                        Scan Success Results
                      </span>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Registered Code: {scannedCode}
                          </span>
                          <span className="text-sm font-bold text-white block uppercase">
                            {selectedSku?.name || "Unknown SKU item"}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 bg-[#C7FB33]/20 text-[#C7FB33] text-xs font-bold font-mono">
                          On Hand: {selectedSku?.onHand || 0}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-[10px] text-slate-500 uppercase tracking-wider font-bold py-4">
                      No scan detected yet. Click one of the SKUs on the left panel to test.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-[#D1D5DB] px-6 py-4 text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 font-mono">
        <span>
          Logged in as <strong>admin@cozythreads.com</strong>
        </span>
        <div className="flex items-center gap-4">
          <span>
            Primary Location: <strong>Main Distribution Center</strong>
          </span>
          <span>
            Shopify status: <strong className="text-emerald-600 uppercase tracking-wider">Online Sync</strong>
          </span>
        </div>
      </footer>
    </div>
  );
}
