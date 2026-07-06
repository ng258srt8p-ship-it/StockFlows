import {
  ArrowRight,
  Boxes,
  RefreshCw,
  Barcode,
  Check,
  X,
} from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-[#0D0E11] text-[#E4E6EA] font-mono selection:bg-[#C7FB33] selection:text-[#0D0E11]">

      {/* ==================== LANDING PAGE (BRUTALIST EDITORIAL STYLE) ==================== */}
      <div className="relative">

        {/* Header Bar */}
        <header className="border-b border-[#20232A] sticky top-0 z-40 bg-[#0D0E11]/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

            {/* Brand Logo - Editorial look */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-[#C7FB33] text-black font-black text-sm flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_#000]">
                S
              </div>
              <div className="leading-none">
                <span className="font-bold text-base tracking-wider uppercase">StockFlows</span>
                <span className="text-[9px] block text-[#8A8D93] uppercase tracking-widest font-mono">STOCKY RETIREMENT HUB</span>
              </div>
            </div>

            {/* Navigation Links - Clean Mono List */}
            <nav className="hidden lg:flex items-center gap-10 text-[11px] uppercase tracking-widest text-[#8A8D93] font-mono">
              <a href="#problem" className="hover:text-[#C7FB33] transition-colors">01 / THE SUNSET</a>
              <a href="#features" className="hover:text-[#C7FB33] transition-colors">02 / CORE UPGRADE</a>
              <a href="#comparison" className="hover:text-[#C7FB33] transition-colors">03 / MATRIX</a>
              <a href="#screenshots" className="hover:text-[#C7FB33] transition-colors">04 / WALKTHROUGH</a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.href = "/demo"}
                className="hidden sm:inline-block px-4 py-2 text-[10px] uppercase font-bold tracking-widest text-[#8A8D93] hover:text-white border border-[#20232A] transition-all"
              >
                [ TRY LIVE DEMO ]
              </button>
              <button
                onClick={() => window.location.href = "https://stockflows.fly.dev"}
                className="px-5 py-2.5 text-[11px] uppercase font-black tracking-wider bg-[#C7FB33] hover:bg-[#b0f214] text-black transition-all border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]"
              >
                LAUNCH SHOPIFY APP
              </button>
            </div>

          </div>
        </header>

        {/* Hero Section: Mega Typographic Poster style from Httpster.net */}
        <section className="relative border-b border-[#20232A] py-16 lg:py-28 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">

            {/* Mega Category Stamp */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[10px] uppercase tracking-widest bg-[#20232A] text-[#C7FB33] px-3 py-1 font-bold">
                TEMPLATE INSPIRED BY HTTPSTER.NET // THE NEXT-GEN SYSTEM
              </span>
              <span className="text-[10px] text-[#8A8D93] uppercase tracking-wider font-mono">SWISS EDITION v2.6</span>
            </div>

            {/* Mega Editorial Headline */}
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black uppercase tracking-tight leading-[0.95] text-white">
                STOCKY IS <br className="hidden sm:block" />
                <span className="text-[#C7FB33]">SUNSETTING.</span> <br />
                WE ARE THE <span className="underline decoration-wavy decoration-[#C7FB33]">UPGRADE</span>.
              </h1>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-10 border-t border-[#20232A]">

                {/* Summary Details */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="text-xs text-[#8A8D93] uppercase tracking-widest font-mono">01 // THE VALUE RESOLUTION</div>
                  <p className="text-slate-300 text-sm leading-relaxed font-sans font-medium">
                    Shopify is phasing out Stocky's primary capabilities—disabling multi-location stock transfers, supplier custom rules, and replenishment indicators.
                    <strong className="text-white block mt-2">StockFlows steps in with a razor-sharp, audit-ready document ledger. Protect your supply chain state seamlessly.</strong>
                  </p>

                  <div className="pt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => window.location.href = "/demo?tab=stocky"}
                      className="px-6 py-3.5 bg-white text-black font-black text-xs uppercase tracking-wider hover:bg-slate-200 transition-all border-2 border-black shadow-[4px_4px_0px_#C7FB33]"
                    >
                      MIGRATE FROM STOCKY IN 1-CLICK
                    </button>
                  </div>
                </div>

                {/* High Contrast Live State Visual Widget */}
                <div className="lg:col-span-7">
                  <div className="border-2 border-[#20232A] p-4 bg-[#14161B] text-xs font-mono space-y-3 shadow-[8px_8px_0px_#000]">
                    <div className="flex items-center justify-between border-b border-[#20232A] pb-2 text-[10px] text-[#8A8D93]">
                      <span>[ SIMULATED SHOPIFY APP WORKSPACE ]</span>
                      <span className="text-[#C7FB33] animate-pulse-slow">[LIVE EMULATOR STATUS: ACTIVE]</span>
                    </div>

                    {/* Mock Mini Terminal Display */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">LEDGER STATE:</span>
                        <span className="text-emerald-400 font-bold">[RECONCILED]</span>
                      </div>
                      <div className="bg-[#0D0E11] p-2 border border-[#20232A] text-[10px] text-slate-300 font-mono space-y-1">
                        <div>$ sf_cli --import --source=shopify-stocky</div>
                        <div className="text-emerald-400">
                          <Check className="h-3 w-3 inline mr-1" />Detected 3 primary store warehouses
                        </div>
                        <div className="text-emerald-400">
                          <Check className="h-3 w-3 inline mr-1" />5 SKUs synchronized with dynamic lead time velocity rules
                        </div>
                        <div className="text-[#C7FB33]">Ready to explore live dashboard below.</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={() => window.location.href = "/demo"}
                        className="text-[#C7FB33] hover:underline uppercase text-[10px] tracking-wider font-bold inline-flex items-center gap-1"
                      >
                        <ArrowRight className="h-3 w-3" /> Launch the Live Simulated App Emulator
                      </button>
                      <span className="text-[10px] text-[#8A8D93]">HOSTED AT: STOCKFLOWS.FLY.DEV</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* Section: The Stocky Sunset Crisis */}
        <section id="problem" className="py-20 border-b border-[#20232A] bg-[#0A0B0E]">
          <div className="max-w-7xl mx-auto px-6">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-baseline">

              <div className="lg:col-span-4">
                <span className="text-[10px] text-[#C7FB33] tracking-widest uppercase block mb-2">02 // THE DEPRECATION CHALLENGE</span>
                <h2 className="text-3xl font-bold uppercase tracking-tight text-white font-sans">
                  Why is Stocky shutting down?
                </h2>
              </div>

              <div className="lg:col-span-8 text-sm text-[#8A8D93] space-y-6 font-sans">
                <p className="leading-relaxed">
                  Shopify is deprecating the Stocky native app transfers UI, and disabling custom supplier lead times. To keep stock levels aligned across your physical boutiques, distributors, and online channels, you must switch to a modern, document-driven stock ledger.
                </p>
                <p className="text-[#E4E6EA]">
                  <strong>StockFlows is purpose-built to replace Stocky.</strong> All records share a standardized workflow lifecycle (Draft <ArrowRight className="h-3 w-3 inline" /> Waiting <ArrowRight className="h-3 w-3 inline" /> Ready <ArrowRight className="h-3 w-3 inline" /> Done), writing to an immutable inventory ledger you can audit at any hour.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* Section: Unique Core Features Display with Screenshots */}
        <section id="features" className="py-20 border-b border-[#20232A]">
          <div className="max-w-7xl mx-auto px-6">

            {/* Header */}
            <div className="border-b border-[#20232A] pb-10 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="text-[10px] text-[#C7FB33] tracking-widest uppercase block mb-1">03 // APP SPECIFICATIONS</span>
                <h2 className="text-4xl font-extrabold uppercase text-white tracking-tight">Core Capabilities</h2>
              </div>
              <p className="text-sm text-[#8A8D93] max-w-sm font-sans">
                A high-end editorial breakdown of the layout designed to run seamlessly inside your Shopify Admin dashboard.
              </p>
            </div>

            {/* Grid of Features with Beautiful Minimalist Layout Mockups */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Feature Card 1 */}
              <div className="border-2 border-[#20232A] bg-[#14161B] p-6 space-y-6 hover:border-[#C7FB33] transition-all">
                <div className="space-y-2">
                  <span className="font-mono text-[#C7FB33] text-xs font-bold">[ 01 / MULTI-WAREHOUSE ]</span>
                  <h3 className="text-xl font-bold uppercase text-white">Dynamic Transfers</h3>
                  <p className="text-[#8A8D93] text-xs leading-relaxed font-sans">
                    With Shopify native transfers sunsetting, execute robust multi-warehouse stock shifts directly. Tracks draft movements and locks incoming inventory automatically.
                  </p>
                </div>

                {/* UI Screenshot Component */}
                <div className="bg-[#0D0E11] p-3 border border-[#20232A] space-y-2">
                  <div className="flex justify-between items-center text-[9px] text-[#8A8D93]">
                    <span>DOCUMENT ID</span>
                    <span>STATUS</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-white">
                    <span>TRF-0094-WE</span>
                    <span className="text-amber-400 uppercase bg-amber-500/10 px-1.5 py-0.5 text-[9px]">Waiting</span>
                  </div>
                  <div className="text-[10px] text-[#8A8D93]">
                    <span>Route: Main Warehouse &gt; Westside Hub</span>
                  </div>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="border-2 border-[#20232A] bg-[#14161B] p-6 space-y-6 hover:border-[#C7FB33] transition-all">
                <div className="space-y-2">
                  <span className="font-mono text-[#C7FB33] text-xs font-bold">[ 02 / REPLENISHMENT ]</span>
                  <h3 className="text-xl font-bold uppercase text-white">Demand Velocity Rules</h3>
                  <p className="text-[#8A8D93] text-xs leading-relaxed font-sans">
                    Ditch manual estimate spreadsheets. StockFlows calculates daily order velocity based on your actual Shopify sales data, safety levels, and delivery lead times.
                  </p>
                </div>

                {/* UI Screenshot Component */}
                <div className="bg-[#0D0E11] p-3 border border-[#20232A] space-y-2 text-xs">
                  <div className="flex justify-between text-[#8A8D93] text-[9px]">
                    <span>DAILY RUNWAY</span>
                    <span>REORDER TARGET</span>
                  </div>
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-red-400">14 Days remaining</span>
                    <span className="text-[#C7FB33]">+258 Units</span>
                  </div>
                  <div className="h-1 bg-[#20232A] w-full">
                    <div className="bg-[#C7FB33] h-full w-1/4"></div>
                  </div>
                </div>
              </div>

              {/* Feature Card 3 */}
              <div className="border-2 border-[#20232A] bg-[#14161B] p-6 space-y-6 hover:border-[#C7FB33] transition-all">
                <div className="space-y-2">
                  <span className="font-mono text-[#C7FB33] text-xs font-bold">[ 03 / BARCODE UTILITY ]</span>
                  <h3 className="text-xl font-bold uppercase text-white">Instant Camera Scan</h3>
                  <p className="text-[#8A8D93] text-xs leading-relaxed font-sans">
                    Leverage any tablet, laptop, or phone camera. No clunky hand scanners or proprietary hardware locks required. Instant barcode detection updates the Shopify ledger.
                  </p>
                </div>

                {/* UI Screenshot Component */}
                <div className="bg-[#0D0E11] p-3 border border-[#20232A] text-center space-y-1 font-mono text-[10px]">
                  <div className="text-[#8A8D93]">|| | | ||| | || 400129481</div>
                  <div className="text-[#C7FB33] font-bold">SCAN CONFIRMED</div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Section: Feature Comparison Matrix */}
        <section id="comparison" className="py-20 bg-[#0A0B0E] border-b border-[#20232A]">
          <div className="max-w-7xl mx-auto px-6">

            <div className="max-w-3xl mb-12">
              <span className="text-[10px] text-[#C7FB33] tracking-widest uppercase block mb-1">04 // HARD MATRIX COMPARISON</span>
              <h2 className="text-3xl font-extrabold uppercase text-white">Stocky Sunset vs. StockFlows Upgrade</h2>
            </div>

            <div className="border-2 border-[#20232A] overflow-hidden bg-[#0D0E11] font-mono text-xs shadow-[8px_8px_0px_#000]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#14161B] border-b-2 border-[#20232A] text-white">
                      <th className="p-4 font-bold tracking-wider">CAPABILITY</th>
                      <th className="p-4 font-bold text-rose-400 bg-rose-950/10">SHOPIFY STOCKY APP (SUNSETTING)</th>
                      <th className="p-4 font-bold text-[#C7FB33] bg-[#C7FB33]/5">STOCKFLOWS (UPGRADE READY)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#20232A]">
                    <tr>
                      <td className="p-4 font-bold text-white">Stock Transfers</td>
                      <td className="p-4 text-slate-400 bg-rose-950/5">
                        <X className="h-3.5 w-3.5 inline text-rose-400 mr-1" /> Deprecated. Disabled inside the dashboard.
                      </td>
                      <td className="p-4 text-[#C7FB33] bg-[#C7FB33]/5 font-bold">
                        <Check className="h-3.5 w-3.5 inline mr-1" /> Fully Active. Supported directly.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white">Audit Ledger</td>
                      <td className="p-4 text-slate-400 bg-rose-950/5">
                        <X className="h-3.5 w-3.5 inline text-rose-400 mr-1" /> Missing. No permanent document system.
                      </td>
                      <td className="p-4 text-[#C7FB33] bg-[#C7FB33]/5 font-bold">
                        <Check className="h-3.5 w-3.5 inline mr-1" /> Integrated. Full chronological history logs.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white">Forecasting model</td>
                      <td className="p-4 text-slate-400 bg-rose-950/5">
                        <X className="h-3.5 w-3.5 inline text-rose-400 mr-1" /> Deprecated. Static rules will not generate.
                      </td>
                      <td className="p-4 text-[#C7FB33] bg-[#C7FB33]/5 font-bold">
                        <Check className="h-3.5 w-3.5 inline mr-1" /> Dynamic. Based on actual daily store velocity.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-white">Supplier CSV Importer</td>
                      <td className="p-4 text-slate-400 bg-rose-950/5">
                        <X className="h-3.5 w-3.5 inline text-rose-400 mr-1" /> Complex manual translation formulas.
                      </td>
                      <td className="p-4 text-[#C7FB33] bg-[#C7FB33]/5 font-bold">
                        <Check className="h-3.5 w-3.5 inline mr-1" /> 1-Click Migration Wizard. Auto mapping.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </section>

        {/* Section: Layout Walkthrough and Emulator entry */}
        <section id="screenshots" className="py-20 bg-[#0D0E11] text-white">
          <div className="max-w-7xl mx-auto px-6">

            <div className="border-2 border-[#20232A] bg-gradient-to-br from-[#14161B] to-[#0A0B0E] p-8 lg:p-16 relative overflow-hidden shadow-[12px_12px_0px_#000]">

              <div className="max-w-3xl space-y-6">
                <span className="text-[10px] text-[#C7FB33] tracking-widest uppercase block">[ 05 / HIGH FIDELITY SIMULATION ]</span>
                <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight leading-none text-white">
                  SAY GOODBYE TO STATIC SPREADSHEETS.
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed font-sans font-medium">
                  Try the revamped emulator below. It provides a pixel-perfect rendering of the direct Shopify Admin embedded application hosted on <strong>stockflows.fly.dev</strong>. Experience how the live dashboard manages stock document states, processes dynamic lead times, and imports supplier CSV datasets.
                </p>

                <div className="pt-4 flex flex-wrap gap-4">
                  <button
                    onClick={() => window.location.href = "/demo"}
                    className="px-8 py-4 bg-[#C7FB33] text-black font-black text-xs uppercase tracking-widest hover:bg-[#b0f214] transition-all border-2 border-black shadow-[4px_4px_0px_#000]"
                  >
                    LAUNCH CORE INTERACTIVE DEMO
                  </button>
                  <button
                    onClick={() => window.location.href = "/demo?tab=stocky"}
                    className="px-8 py-4 bg-transparent hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest border-2 border-white transition-all"
                  >
                    TRY STOCKY IMPORT WIZARD
                  </button>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Clean Muted Footer */}
        <footer className="border-t border-[#20232A] py-12 text-[10px] text-[#8A8D93] uppercase tracking-widest font-mono">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
            <span>STOCKFLOWS INC (C) 2026</span>
            <span>NO FAKE REVIEWS // AUTHENTIC SWISS MINIMALIST UTILITY APPS</span>
          </div>
        </footer>

      </div>

    </div>
  );
}
