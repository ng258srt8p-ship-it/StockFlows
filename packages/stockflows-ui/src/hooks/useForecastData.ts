import { useState, useMemo } from 'react';
import { useDemoDataContext } from '../context/DemoDataContext';
import { Forecast } from '../types';

export interface ForecastSummary {
  totalForecasts: number;
  avgConfidence: number;
  trends: { up: number; down: number; stable: number };
  byClass: { A: number; B: number; C: number };
}

export interface UseForecastDataResult {
  data: Forecast[];
  isLoading: boolean;
  error: string | null;
  summary: ForecastSummary | null;
}

function computeSummary(forecasts: Forecast[]): ForecastSummary {
  const total = forecasts.length;
  const avgConfidence =
    total > 0
      ? Math.round(forecasts.reduce((sum, f) => sum + f.confidence, 0) / total)
      : 0;

  const trends = { up: 0, down: 0, stable: 0 };
  const byClass = { A: 0, B: 0, C: 0 };

  for (const f of forecasts) {
    trends[f.trend]++;
    byClass[f.abcClass]++;
  }

  return { totalForecasts: total, avgConfidence, trends, byClass };
}

/**
 * Returns forecast data from demo JSON when DemoDataProvider is active,
 * otherwise returns an empty array for Remix loaders to populate.
 */
export function useForecastData(): UseForecastDataResult {
  const demoCtx = useDemoDataContext();
  const [error, setError] = useState<string | null>(null);

  const data = useMemo<Forecast[]>(() => {
    if (demoCtx) {
      return demoCtx.forecasts as Forecast[];
    }
    return [];
  }, [demoCtx]);

  const summary = useMemo<ForecastSummary | null>(() => {
    if (data.length === 0) return null;
    return computeSummary(data);
  }, [data]);

  const isLoading = false;

  return { data, isLoading, error, summary };
}

export default useForecastData;
