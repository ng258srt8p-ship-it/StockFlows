import { Badge } from "@shopify/polaris";

interface StockBadgeProps {
  quantity: number;
  reorderPoint: number;
  size?: "small" | "medium";
}

export function StockBadge({ quantity, reorderPoint, size = "medium" }: StockBadgeProps) {
  if (quantity <= 0) {
    return <Badge tone="critical" size={size}>Out of Stock</Badge>;
  }

  if (quantity <= reorderPoint) {
    return <Badge tone="warning" size={size}>Low Stock</Badge>;
  }

  return <Badge tone="success" size={size}>In Stock</Badge>;
}
