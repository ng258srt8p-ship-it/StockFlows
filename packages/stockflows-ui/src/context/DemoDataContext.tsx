import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { products as _products, forecasts as _forecasts, abcAnalysis as _abcAnalysis, reports as _reports, settings as _settings } from '../data';
import type { Product, Forecast, AbcAnalysis, ReportsData, SettingsData } from '../types';

// ---------------------------------------------------------------------------
// Cast JSON imports to typed defaults
// ---------------------------------------------------------------------------

const defaultProducts: Product[] = _products as unknown as Product[];
const defaultForecasts: Forecast[] = _forecasts as unknown as Forecast[];
const defaultAbcAnalysis: AbcAnalysis = _abcAnalysis as unknown as AbcAnalysis;
const defaultReports: ReportsData = _reports as unknown as ReportsData;
const defaultSettings: SettingsData = _settings as unknown as SettingsData;

// ---------------------------------------------------------------------------
// LocalStorage helpers
// ---------------------------------------------------------------------------

const SETTINGS_STORAGE_KEY = 'stockflows_demo_settings';

function loadPersistedSettings(): SettingsData {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as SettingsData;
    }
  } catch {
    // fall through to default
  }
  return defaultSettings;
}

function persistSettings(s: SettingsData): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(s));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

// ---------------------------------------------------------------------------
// isDemoMode
// ---------------------------------------------------------------------------

export const isDemoMode = true;

// ---------------------------------------------------------------------------
// DemoActions — toast-friendly action stubs
// ---------------------------------------------------------------------------

export interface DemoActionToast {
  title: string;
  message: string;
}

export interface DemoActions {
  addItem: (item?: Partial<Product>) => DemoActionToast;
  updateItem: (id: string, updates?: Partial<Product>) => DemoActionToast;
  deleteItem: (id: string) => DemoActionToast;
  saveSettings: (updates?: Partial<SettingsData>) => DemoActionToast;
  runForecast: (productId?: string) => DemoActionToast;
  exportReport: (format?: 'csv' | 'pdf') => DemoActionToast;
  bulkImport: () => DemoActionToast;
}

export const demoActions: DemoActions = {
  addItem: (_item) => ({
    title: 'Demo Mode',
    message: 'Adding items is disabled in demo mode. Connect to your Shopify store to add products.',
  }),
  updateItem: (_id, _updates) => ({
    title: 'Demo Mode',
    message: 'Editing items is disabled in demo mode. Connect to your Shopify store to make changes.',
  }),
  deleteItem: (_id) => ({
    title: 'Demo Mode',
    message: 'Deleting items is disabled in demo mode. Connect to your Shopify store to manage inventory.',
  }),
  saveSettings: (_updates) => ({
    title: 'Settings Saved',
    message: 'Settings updated (demo mode — changes are local only).',
  }),
  runForecast: (_productId) => ({
    title: 'Demo Mode',
    message: 'Running forecasts is disabled in demo mode. Connect to your Shopify store to generate forecasts.',
  }),
  exportReport: (format = 'csv') => ({
    title: 'Demo Mode',
    message: `Exporting as ${format.toUpperCase()} is disabled in demo mode. Connect to your Shopify store to export reports.`,
  }),
  bulkImport: () => ({
    title: 'Demo Mode',
    message: 'Bulk import is disabled in demo mode. Connect to your Shopify store to import products.',
  }),
};

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------

export interface DemoData {
  products: Product[];
  forecasts: Forecast[];
  abcAnalysis: AbcAnalysis;
  reports: ReportsData;
  settings: SettingsData;
  updateSettings: (updates: Partial<SettingsData>) => void;
  resetSettings: () => void;
}

const DemoDataContext = createContext<DemoData | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface DemoDataProviderProps {
  children: ReactNode;
}

export const DemoDataProvider = ({ children }: DemoDataProviderProps) => {
  const [settings, setSettings] = useState<SettingsData>(loadPersistedSettings);

  const updateSettings = useCallback((updates: Partial<SettingsData>) => {
    setSettings((prev) => {
      const next: SettingsData = {
        ...prev,
        ...updates,
        notifications: { ...prev.notifications, ...updates.notifications },
        alertThresholds: { ...prev.alertThresholds, ...updates.alertThresholds },
        forecasting: { ...prev.forecasting, ...updates.forecasting },
        aiFeatures: { ...prev.aiFeatures, ...updates.aiFeatures },
        general: { ...prev.general, ...updates.general },
      };
      persistSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    persistSettings(defaultSettings);
  }, []);

  const value = useMemo<DemoData>(
    () => ({
      products: defaultProducts,
      forecasts: defaultForecasts,
      abcAnalysis: defaultAbcAnalysis,
      reports: defaultReports,
      settings,
      updateSettings,
      resetSettings,
    }),
    [settings, updateSettings, resetSettings],
  );

  return (
    <DemoDataContext.Provider value={value}>
      {children}
    </DemoDataContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useDemoData = (): DemoData => {
  const context = useContext(DemoDataContext);
  if (!context) {
    throw new Error('useDemoData must be used within a DemoDataProvider');
  }
  return context;
};

/**
 * Safe accessor that returns null when outside DemoDataProvider.
 * Used by data hooks to determine if demo data should be returned.
 */
export const useDemoDataContext = (): DemoData | null => {
  return useContext(DemoDataContext);
};
