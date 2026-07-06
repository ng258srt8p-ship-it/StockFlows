export interface TourStepDefinition {
  id: string;
  target: string;
  title: string;
  text: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export const TOUR_STEPS: TourStepDefinition[] = [
  {
    id: 'welcome',
    target: '.sf-tour-welcome',
    title: 'Welcome to StockFlows',
    text: 'This guided tour will walk you through the key features of the app.',
    position: 'bottom',
  },
  {
    id: 'dashboard',
    target: '.sf-tour-dashboard',
    title: 'Dashboard',
    text: 'View your key inventory metrics and performance at a glance.',
    position: 'bottom',
  },
  {
    id: 'inventory',
    target: '.sf-tour-inventory',
    title: 'Inventory Management',
    text: 'Track stock levels, manage products, and monitor SKU performance.',
    position: 'bottom',
  },
  {
    id: 'purchasing',
    target: '.sf-tour-purchasing',
    title: 'Purchasing',
    text: 'Create and manage purchase orders to replenish inventory.',
    position: 'bottom',
  },
  {
    id: 'forecasting',
    target: '.sf-tour-forecasting',
    title: 'Demand Forecasting',
    text: 'AI-powered forecasts help you predict demand and avoid stockouts.',
    position: 'bottom',
  },
  {
    id: 'reports',
    target: '.sf-tour-reports',
    title: 'Reports & Analytics',
    text: 'Dive into ABC analysis, turnover rates, and custom reports.',
    position: 'bottom',
  },
  {
    id: 'settings',
    target: '.sf-tour-settings',
    title: 'Settings',
    text: 'Configure supplier defaults, lead times, and notification preferences.',
    position: 'bottom',
  },
];
