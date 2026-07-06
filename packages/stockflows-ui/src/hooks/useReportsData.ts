import { useState, useMemo } from 'react';
import { useDemoDataContext } from '../context/DemoDataContext';
import { ReportsData, AbcAnalysis, InventoryValuationItem, MovementSummary } from '../types';

export interface UseReportsDataResult {
  valuation: InventoryValuationItem[];
  movements: MovementSummary | null;
  abcAnalysis: AbcAnalysis | null;
  isLoading: boolean;
}

/**
 * Returns reports data (valuation, movements, ABC analysis) from demo JSON
 * when DemoDataProvider is active, otherwise returns empty data for Remix
 * loaders to populate.
 */
export function useReportsData(): UseReportsDataResult {
  const demoCtx = useDemoDataContext();

  const valuation = useMemo<InventoryValuationItem[]>(() => {
    if (demoCtx?.reports) {
      return (demoCtx.reports as ReportsData).inventoryValuation;
    }
    return [];
  }, [demoCtx]);

  const movements = useMemo<MovementSummary | null>(() => {
    if (demoCtx?.reports) {
      return (demoCtx.reports as ReportsData).summary.movements;
    }
    return null;
  }, [demoCtx]);

  const abcAnalysis = useMemo<AbcAnalysis | null>(() => {
    if (demoCtx?.abcAnalysis) {
      return demoCtx.abcAnalysis as AbcAnalysis;
    }
    return null;
  }, [demoCtx]);

  const isLoading = false;

  return { valuation, movements, abcAnalysis, isLoading };
}

export default useReportsData;
