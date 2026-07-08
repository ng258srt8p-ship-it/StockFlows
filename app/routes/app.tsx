import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useLocation, useNavigate, Outlet } from "@remix-run/react";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import { useEffect, useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let session: any = null;
  try {
    const auth = await authenticate.admin(request);
    session = auth.session;
  } catch (error) {
    session = null;
  }

  let shop;
  if (session) {
    shop = await prisma.shop.findUnique({
      where: { shopifyDomain: session.shop },
    });
  } else {
    shop =
      (await prisma.shop.findUnique({
        where: { shopifyDomain: "stockflows2.myshopify.com" },
      })) ??
      (await prisma.shop.findFirst());
  }

  return json({
    shopName: shop?.shopifyDomain?.replace(".myshopify.com", "") ?? "StockFlows",
  });
};

export default function AppLayout() {
  const { shopName } = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const path = location.pathname;
  // Extract the route key from path for active detection: /app/inventory → inventory, /app/purchasing/vendors → purchasing/vendors, /health → health
  const routePath = path.startsWith("/app/") ? path.slice(5) : path.slice(1);

  useEffect(() => {
    setSidebarOpen(false);
  }, [path]);

  interface NavItem {
    key: string;
    label: string;
    icon: string;
    section: string;
    /** full absolute path if outside /app/ */
    href?: string;
  }

  const sections = ["Core", "Inventory", "Purchasing", "Settings", "System", "Auth", "API", "Preview"];

  const navItems: NavItem[] = [
    // ── Core ──
    { key: "",      label: "Dashboard",        icon: "dashboard",         section: "Core" },
    { key: "inventory",     label: "Inventory",          icon: "inventory_2",       section: "Core" },
    { key: "purchasing",    label: "Purchasing",         icon: "shopping_cart",     section: "Core" },
    { key: "forecasting",   label: "Forecasting",        icon: "trending_up",       section: "Core" },
    { key: "reports",       label: "Reports",            icon: "bar_chart",         section: "Core" },

    // ── Inventory ──
    { key: "inventory",              label: "Inventory Detail",   icon: "info",            section: "Inventory" },
    { key: "inventory/transfer",     label: "Stock Transfer",     icon: "swap_horiz",      section: "Inventory" },
    { key: "inventory",              label: "Stock Adjust",       icon: "edit",            section: "Inventory" },

    // ── Purchasing ──
    { key: "purchasing/new",         label: "New PO",             icon: "add_shopping_cart", section: "Purchasing" },
    { key: "purchasing",             label: "PO Detail",          icon: "receipt_long",      section: "Purchasing" },
    { key: "purchasing",             label: "Receive PO",         icon: "local_shipping",    section: "Purchasing" },
    { key: "purchasing/vendors",     label: "Vendors",            icon: "store",             section: "Purchasing" },
    { key: "purchasing/vendors",     label: "Vendor Detail",      icon: "business",          section: "Purchasing" },

    // ── Settings ──
    { key: "settings",    label: "Settings",        icon: "settings",          section: "Settings" },
    { key: "settings",    label: "Notifications",   icon: "notifications",     section: "Settings" },
    { key: "settings",    label: "Integrations",    icon: "extension",         section: "Settings" },
    { key: "settings",    label: "Team Members",    icon: "group",             section: "Settings" },
    { key: "settings",    label: "Billing",         icon: "credit_card",       section: "Settings" },
    { key: "settings",    label: "Preferences",     icon: "tune",              section: "Settings" },
    { key: "settings",    label: "Security",        icon: "shield",            section: "Settings" },

    // ── System ──
    { key: "migration",   label: "Migration",       icon: "cloud_sync",        section: "System" },
    { key: "onboarding",  label: "Onboarding",      icon: "rocket_launch",     section: "System" },
    { key: "",            label: "Webhooks",        icon: "webhook",           section: "System", href: "/webhooks" },
    { key: "",            label: "Health",          icon: "monitor_heart",     section: "System", href: "/health" },
    { key: "",            label: "Health Ready",    icon: "check_circle",      section: "System", href: "/health/ready" },

    // ── Auth ──
    { key: "",            label: "Login",           icon: "login",             section: "Auth", href: "/auth/login" },
    { key: "",            label: "Callback",        icon: "sync",              section: "Auth", href: "/auth/callback" },

    // ── API ──
    { key: "api/inventory",  label: "API: Inventory",  icon: "api",             section: "API" },
    { key: "api/insights",   label: "API: Insights",   icon: "psychology",      section: "API" },
    { key: "api/sse",        label: "API: SSE",        icon: "cell_tower",      section: "API" },

    // ── Preview ──
    { key: "",                label: "Preview Settings", icon: "preview",       section: "Preview", href: "/preview/settings" },
  ];

  const isActive = (item: NavItem): boolean => {
    if (item.href) return path === item.href;
    if (item.key === "") return path === "/app" || path === "/app/";
    return path === `/app/${item.key}` || path.startsWith(`/app/${item.key}/`);
  };

  const isInSection = (section: string): boolean => {
    return navItems.some((i) => i.section === section);
  };

  const handleNavClick = (item: NavItem) => {
    if (item.href) {
      navigate(item.href);
    } else if (item.key === "") {
      navigate("/app");
    } else {
      navigate(`/app/${item.key}`);
    }
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg md:hidden"
        style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }}
        aria-label="Toggle sidebar"
      >
        <span className="material-symbols-outlined">{sidebarOpen ? "close" : "menu"}</span>
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 flex flex-col border-r transform transition-transform duration-200 ease-in-out overflow-hidden
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:z-auto
        `}
        style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-secondary)" }}
      >
        {/* Branding */}
        <div className="p-4 border-b flex-shrink-0" style={{ borderColor: "var(--border-default)" }}>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            <span style={{ color: "var(--accent)" }}>Stock</span>Flows{" "}
            <span className="text-xs font-normal" style={{ color: "var(--text-tertiary)" }}>
              v7
            </span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {sections.map((section) => {
            if (!isInSection(section)) return null;
            const sectionItems = navItems.filter((i) => i.section === section);
            return (
              <div key={section}>
                <div
                  className="pt-4 pb-1 px-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {section}
                </div>
                {sectionItems.map((item) => {
                  const active = isActive(item);
                  return (
                    <button
                      key={`${item.section}-${item.label}`}
                      onClick={() => handleNavClick(item)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: active ? "var(--accent)" : "transparent",
                        color: active ? "var(--bg-primary)" : "var(--text-secondary)",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                      }}
                      onMouseLeave={(e) => {
                        if (!active) e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t flex-shrink-0" style={{ borderColor: "var(--border-default)" }}>
          <div className="text-xs px-3" style={{ color: "var(--text-tertiary)" }}>
            {shopName}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
