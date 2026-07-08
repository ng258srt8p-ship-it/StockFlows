import { Card, Text } from "@shopify/polaris";

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
      ? "text-[var(--success)]"
      : trend === "negative"
        ? "text-[var(--danger)]"
        : "text-[var(--text-primary)]";

  return (
    <Card>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <Text variant="headingSm" as="h3" tone="subdued">
              {title}
            </Text>
            <div className={`mt-1 text-2xl font-bold ${valueColor}`}>{value}</div>
            {subtitle && (
              <Text variant="bodySm" as="p" tone="subdued">
                {subtitle}
              </Text>
            )}
          </div>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
      </div>
    </Card>
  );
}
