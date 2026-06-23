import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
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
