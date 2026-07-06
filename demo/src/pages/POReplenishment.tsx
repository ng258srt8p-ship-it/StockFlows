import type { SKUItem } from "../data/demoData";

interface POReplenishmentProps {
  skus: SKUItem[];
  onSetSkus: (skus: SKUItem[] | ((prev: SKUItem[]) => SKUItem[])) => void;
  onTriggerToast: (message: string, type?: "success" | "info") => void;
}

export default function POReplenishment({ skus, onSetSkus, onTriggerToast }: POReplenishmentProps) {
  const handleReplenishOrder = (skuId: string) => {
    onSetSkus((prev: SKUItem[]) =>
      prev.map((s) => {
        if (s.id === skuId) {
          const orderQty = Math.max(50, s.maxStock - s.onHand);
          onTriggerToast(`PO Created! Ordering +${orderQty} units of ${s.sku}`, "success");
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

  return (
    <div className="space-y-6">
      {/* Header widget */}
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-4 text-xs space-y-1 font-mono">
        <strong className="block text-emerald-900 uppercase tracking-wider">
          Replacing Stocky's deprecated min/max levels
        </strong>
        <p className="text-emerald-800 leading-relaxed font-sans">
          StockFlows dynamically monitors daily sales velocity and delivery lead times. Instead of relying on static
          variables, generate instant Purchase Orders (POs) automatically calculated to maintain your required safety
          runway buffer.
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
  );
}
