import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { authenticate } from "~/lib/shopify/server";
import {
  Frame,
  Navigation,
  Page,
  Banner,
  Card,
  Text,
  Button,
  Layout,
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
  const url = new URL(request.url);
  const isEmbeddedRequest = url.searchParams.has("shop") && url.searchParams.has("embedded");

  // Try Shopify authentication, fall back gracefully if no session
  let shopDomain: string | null = null;
  try {
    const { session } = await authenticate.admin(request);
    shopDomain = session.shop;
  } catch (error) {
    // Never re-throw auth redirects from the app layout.
    // Let child routes handle their own auth requirements.
    shopDomain = null;
  }
  return json({ shopDomain });
};

export default function AppLayout() {
  const { shopDomain } = useLoaderData<typeof loader>();
  const location = useLocation();

  // Force full page navigation for embedded app links
  // (App Bridge intercepts <a> clicks, so we use window.location)
  const navigate = (url: string) => {
    window.location.href = url;
  };

  const navigationMarkup = (
    <Navigation location="/app">
      <Navigation.Section
        items={[
          {
            label: "Dashboard",
            url: "/app",
            icon: HomeIcon,
            selected: location.pathname === "/app",
            onClick: () => navigate("/app"),
          },
          {
            label: "Inventory",
            url: "/app/inventory",
            icon: PackageIcon,
            selected: location.pathname.startsWith("/app/inventory"),
            onClick: () => navigate("/app/inventory"),
          },
          {
            label: "Purchasing",
            url: "/app/purchasing",
            icon: CartIcon,
            selected: location.pathname.startsWith("/app/purchasing"),
            onClick: () => navigate("/app/purchasing"),
          },
          {
            label: "Forecasting",
            url: "/app/forecasting",
            icon: ClipboardIcon,
            selected: location.pathname.startsWith("/app/forecasting"),
            onClick: () => navigate("/app/forecasting"),
          },
          {
            label: "Reports",
            url: "/app/reports",
            icon: ChartVerticalIcon,
            selected: location.pathname.startsWith("/app/reports"),
            onClick: () => navigate("/app/reports"),
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
            onClick: () => navigate("/app/settings"),
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

/**
 * Error boundary for all /app/* routes. Catches loader/action errors
 * and renders a user-friendly error page instead of crashing.
 */
export function ErrorBoundary() {
  const error = useRouteError();

  let title = "Something went wrong";
  let message = "An unexpected error occurred. Please try again.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message =
      error.status === 404
        ? "The page you're looking for doesn't exist."
        : error.status === 403
          ? "You don't have permission to access this page."
          : "Something went wrong while loading this page.";
  } else if (error instanceof Error) {
    message = error.message || message;
  }

  return (
    <Frame>
      <Page title="Error">
        <Layout>
          <Layout.Section>
            <Card>
              <div className="p-6">
                <Banner tone="critical">
                  <p>{title}</p>
                </Banner>
                <div className="mt-4">
                  <Text variant="bodyMd" as="p">
                    {message}
                  </Text>
                </div>
                <div className="mt-4">
                  <Button primary url="/app">
                    Return to Dashboard
                  </Button>
                </div>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </Frame>
  );
}
