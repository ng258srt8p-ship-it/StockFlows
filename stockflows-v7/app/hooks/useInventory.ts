import { useInventoryStore } from "~/stores/inventory";
import { useSSE } from "./useSSE";

/**
 * Main inventory hook that combines the Zustand store with SSE real-time updates.
 *
 * Usage:
 *   const { items, alerts, lowStockItems, alertCount, isConnected } = useInventory();
 */
export function useInventory() {
  const items = useInventoryStore((s) => s.items);
  const alerts = useInventoryStore((s) => s.alerts);
  const selectedLocationId = useInventoryStore((s) => s.selectedLocationId);
  const setItems = useInventoryStore((s) => s.setItems);
  const selectLocation = useInventoryStore((s) => s.selectLocation);

  const { isConnected } = useSSE();

  // Derived state
  const lowStockItems = items.filter((i) => i.quantity <= i.reorderPoint);
  const outOfStockItems = items.filter((i) => i.quantity === 0);
  const alertCount = alerts.length;
  const totalItems = items.length;
  const totalValue = items.reduce(
    (sum, i) => sum + i.quantity * (i as any).costPerUnit,
    0
  );

  // Filtered items by selected location
  const filteredItems = selectedLocationId
    ? items.filter((i) => i.locationId === selectedLocationId)
    : items;

  return {
    items: filteredItems,
    allItems: items,
    alerts,
    lowStockItems,
    outOfStockItems,
    alertCount,
    totalItems,
    totalValue,
    selectedLocationId,
    isConnected,
    // Actions
    setItems,
    selectLocation,
  };
}
