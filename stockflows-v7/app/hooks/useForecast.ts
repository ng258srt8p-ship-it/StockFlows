import { useState, useEffect, useCallback } from "react";

interface ForecastPoint {
  date: string;
  yhat: number;
  lower: number;
  upper: number;
}

interface ForecastData {
  predictions: ForecastPoint[];
  totalPredicted: number;
  confidence: number;
  modelUsed: string;
  avgDailySales: number;
  trendDirection: "up" | "down" | "stable";
}

interface UseForecastResult {
  forecast: ForecastData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook for fetching and caching forecast data for a specific inventory item.
 *
 * Usage:
 *   const { forecast, isLoading, error } = useForecast(itemId);
 */
export function useForecast(itemId: string | null): UseForecastResult {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = useCallback(async () => {
    if (!itemId) return;

    setIsLoading(true);
    setError(null);

    try {
      // In production, this would call an API endpoint
      // For now, fetch from the local Prisma data via a loader
      const response = await fetch(`/app/forecasting?itemId=${itemId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch forecast: ${response.status}`);
      }
      const data = await response.json();
      setForecast(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  return {
    forecast,
    isLoading,
    error,
    refetch: fetchForecast,
  };
}
