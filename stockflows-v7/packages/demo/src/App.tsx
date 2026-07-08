import React from 'react';
import { useDemoStore } from './store/useStore';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './routes/Dashboard';
import InventoryList from './routes/InventoryList';
import PurchasingList from './routes/PurchasingList';
import Forecasting from './routes/Forecasting';
import Reports from './routes/reports';
import Settings from './routes/settings';
import Migration from './routes/migration';
import Onboarding from './routes/onboarding';
import Webhooks from './routes/webhooks';
import InventoryDetail from './routes/inventory/[id]';
import InventoryTransfer from './routes/inventory/transfer';
import InventoryAdjust from './routes/inventory/[id]/adjust';
import PurchasingDetail from './routes/purchasing/[id]';
import PurchasingReceive from './routes/purchasing/[id]/receive';
import PurchasingNew from './routes/purchasing/new';
import VendorsIndex from './routes/purchasing/vendors/index';
import VendorDetail from './routes/purchasing/vendors/[id]';
import SettingsNotifications from './routes/settings/notifications';
import SettingsIntegrations from './routes/settings/integrations';
import SettingsTeamMembers from './routes/settings/team-members';
import SettingsBilling from './routes/settings/billing';
import SettingsPreferences from './routes/settings/preferences';
import SettingsSecurity from './routes/settings/security';
import AuthLogin from './routes/auth/login';
import AuthCallback from './routes/auth/callback';
import Health from './routes/health';
import HealthReady from './routes/health/ready';
import ApiInventory from './routes/api/inventory';
import ApiInsights from './routes/api/insights';
import ApiSSE from './routes/api/sse';
import PreviewSettings from './routes/preview.settings';

type RouteKey =
  | 'dashboard' | 'inventory' | 'purchasing' | 'forecasting' | 'reports' | 'settings'
  | 'migration' | 'onboarding' | 'webhooks'
  | 'inventory-detail' | 'inventory-transfer' | 'inventory-adjust'
  | 'purchasing-detail' | 'purchasing-receive' | 'purchasing-new'
  | 'purchasing-vendors' | 'purchasing-vendor-detail'
  | 'settings-notifications' | 'settings-integrations' | 'settings-team-members' | 'settings-billing' | 'settings-preferences' | 'settings-security'
  | 'auth-login' | 'auth-callback'
  | 'health' | 'health-ready'
  | 'api-inventory' | 'api-insights' | 'api-sse'
  | 'preview-settings';

const routeMap: Record<RouteKey, React.FC> = {
  dashboard: Dashboard,
  inventory: InventoryList,
  purchasing: PurchasingList,
  forecasting: Forecasting,
  reports: Reports,
  settings: Settings,
  migration: Migration,
  onboarding: Onboarding,
  webhooks: Webhooks,
  'inventory-detail': InventoryDetail,
  'inventory-transfer': InventoryTransfer,
  'inventory-adjust': InventoryAdjust,
  'purchasing-detail': PurchasingDetail,
  'purchasing-receive': PurchasingReceive,
  'purchasing-new': PurchasingNew,
  'purchasing-vendors': VendorsIndex,
  'purchasing-vendor-detail': VendorDetail,
  'settings-notifications': SettingsNotifications,
  'settings-integrations': SettingsIntegrations,
  'settings-team-members': SettingsTeamMembers,
  'settings-billing': SettingsBilling,
  'settings-preferences': SettingsPreferences,
  'settings-security': SettingsSecurity,
  'auth-login': AuthLogin,
  'auth-callback': AuthCallback,
  health: Health,
  'health-ready': HealthReady,
  'api-inventory': ApiInventory,
  'api-insights': ApiInsights,
  'api-sse': ApiSSE,
  'preview-settings': PreviewSettings,
};

interface NavItem {
  key: RouteKey;
  label: string;
  icon: string;
  section?: string;
}

