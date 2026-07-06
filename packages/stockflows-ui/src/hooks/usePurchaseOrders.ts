import { useState, useMemo } from 'react';
import { useDemoDataContext } from '../context/DemoDataContext';

/**
 * Purchase order status values.
 */
export type POStatus = 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';

/**
 * A single purchase order line item.
 */
export interface POLineItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitCost: number;
}

/**
 * A purchase order record.
 */
export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  status: POStatus;
  items: POLineItem[];
  totalCost: number;
  createdAt: string;
  expectedDelivery: string;
  notes?: string;
}

export interface UsePurchaseOrdersResult {
  data: PurchaseOrder[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Returns purchase order data.
 * In demo mode returns an empty array (no PO demo data exists yet).
 * In production, Remix loaders provide the real data.
 */
export function usePurchaseOrders(): UsePurchaseOrdersResult {
  const demoCtx = useDemoDataContext();
  const [error] = useState<string | null>(null);

  // Demo context doesn't include POs yet — return empty.
  // When PO demo JSON is added, return demoCtx.purchaseOrders here.
  const data = useMemo<PurchaseOrder[]>(() => {
    // No demo PO data available — production data comes from Remix loaders.
    return [];
  }, [demoCtx]);

  const isLoading = false;

  return { data, isLoading, error };
}

export default usePurchaseOrders;
