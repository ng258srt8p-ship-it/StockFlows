import '@shopify/polaris/build/esm/styles.css';
import './styles/variables.css';
import './styles/global.css';
import './styles/polaris-overrides.css';

// Components
export { Button } from './components/Button/Button';
export { Card, ShadowBevel, Box } from './components/Card/Card';
export { IndexTable } from './components/IndexTable/IndexTable';
export { Badge } from './components/Badge/Badge';
export { Navigation } from './components/Navigation/Navigation';
export { PageHeader } from './components/PageHeader/PageHeader';
export { EmptyState } from './components/EmptyState/EmptyState';
export { KpiCard } from './components/KpiCard/KpiCard';
export { ForecastCard } from './components/ForecastCard/ForecastCard';
export { AbcLegend } from './components/AbcLegend/AbcLegend';
export { SettingsCard } from './components/SettingsCard/SettingsCard';
export { Select } from './components/Select/Select';
export { TextField } from './components/TextField/TextField';
export { Checkbox } from './components/Checkbox/Checkbox';
export { Modal } from './components/Modal/Modal';
export { Tooltip } from './components/Tooltip/Tooltip';
export { Popover } from './components/Popover/Popover';
export { Dropdown } from './components/Dropdown/Dropdown';
export { Tabs } from './components/Tabs/Tabs';
export { Toast } from './components/Toast/Toast';
export { Spinner } from './components/Spinner/Spinner';
export { Layout, LayoutSection, LayoutAnnotatedSection } from './components/Layout/Layout';
export { Avatar } from './components/Avatar/Avatar';
export { TourStep } from './components/TourStep/TourStep';
export { TourProvider, useTourContext } from './components/Tour/TourProvider';
export { TourOverlay } from './components/Tour/TourOverlay';
export { TOUR_STEPS } from './components/Tour/TourSteps';
export { ProgressBar } from './components/ProgressBar/ProgressBar';
export { Divider } from './components/Divider/Divider';

// Types
export type { Product, Forecast, AbcItem, AbcAnalysis, ReportsData, SettingsData } from './types';

// Data
export { products, forecasts, abcAnalysis, reports, settings } from './data';

// Context
export { DemoDataProvider, useDemoData, useDemoDataContext, isDemoMode, demoActions } from './context/DemoDataContext';
export type { DemoData, DemoDataProviderProps, DemoActionToast, DemoActions } from './context/DemoDataContext';

// Hooks
export { useInventoryData } from './hooks/useInventoryData';
export type { UseInventoryDataResult } from './hooks/useInventoryData';

export { useForecastData } from './hooks/useForecastData';
export type { UseForecastDataResult, ForecastSummary } from './hooks/useForecastData';

export { usePurchaseOrders } from './hooks/usePurchaseOrders';
export type { UsePurchaseOrdersResult, PurchaseOrder, POStatus, POLineItem } from './hooks/usePurchaseOrders';

export { useReportsData } from './hooks/useReportsData';
export type { UseReportsDataResult } from './hooks/useReportsData';

export { useSettingsData } from './hooks/useSettingsData';
export type { UseSettingsDataResult } from './hooks/useSettingsData';

export { useTourManager } from './hooks/useTour';
export type { UseTourManagerResult, UseTourManagerOptions, TourStepConfig } from './hooks/useTour';

// Re-export type aliases for consumers
export type { NavigationItem, NavigationProps } from './components/Navigation/Navigation';
export type { KpiCardProps } from './components/KpiCard/KpiCard';
export type { ForecastCardProps } from './components/ForecastCard/ForecastCard';
export type { BadgeProps } from './components/Badge/Badge';
export type { ButtonProps } from './components/Button/Button';
export type { ModalProps } from './components/Modal/Modal';
export type { TooltipProps } from './components/Tooltip/Tooltip';
export type { PopoverProps } from './components/Popover/Popover';
export type { DropdownProps, DropdownAction, DropdownSection } from './components/Dropdown/Dropdown';
export type { TabsProps, TabItem } from './components/Tabs/Tabs';
export type { ToastProps, ToastAction } from './components/Toast/Toast';
export type { SpinnerProps } from './components/Spinner/Spinner';
export type { AvatarProps } from './components/Avatar/Avatar';
export type { SelectProps, SelectOption } from './components/Select/Select';
export type { TextFieldProps } from './components/TextField/TextField';
export type { CheckboxProps } from './components/Checkbox/Checkbox';
export type { SettingsCardProps } from './components/SettingsCard/SettingsCard';
export type { PageHeaderProps } from './components/PageHeader/PageHeader';
export type { EmptyStateProps } from './components/EmptyState/EmptyState';
export type { AbcLegendProps } from './components/AbcLegend/AbcLegend';
export type { LayoutProps, LayoutSectionProps, LayoutAnnotatedSectionProps } from './components/Layout/Layout';
export type { TourStepProps, TourStepPosition } from './components/TourStep/TourStep';
export type { TourProviderProps, TourContextValue } from './components/Tour/TourProvider';
export type { TourStepDefinition } from './components/Tour/TourSteps';
export type { ProgressBarProps } from './components/ProgressBar/ProgressBar';
export type { DividerProps } from './components/Divider/Divider';