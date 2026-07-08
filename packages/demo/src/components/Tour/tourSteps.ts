export interface TourStep {
  id: string;
  title: string;
  text: string;
  attachTo: string;
  route?: string;
  buttons?: string[];
}

export const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to StockFlows v7',
    text: 'This is a fully interactive demo of StockFlows — an inventory management platform built for Shopify merchants. Let us show you around.',
    attachTo: '.tour-target-logo',
  },
  {
    id: 'sidebar',
    title: 'Navigation',
    text: 'Use the sidebar to navigate between Dashboard, Inventory, Purchasing, Forecasting, and Reports.',
    attachTo: '.tour-target-sidebar',
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    text: 'The dashboard gives you a real-time overview of your inventory health — total SKUs, stock value, alerts, and pending purchase orders.',
    attachTo: '.tour-target-content',
    route: 'dashboard',
  },
  {
    id: 'inventory',
    title: 'Inventory Management',
    text: 'Search, filter, and manage every SKU across locations. See stock status, velocity indicators, and reorder points at a glance.',
    attachTo: '.tour-target-content',
    route: 'inventory',
  },
  {
    id: 'purchasing',
    title: 'Purchase Orders',
    text: 'Create and track purchase orders from draft to receiving. Monitor vendor performance and order status.',
    attachTo: '.tour-target-content',
    route: 'purchasing',
  },
  {
    id: 'forecasting',
    title: 'AI Forecasting',
    text: 'AI-powered demand predictions using ETS, linear regression, and moving average models with confidence scores.',
    attachTo: '.tour-target-content',
    route: 'forecasting',
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    text: 'Generate inventory summaries, PO reports, forecast accuracy, and vendor performance — all exportable as CSV or PDF.',
    attachTo: '.tour-target-content',
    route: 'reports',
  },
  {
    id: 'complete',
    title: 'You are all set!',
    text: 'Explore the demo freely. Try adjusting stock, creating purchase orders, or checking vendor details.',
    attachTo: '.tour-target-content',
  },
];
