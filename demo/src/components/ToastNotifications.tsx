import type { Toast } from "../data/demoData";
import { CheckCircle2, Info } from "lucide-react";

interface ToastNotificationsProps {
  toasts: Toast[];
}

export default function ToastNotifications({ toasts }: ToastNotificationsProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 p-4 bg-white border border-[var(--border)] text-xs text-[var(--text-primary)] shadow-[var(--shadow-lg)] rounded-xl animate-slide-in"
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-[var(--success)] shrink-0" />
          ) : (
            <Info className="h-4 w-4 text-[var(--accent)] shrink-0" />
          )}
          <div>{toast.message}</div>
        </div>
      ))}
    </div>
  );
}
