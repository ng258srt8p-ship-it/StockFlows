import type { LinksFunction, MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
  useNavigation,
  redirect,
} from "@remix-run/react";
import { AppProvider, Page, Layout, Card, Text, Button } from "@shopify/polaris";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";

import tailwindStylesHref from "./tailwind.css?url";
import polarisStylesHref from "@shopify/polaris/build/esm/styles.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwindStylesHref },
  { rel: "stylesheet", href: polarisStylesHref },
  {
    rel: "stylesheet",
    href: "https://cdn.shopify.com/shopifycloud/app-bridge-styles.css",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&display=swap",
  },
];

export const meta: MetaFunction = () => [
  { title: "StockFlows - Inventory Management" },
  { name: "description", content: "Smart inventory management for Shopify" },
  { charSet: "utf-8" },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
];

const i18n: Record<string, any> = {
  Polaris: {
    Common: {
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    },
  },
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  // Skip auth for local preview routes (dev only)
  if (url.pathname.startsWith("/preview") || url.pathname.startsWith("/_preview")) {
    return null;
  }

  // Skip auth for auth-related routes (handled by their own loaders)
  if (url.pathname.startsWith("/auth")) {
    return null;
  }

  // Skip auth for webhook routes (GET /webhooks?resync=true has its own auth)
  if (url.pathname === "/webhooks") {
    return null;
  }

  // Determine if this is an embedded Shopify request (has shop param from Shopify iframe)
  const isEmbeddedRequest = url.searchParams.has("shop") && url.searchParams.has("embedded");

  // Try to authenticate — if no session exists, just continue (child routes
  // will handle their own auth requirements).  This prevents the root layout
  // from crashing the entire app when there is no Shopify session.
  try {
    const { session } = await authenticate.admin(request);
    if (session && url.pathname === "/") {
      return redirect("/app");
    }
  } catch (error) {
    // Auth failed — check if we have a session for this shop in the database.
    // If yes, OAuth already completed but JWT validation failed (e.g., token expired).
    // Fall back gracefully and let child routes use the DB session directly.
    const shop = url.searchParams.get("shop");
    if (shop) {
      const existingShop = await prisma.shop.findUnique({
        where: { shopifyDomain: shop },
      });
      if (existingShop) {
        // Shop exists in DB — OAuth completed, JWT validation issue.
        // Continue to child routes which will use the DB session directly.
      } else {
        // Shop not in DB — needs OAuth. Redirect to /auth.
        const host = url.searchParams.get("host");
        if (host) {
          return redirect(`/auth?shop=${shop}&host=${host}&embedded=1`);
        }
      }
    }
    // Non-embedded request: fall back gracefully.
  }
  // Always redirect / to /app — child routes handle their own auth
  if (url.pathname === "/") {
    return redirect("/app");
  }
  return null;
};

export default function App() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="antialiased" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", backgroundColor: "#fafafa" }}>
        <AppProvider i18n={i18n}>
          {isLoading && (
            <div className="fixed top-0 left-0 right-0 h-1 bg-blue-600 animate-pulse z-50" />
          )}
          <Outlet />
        </AppProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error("[root.tsx] ErrorBoundary caught:", error);

  if (isRouteErrorResponse(error)) {
    return (
      <html lang="en">
        <head>
          <title>{`${error.status} ${error.statusText}`}</title>
          <Meta />
          <Links />
        </head>
        <body className="antialiased">
          <AppProvider i18n={i18n}>
            <Page title={`${error.status} ${error.statusText}`}>
              <Layout>
                <Layout.Section>
                  <Card>
                    <div className="text-center p-4">
                      <Text variant="headingLg" as="p">
                        {error.status}
                      </Text>
                      <Text variant="headingMd" as="p" tone="subdued">
                        {error.statusText}
                      </Text>
                      <Text variant="bodySm" as="p" tone="subdued">
                        {(error.data as { message?: string })?.message ??
                          "An unexpected error occurred."}
                      </Text>
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
          </AppProvider>
          <Scripts />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <title>Error</title>
        <Meta />
        <Links />
      </head>
      <body className="antialiased">
        <AppProvider i18n={i18n}>
          <Page title="Something went wrong">
            <Layout>
              <Layout.Section>
                <Card>
                  <div className="text-center p-4">
                    <Text variant="headingMd" as="p" tone="subdued">
                      An unexpected error occurred. Please try again or contact support.
                    </Text>
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
        </AppProvider>
        <Scripts />
      </body>
    </html>
  );
}