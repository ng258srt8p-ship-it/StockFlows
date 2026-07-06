import type { SKUItem } from "../data/demoData";
import { Barcode } from "lucide-react";

interface BarcodeScanningProps {
  skus: SKUItem[];
  scannedCode: string;
  selectedSku: SKUItem | null;
  onSimulatedScan: (code: string) => void;
}

export default function BarcodeScanning({
  skus,
  scannedCode,
  selectedSku,
  onSimulatedScan,
}: BarcodeScanningProps) {
  return (
    <div className="space-y-6">
      {/* Top explanation */}
      <div className="bg-indigo-50 border border-indigo-200 text-indigo-950 p-4 text-xs space-y-1 font-mono">
        <strong className="block text-indigo-900 uppercase tracking-wider">
          Modern mobile phone barcode scanning
        </strong>
        <p className="text-indigo-800 leading-relaxed font-sans">
          StockFlows eliminates the need for expensive physical scanning guns. Store assistants can open their Shopify
          Admin on any device, scan a variant's barcode, and immediately review on-hand quantity or log stock transfers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
        {/* Simulator Trigger */}
        <div className="lg:col-span-5 border border-[#E5E7EB] p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider">
            Simulate Barcode Hardware Scan
          </h3>
          <p className="text-[11px] text-slate-500 font-sans">
            Click on any SKU below to test the instant barcode detection software. It will pull the data directly.
          </p>

          <div className="space-y-2">
            {skus.map((s) => (
              <button
                key={s.id}
                onClick={() => onSimulatedScan(s.barcode)}
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
            {/* CSS Scanner Laser line animation */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-rose-500 shadow-lg shadow-rose-500/50 animate-pulse" />

            <div className="text-center space-y-2 z-10 p-4">
              <Barcode className="h-10 w-10 text-slate-500 mx-auto animate-pulse" />
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
                  <span className="text-[10px] text-slate-400 block font-mono">Registered Code: {scannedCode}</span>
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
  );
}