const navItems: NavItem[] = [
  // Core
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', section: 'Core' },
  { key: 'inventory', label: 'Inventory', icon: 'inventory_2', section: 'Core' },
  { key: 'purchasing', label: 'Purchasing', icon: 'shopping_cart', section: 'Core' },
  { key: 'forecasting', label: 'Forecasting', icon: 'trending_up', section: 'Core' },
  { key: 'reports', label: 'Reports', icon: 'bar_chart', section: 'Core' },

  // Inventory Sub-routes
  { key: 'inventory-detail', label: 'Inventory Detail', icon: 'info', section: 'Inventory' },
  { key: 'inventory-transfer', label: 'Stock Transfer', icon: 'swap_horiz', section: 'Inventory' },
  { key: 'inventory-adjust', label: 'Stock Adjust', icon: 'edit', section: 'Inventory' },

  // Purchasing Sub-routes
  { key: 'purchasing-new', label: 'New PO', icon: 'add_shopping_cart', section: 'Purchasing' },
  { key: 'purchasing-detail', label: 'PO Detail', icon: 'receipt_long', section: 'Purchasing' },
  { key: 'purchasing-receive', label: 'Receive PO', icon: 'local_shipping', section: 'Purchasing' },
  { key: 'purchasing-vendors', label: 'Vendors', icon: 'store', section: 'Purchasing' },
  { key: 'purchasing-vendor-detail', label: 'Vendor Detail', icon: 'business', section: 'Purchasing' },

  // Settings Sub-routes
  { key: 'settings', label: 'Settings', icon: 'settings', section: 'Settings' },
  { key: 'settings-notifications', label: 'Notifications', icon: 'notifications', section: 'Settings' },
  { key: 'settings-integrations', label: 'Integrations', icon: 'extension', section: 'Settings' },
  { key: 'settings-team-members', label: 'Team Members', icon: 'group', section: 'Settings' },
  { key: 'settings-billing', label: 'Billing', icon: 'credit_card', section: 'Settings' },
  { key: 'settings-preferences', label: 'Preferences', icon: 'tune', section: 'Settings' },
  { key: 'settings-security', label: 'Security', icon: 'shield', section: 'Settings' },

  // System
  { key: 'migration', label: 'Migration', icon: 'cloud_sync', section: 'System' },
  { key: 'onboarding', label: 'Onboarding', icon: 'rocket_launch', section: 'System' },
  { key: 'webhooks', label: 'Webhooks', icon: 'webhook', section: 'System' },
  { key: 'health', label: 'Health', icon: 'monitor_heart', section: 'System' },
  { key: 'health-ready', label: 'Health Ready', icon: 'check_circle', section: 'System' },

  // Auth
  { key: 'auth-login', label: 'Login', icon: 'login', section: 'Auth' },
  { key: 'auth-callback', label: 'Callback', icon: 'sync', section: 'Auth' },

  // API
  { key: 'api-inventory', label: 'API: Inventory', icon: 'api', section: 'API' },
  { key: 'api-insights', label: 'API: Insights', icon: 'psychology', section: 'API' },
  { key: 'api-sse', label: 'API: SSE', icon: 'cell_tower', section: 'API' },

  // Preview
  { key: 'preview-settings', label: 'Preview Settings', icon: 'preview', section: 'Preview' },
];

const App: React.FC = () => {
  const activeRoute = useDemoStore((s) => s.activeRoute);
  const setActiveRoute = useDemoStore((s) => s.setActiveRoute);

  const ActiveComponent = routeMap[activeRoute as RouteKey] || Dashboard;

  return (
    <ErrorBoundary>
      <div className="flex h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {/* Sidebar */}
        <aside className="w-64 shrink-0 flex flex-col border-r" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-secondary)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              <span style={{ color: 'var(--accent)' }}>Stock</span>Flows <span className="text-xs font-normal" style={{ color: 'var(--text-tertiary)' }}>v7 Demo</span>
            </h1>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {navItems.map((item, idx) => {
              const prevItem = navItems[idx - 1];
              const showSection = !prevItem || prevItem.section !== item.section;

              return (
                <React.Fragment key={item.key}>
                  {showSection && item.section && (
                    <div className="pt-4 pb-1 px-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                      {item.section}
                    </div>
                  )}
                  <button
                    onClick={() => setActiveRoute(item.key)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: activeRoute === item.key ? 'var(--accent)' : 'transparent',
                      color: activeRoute === item.key ? 'var(--bg-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    {item.label}
                  </button>
                </React.Fragment>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <ActiveComponent />
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;
