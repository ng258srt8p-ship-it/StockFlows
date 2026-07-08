import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useLocation, useNavigate, Outlet } from "@remix-run/react";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import { useEffect, useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const isEmbeddedRequest = url.searchParams.has("shop") && url.searchParams.has("embedded");

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
      include: { settings: true },
    });
  } else {
    shop =
      (await prisma.shop.findUnique({
        where: { shopifyDomain: "stockflows2.myshopify.com" },
        include: { settings: true },
      })) ??
      (await prisma.shop.findFirst({
        include: { settings: true },
      }));
  }

  return json({
    shopName: shop?.shopifyDomain?.replace(".myshopify.com", "") ?? "StockFlows",
    shopDomain: session?.shop ?? null,
    isEmbedded: isEmbeddedRequest,
  });
};

export default function AppLayout() {
  const { shopName } = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const path = location.pathname.replace(/^\/app\/?/, "").replace(/^\/app$/, "");
  const activeRoute = path || "dashboard";

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  interface NavItem {
    key: string;
    label: string;
    icon: string;
    section: string;
  }

  const navItems: NavItem[] = [
    { key: "dashboard", label: "Dashboard", icon: "dashboard", section: "Core" },
    { key: "inventory", label: "Inventory", icon: "inventory_2", section: "Core" },
    { key: "purchasing", label: "Purchasing", icon: "shopping_cart", section: "Core" },
    { key: "forecasting", label: "Forecasting", icon: "trending_up", section: "Core" },
    { key: "reports", label: "Reports", icon: "bar_chart", section: "Core" },
    { key: "settings", label: "Settings", icon: "settings", section: "Settings" },
  ];

  const handleNavClick = (key: string) => {
    navigate(`/app/${key === "dashboard" ? "" : key}`);
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
          fixed inset-y-0 left-0 z-40 w-64 flex flex-col border-r transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:z-auto
        `}
        style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-secondary)" }}
      >
        {/* Branding */}
        <div className="p-4 border-b" style={{ borderColor: "var(--border-default)" }}>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            <span style={{ color: "var(--accent)" }}>Stock</span>Flows{" "}
            <span className="text-xs font-normal" style={{ color: "var(--text-tertiary)" }}>
              v7
            </span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item, idx) => {
            const prevItem = navItems[idx - 1];
            const showSection = !prevItem || prevItem.section !== item.section;
            const isActive = activeRoute === item.key;

            return (
              <div key={item.key}>
                {showSection && item.section && (
                  <div
                    className="pt-4 pb-1 px-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {item.section}
                  </div>
                )}
                <button
                  onClick={() => handleNavClick(item.key)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: isActive ? "var(--accent)" : "transparent",
                    color: isActive ? "var(--bg-primary)" : "var(--text-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  {item.label}
                </button>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t" style={{ borderColor: "var(--border-default)" }}>
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
