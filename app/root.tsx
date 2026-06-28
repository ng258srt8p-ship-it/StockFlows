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
import { AppProvider } from "@shopify/polaris";
import { authenticate } from "~/lib/shopify/server";

import tailwindStylesHref from "./tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwindStylesHref },
  {
    rel: "stylesheet",
    href: "https://cdn.shopify.com/shopifycloud/app-bridge-styles.css",
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
  // For root path, if already authenticated, redirect to /app
  const { session } = await authenticate.admin(request);
  if (session) {
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
      <body className="bg-gray-50 antialiased">
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

  if (isRouteErrorResponse(error)) {
    return (
      <html lang="en">
        <head>
          <title>{`${error.status} ${error.statusText}`}</title>
          <Meta />
          <Links />
        </head>
        <body className="flex min-h-screen items-center justify-center bg-gray-50">
          <AppProvider i18n={i18n}>
            <div className="max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
              <h1 className="mb-2 text-5xl font-bold text-gray-900">
                {error.status}
              </h1>
              <p className="mb-1 text-lg font-medium text-gray-700">
                {error.statusText}
              </p>
              <p className="mb-6 text-sm text-gray-500">
                {(error.data as { message?: string })?.message ??
                  "An unexpected error occurred."}
              </p>
              <a
                href="/app"
                className="inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Return to Dashboard
              </a>
            </div>
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
      <body className="flex min-h-screen items-center justify-center bg-gray-50">
        <AppProvider i18n={i18n}>
          <div className="max-w-md rounded-lg border border-red-200 bg-white p-8 text-center shadow-sm">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Something went wrong
            </h1>
            <p className="mb-6 text-sm text-gray-500">
              An unexpected error occurred. Please try again or contact support.
            </p>
            <a
              href="/app"
              className="inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Return to Dashboard
            </a>
          </div>
        </AppProvider>
        <Scripts />
      </body>
    </html>
  );
}