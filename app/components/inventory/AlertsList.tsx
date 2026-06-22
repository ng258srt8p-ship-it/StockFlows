import { useNavigate } from "@remix-run/react";
import { IndexTable, Badge, Button, EmptyState } from "@shopify/polaris";

type ReorderAlert = {
  id: string;
  inventoryItemId: string;
  locationId: string;
  currentStock: number;
  reorderPoint: number;
  recommendedQty: number;
  urgency: string;
  inventoryItem: { id: string; title: string; sku: string | null };
  location: { id: string; name: string };
};

type AlertWithRelations = ReorderAlert;

interface AlertsListProps {
  alerts: AlertWithRelations[];
}

const urgencyBadgeStatus: Record<string, "critical" | "warning" | "info"> = {
  CRITICAL: "critical",
  WARNING: "warning",
  INFO: "info",
};

export function AlertsList({ alerts }: AlertsListProps) {
  const navigate = useNavigate();

  if (alerts.length === 0) {
    return (
      <EmptyState
        heading="No active alerts"
        action={{ content: "View inventory", onAction: () => navigate("/app/inventory") }}
        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/empty-state.png"
      >
        <p>All stock levels are above their reorder points.</p>
      </EmptyState>
    );
  }

  return (
    <IndexTable
      resourceName={{ singular: "alert", plural: "alerts" }}
      itemCount={alerts.length}
      headings={[
        { title: "Product" },
        { title: "Location" },
        { title: "Stock" },
        { title: "Reorder Point" },
        { title: "Recommended" },
        { title: "Urgency" },
        { title: "Action" },
      ]}
      selectable={false}
    >
      {alerts.map((alert, index) => (
        <IndexTable.Row key={alert.id} id={alert.id} position={index}>
          <IndexTable.Cell>{alert.inventoryItem.title}</IndexTable.Cell>
          <IndexTable.Cell>{alert.location.name}</IndexTable.Cell>
          <IndexTable.Cell>
            <span className="font-semibold">{alert.currentStock}</span>
          </IndexTable.Cell>
          <IndexTable.Cell>{alert.reorderPoint}</IndexTable.Cell>
          <IndexTable.Cell>{alert.recommendedQty}</IndexTable.Cell>
          <IndexTable.Cell>
            <Badge tone={urgencyBadgeStatus[alert.urgency] || "info"}>
              {alert.urgency}
            </Badge>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Button
              size="slim"
              onClick={() =>
                navigate(
                  `/app/purchasing/new?variantId=${alert.inventoryItem.id}&qty=${alert.recommendedQty}`
                )
              }
            >
              Create PO
            </Button>
          </IndexTable.Cell>
        </IndexTable.Row>
      ))}
    </IndexTable>
  );
}
