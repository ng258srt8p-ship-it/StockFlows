import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface InventoryItem {
  id: string;
  sku: string | null;
  title: string;
  quantity: number;
  reorderPoint: number;
  locationId: string;
  locationName: string;
}

export interface ReorderAlert {
  id: string;
  inventoryItemId: string;
  productName: string;
  locationName: string;
  currentStock: number;
  reorderPoint: number;
  recommendedQty: number;
  urgency: "CRITICAL" | "WARNING" | "INFO";
}

interface InventoryState {
  items: InventoryItem[];
  selectedLocationId: string | null;
  alerts: ReorderAlert[];
  sidebarCollapsed: boolean;

  setItems: (items: InventoryItem[]) => void;
  updateItemQuantity: (itemId: string, newQty: number) => void;
  selectLocation: (locationId: string | null) => void;
  setAlerts: (alerts: ReorderAlert[]) => void;
  addAlert: (alert: ReorderAlert) => void;
  dismissAlert: (alertId: string) => void;
  toggleSidebar: () => void;
}

export const useInventoryStore = create<InventoryState>()(
  devtools(
    persist(
      immer((set) => ({
        items: [],
        selectedLocationId: null,
        alerts: [],
        sidebarCollapsed: false,

        setItems: (items) =>
          set((state) => {
            state.items = items;
          }),

        updateItemQuantity: (itemId, newQty) =>
          set((state) => {
            const item = state.items.find((i) => i.id === itemId);
            if (item) item.quantity = newQty;
          }),

        selectLocation: (locationId) =>
          set((state) => {
            state.selectedLocationId = locationId;
          }),

        addAlert: (alert) =>
          set((state) => {
            // Deduplicate: replace if same ID exists, else add to front
            const existingIdx = state.alerts.findIndex((a) => a.id === alert.id);
            if (existingIdx >= 0) {
              state.alerts[existingIdx] = alert;
            } else {
              state.alerts.unshift(alert);
            }
          }),

        setAlerts: (alerts) =>
          set((state) => {
            state.alerts = alerts;
          }),

        dismissAlert: (alertId) =>
          set((state) => {
            state.alerts = state.alerts.filter((a) => a.id !== alertId);
          }),

        toggleSidebar: () =>
          set((state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
          }),
      })),
      {
        name: "stockflows-inventory",
        partialize: (state) => ({
          selectedLocationId: state.selectedLocationId,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    { name: "InventoryStore" }
  )
);

export function useLowStockItems(): InventoryItem[] {
  return useInventoryStore((state) =>
    state.items.filter((item) => item.quantity <= item.reorderPoint)
  );
}

export function useAlertCount(): number {
  return useInventoryStore((state) => state.alerts.length);
}
