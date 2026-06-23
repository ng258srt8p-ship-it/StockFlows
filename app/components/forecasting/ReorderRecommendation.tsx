import { Card, Text, Badge, Button, ProgressBar } from "@shopify/polaris";
import { useNavigate } from "@remix-run/react";

interface ReorderRecommendationProps {
  itemName: string;
  sku: string | null;
  currentQty: number;
  avgDailySales: number;
  leadTimeDays: number;
  safetyStock: number;
  recommendedQty: number;
  confidence: number;
  stockoutDays: number;
}

export function ReorderRecommendation({
  itemName,
  sku,
  currentQty,
  avgDailySales,
  leadTimeDays,
  safetyStock,
  recommendedQty,
  confidence,
  stockoutDays,
}: ReorderRecommendationProps) {
  const navigate = useNavigate();

  const urgency =
    stockoutDays <= leadTimeDays
      ? "critical"
      : stockoutDays <= leadTimeDays * 2
        ? "warning"
        : "info";

  const urgencyLabel =
    stockoutDays <= leadTimeDays
      ? "Stockout predicted before delivery"
      : stockoutDays <= leadTimeDays * 2
        ? "Reorder soon"
        : "Adequate stock";

  return (
    <Card>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <Text variant="headingSm" as="h3">
              {itemName}
            </Text>
            {sku && (
              <Text variant="bodySm" as="p" tone="subdued">
                {sku}
              </Text>
            )}
          </div>
          <Badge tone={urgency}>{urgencyLabel}</Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div>
            <Text variant="bodySm" as="p" tone="subdued">
              Current Stock
            </Text>
            <Text variant="headingMd" as="p">
              {currentQty}
            </Text>
          </div>
          <div>
            <Text variant="bodySm" as="p" tone="subdued">
              Daily Demand
            </Text>
            <Text variant="headingMd" as="p">
              {avgDailySales.toFixed(1)}
            </Text>
          </div>
          <div>
            <Text variant="bodySm" as="p" tone="subdued">
              Days Until Stockout
            </Text>
            <Text variant="headingMd" as="p">
              {stockoutDays}
            </Text>
          </div>
          <div>
            <Text variant="bodySm" as="p" tone="subdued">
              Recommended Order
            </Text>
            <Text variant="headingMd" as="p">
              {recommendedQty}
            </Text>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Stock Level</span>
            <span>
              {currentQty} / {currentQty + recommendedQty}
            </span>
          </div>
          <ProgressBar
            progress={Math.min(100, (currentQty / (currentQty + recommendedQty)) * 100)}
            size="small"
          />
        </div>

        <div className="flex items-center justify-between">
          <Text variant="bodySm" as="p" tone="subdued">
            Forecast confidence: {Math.round(confidence * 100)}% • Lead time:{" "}
            {leadTimeDays} days • Safety stock: {safetyStock}
          </Text>
          <Button
            size="slim"
            onClick={() =>
              navigate(
                `/app/purchasing/new?auto=true&qty=${recommendedQty}&item=${itemName}`
              )
            }
          >
            Create PO
          </Button>
        </div>
      </div>
    </Card>
  );
}
