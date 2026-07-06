import { useState } from "react";
import type { SKUItem, TransferDoc, TransferType } from "../data/demoData";
import {
  Info,
  Plus,
  Send,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

interface StockTransfersProps {
  skus: SKUItem[];
  transfers: TransferDoc[];
  onSetSkus: (skus: SKUItem[] | ((prev: SKUItem[]) => SKUItem[])) => void;
  onSetTransfers: (transfers: TransferDoc[] | ((prev: TransferDoc[]) => TransferDoc[])) => void;
  onTriggerToast: (message: string, type?: "success" | "info") => void;
}

interface NewTransferForm {
  type: TransferType;
  origin: string;
  destination: string;
  qty: number;
  skuId: string;
}

export default function StockTransfers({
  skus,
  transfers,
  onSetSkus,
  onSetTransfers,
  onTriggerToast,
}: StockTransfersProps) {
  const [newTransfer, setNewTransfer] = useState<NewTransferForm>({
    type: "TRF",
    origin: "Main Distribution Center",
    destination: "Downtown Storefront",
    qty: 25,
    skuId: "1",
  });

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

    onSetTransfers((prev: TransferDoc[]) => [doc, ...prev]);

    if (newTransfer.type === "TRF" || newTransfer.type === "DEL") {
      onSetSkus((prev: SKUItem[]) =>
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
      onSetSkus((prev: SKUItem[]) =>
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

    onTriggerToast(`Document ${doc.id} created as Draft! Stock ledger updated.`, "success");
  };

  const advanceTransferStatus = (id: string) => {
    onSetTransfers((prev: TransferDoc[]) =>
      prev.map((t) => {
        if (t.id === id) {
          let nextStatus: "Draft" | "Waiting" | "Ready" | "Done" = "Draft";
          if (t.status === "Draft") nextStatus = "Waiting";
          else if (t.status === "Waiting") nextStatus = "Ready";
          else if (t.status === "Ready") nextStatus = "Done";
          else return t;

          onTriggerToast(`Transfer ${id} updated to ${nextStatus}!`);
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Explanation Banner */}
      <div className="bg-indigo-50 border border-indigo-200 text-indigo-950 p-4 text-xs flex items-start gap-3 font-mono">
        <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block text-indigo-900 uppercase tracking-wider">
            Replace stock transfers with a document-driven audit ledger
          </strong>
          <p className="text-indigo-800 leading-relaxed font-sans">
            Create receipts (REC), deliveries (DEL), transfers (TRF), or adjustments (ADJ). As each document advances
            through Draft - Waiting - Ready - Done, on-hand quantities automatically reconcile without shadow
            spreadsheets.
          </p>
        </div>
      </div>

      {/* Transfer Creator Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
        {/* Form Panel */}
        <div className="lg:col-span-5 border border-[#E5E7EB] p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 border-b border-[#E5E7EB] pb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <Plus className="h-4 w-4 text-emerald-600" />
            <span>Create New Stock Document</span>
          </h3>

          <form onSubmit={handleCreateTransfer} className="space-y-3">
            <div>
              <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wider">Document Type</label>
              <select
                value={newTransfer.type}
                onChange={(e) => setNewTransfer({ ...newTransfer, type: e.target.value as TransferType })}
                className="w-full bg-white border border-[#D1D5DB] p-2 focus:outline-none focus:border-slate-900"
              >
                <option value="TRF">Transfer (TRF) -- Between Locations</option>
                <option value="REC">Receipt (REC) -- Incoming Stock</option>
                <option value="DEL">Delivery (DEL) -- Outgoing Shipment</option>
                <option value="ADJ">Adjustment (ADJ) -- Stock Audit Correction</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wider">Target Variant</label>
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
                <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wider">Destination</label>
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
              <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wider">Quantity of Units</label>
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
              <Send className="h-3.5 w-3.5 text-[#C7FB33]" />
              <span>Log to Ledger</span>
            </button>
          </form>
        </div>

        {/* Active Ledgers List */}
        <div className="lg:col-span-7 border border-[#E5E7EB] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider">Active Document Ledger Logs</h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">Live Sync</span>
          </div>

          <div className="space-y-2.5">
            {transfers.map((doc) => {
              let badgeStyle = "bg-slate-100 text-slate-700";
              if (doc.status === "Done") badgeStyle = "bg-emerald-100 text-emerald-800";
              if (doc.status === "Waiting") badgeStyle = "bg-amber-100 text-amber-800";
              if (doc.status === "Ready") badgeStyle = "bg-indigo-100 text-indigo-800";

              return (
                <div
                  key={doc.id}
                  className="p-3 border border-[#E5E7EB] hover:border-indigo-400 transition-colors bg-[#f8f9fa] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-700">{doc.id}</span>
                      <span className="text-[9px] uppercase font-bold text-slate-400">[{doc.type}]</span>
                      <span className={`px-2 py-0.2 font-mono text-[9px] uppercase font-bold ${badgeStyle}`}>
                        {doc.status}
                      </span>
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      <span>
                        Route: {doc.origin} --&gt; {doc.destination}
                      </span>
                      <span className="mx-2">|</span>
                      <span>Total: {doc.itemsCount} units</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block">Logged: {doc.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {doc.status !== "Done" ? (
                      <button
                        onClick={() => advanceTransferStatus(doc.id)}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-[#C7FB33] font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1"
                      >
                        <span>Next Status</span>
                        <ChevronRight className="h-3 w-3 text-[#C7FB33]" />
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
  );
}
