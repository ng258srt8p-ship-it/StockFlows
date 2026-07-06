import { useState, useCallback, useMemo } from 'react';
import { useDemoDataContext } from '../context/DemoDataContext';
import { SettingsData } from '../types';

const STORAGE_KEY = 'stockflows-demo-settings';

/**
 * Read persisted demo settings from localStorage.
 */
function readPersistedSettings(): Partial<SettingsData> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Write demo settings to localStorage.
 */
function writePersistedSettings(settings: SettingsData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage may be full or unavailable — silently ignore.
  }
}

export interface UseSettingsDataResult {
  data: SettingsData;
  isLoading: boolean;
  updateSetting: <K extends keyof SettingsData>(
    category: K,
    value: SettingsData[K],
  ) => void;
}

/**
 * Returns app settings from demo JSON (with localStorage overrides)
 * when DemoDataProvider is active, otherwise returns defaults for Remix
 * loaders to populate.
 *
 * In demo mode, `updateSetting` persists changes to localStorage so they
 * survive page reloads.
 */
export function useSettingsData(): UseSettingsDataResult {
  const demoCtx = useDemoDataContext();

  // Merge base demo data with any localStorage overrides.
  const baseData = useMemo<SettingsData>(() => {
    if (demoCtx?.settings) {
      return demoCtx.settings as SettingsData;
    }
    // Production defaults — Remix loader will overwrite via useLoaderData.
    return {
      notifications: { emailAlerts: true, slackEnabled: false, smsEnabled: false },
      alertThresholds: { lowStockThreshold: 10, criticalStockThreshold: 3, safetyStockMultiplier: 1.5 },
      forecasting: { forecastHorizonDays: 30 },
      aiFeatures: { enableAiInsights: false, enableForecastExplanations: false },
      general: { currency: 'USD' },
    };
  }, [demoCtx]);

  const [data, setData] = useState<SettingsData>(() => {
    const persisted = readPersistedSettings();
    return persisted ? { ...baseData, ...persisted } : baseData;
  });

  const updateSetting = useCallback(
    <K extends keyof SettingsData>(category: K, value: SettingsData[K]) => {
      setData((prev) => {
        const next = { ...prev, [category]: value };
        // In demo mode, persist to localStorage.
        if (demoCtx) {
          writePersistedSettings(next);
        }
        return next;
      });
    },
    [demoCtx],
  );

  const isLoading = false;

  return { data, isLoading, updateSetting };
}

export default useSettingsData;
