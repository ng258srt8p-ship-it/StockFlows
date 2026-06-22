import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { authenticate } from "~/lib/shopify/server";
import {
  Frame,
  Navigation,
  Page,
} from "@shopify/polaris";
import {
  HomeIcon,
  PackageIcon,
  ClipboardIcon,
  ChartVerticalIcon,
  SettingsIcon,
  CartIcon,
} from "@shopify/polaris-icons";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  return json({ shopDomain: session.shop });
};

export default function AppLayout() {
  const { shopDomain } = useLoaderData<typeof loader>();
  const location = useLocation();

  const navigationMarkup = (
    <Navigation location="/app">
      <Navigation.Section
        items={[
          {
            label: "Dashboard",
            url: "/app",
            icon: HomeIcon,
            selected: location.pathname === "/app",
          },
          {
            label: "Inventory",
            url: "/app/inventory",
            icon: PackageIcon,
            selected: location.pathname.startsWith("/app/inventory"),
          },
          {
            label: "Purchasing",
            url: "/app/purchasing",
            icon: CartIcon,
            selected: location.pathname.startsWith("/app/purchasing"),
          },
          {
            label: "Forecasting",
            url: "/app/forecasting",
            icon: ClipboardIcon,
            selected: location.pathname.startsWith("/app/forecasting"),
          },
          {
            label: "Reports",
            url: "/app/reports",
            icon: ChartVerticalIcon,
            selected: location.pathname.startsWith("/app/reports"),
          },
        ]}
      />
      <Navigation.Section
        items={[
          {
            label: "Settings",
            url: "/app/settings",
            icon: SettingsIcon,
            selected: location.pathname.startsWith("/app/settings"),
          },
        ]}
      />
    </Navigation>
  );

  return (
    <Frame navigation={navigationMarkup}>
      <Outlet />
    </Frame>
  );
}
