import { useState, useEffect, useMemo } from 'react';
import { useDemoDataContext } from '../context/DemoDataContext';
import { Product } from '../types';

export interface UseInventoryDataResult {
  data: Product[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Returns inventory data from demo JSON when DemoDataProvider is active,
 * otherwise returns an empty array for Remix loaders to populate.
 */
export function useInventoryData(): UseInventoryDataResult {
  const demoCtx = useDemoDataContext();
  const [error, setError] = useState<string | null>(null);

  // In demo mode, data is synchronously available from context.
  // In production, Remix loaders provide data via useLoaderData instead.
  const data = useMemo<Product[]>(() => {
    if (demoCtx) {
      return demoCtx.products as Product[];
    }
    return [];
  }, [demoCtx]);

  // No async loading needed — demo data is inline, production uses loaders.
  const isLoading = false;

  return { data, isLoading, error };
}

export default useInventoryData;
