interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
}

export function StatCard({ title, value, subtitle, trend, icon }: StatCardProps) {
  const valueColor =
    trend === "positive"
      ? "var(--success)"
      : trend === "negative"
        ? "var(--danger)"
        : "var(--text-primary)";

  return (
    <div className="rounded-lg border p-5" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            {title}
          </p>
          <p className="mt-1 text-2xl font-bold" style={{ color: valueColor }}>{value}</p>
          {subtitle && (
            <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
              {subtitle}
            </p>
          )}
        </div>
        {icon && <div style={{ color: "var(--text-tertiary)" }}>{icon}</div>}
      </div>
    </div>
  );
}
