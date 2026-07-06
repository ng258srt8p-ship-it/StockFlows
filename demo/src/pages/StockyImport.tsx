import type { MigrationStatus } from "../data/demoData";
import { RefreshCw, Database, CheckCircle2 } from "lucide-react";

interface StockyImportProps {
  migrationStatus: MigrationStatus;
  migrationProgress: number;
  migrationLogs: string[];
  onRunMigration: () => void;
  onResetMigration: () => void;
  onSetDemoTab: (tab: "dashboard" | "transfers" | "replenishment" | "stocky" | "barcode") => void;
}

export default function StockyImport({
  migrationStatus,
  migrationProgress,
  migrationLogs,
  onRunMigration,
  onResetMigration,
  onSetDemoTab,
}: StockyImportProps) {
  return (
    <div className="space-y-6">
      {/* Wizard Header Info */}
      <div className="bg-slate-900 text-white p-6 border-2 border-slate-800 space-y-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded bg-[#C7FB33] flex items-center justify-center">
            <RefreshCw className="h-5 w-5 text-black animate-spin" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider">
              Stocky to StockFlows Migration Wizard
            </h2>
            <p className="text-slate-400 text-[10px] font-sans">
              Instantly secure your supplier information, catalog custom codes, and active location mappings before
              sunset.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-[#8A8D93]">
          <div className="bg-slate-800/40 p-3 border border-slate-700/30 space-y-1">
            <span className="font-bold text-white block uppercase text-[10px]">1. Sync Supplier SKUs</span>
            <p className="text-[10px] font-sans">Auto-mapping of custom supplier barcode variables to avoid scanning downtime.</p>
          </div>
          <div className="bg-slate-800/40 p-3 border border-slate-700/30 space-y-1">
            <span className="font-bold text-white block uppercase text-[10px]">2. Location On-Hand State</span>
            <p className="text-[10px] font-sans">Transfers your physical locations so ledger starts with precise numbers.</p>
          </div>
          <div className="bg-slate-800/40 p-3 border border-slate-700/30 space-y-1">
            <span className="font-bold text-white block uppercase text-[10px]">3. Min/Max Target Setup</span>
            <p className="text-[10px] font-sans">Converts static limits into active demand forecasting velocities automatically.</p>
          </div>
        </div>
      </div>

      {/* Interactive Wizard Panel */}
      <div className="border border-[#E5E7EB] p-6 shadow-sm space-y-6 font-mono text-xs">
        <div className="border-b border-[#E5E7EB] pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[9px] uppercase tracking-widest font-bold text-indigo-600">
              Secure Database Importer
            </span>
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Run 1-Click Migration</h3>
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
                  This emulator runs a live test of our real Shopify migration engine. No current catalog records will
                  be overwritten. We read supplier codes and location stocks.
                </p>
              </div>
              <button
                onClick={onRunMigration}
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
                />
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
                <h4 className="font-bold text-slate-900 text-sm uppercase">
                  Migration Simulation Successful!
                </h4>
                <p className="text-slate-500 text-xs">
                  All records mapped and safely stored inside StockFlows.
                </p>
              </div>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => onSetDemoTab("dashboard")}
                  className="px-4 py-2 bg-slate-900 text-[#C7FB33] text-[10px] font-bold uppercase tracking-wider"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={onResetMigration}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider"
                >
                  Run Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Progress log timeline */}
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
  );
}
