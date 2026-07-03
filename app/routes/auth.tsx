/**
 * Auth entry point.
 *
 * When Shopify redirects the merchant to install the app, it hits /auth.
 * This route triggers the OAuth redirect to Shopify's authorization page.
 *
 * FIX: The Shopify library's handleAuthBeginRequest checks Sec-Fetch-Dest: iframe
 * and redirects to exit-iframe, creating an infinite loop for embedded apps.
 * We strip this header so the library correctly redirects to Shopify OAuth.
 */
import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/lib/shopify/server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Strip Sec-Fetch-Dest header to prevent the library from detecting
  // this as an iframe request and redirecting to exit-iframe (loop).
  const cleanHeaders = new Headers(request.headers);
  cleanHeaders.delete("sec-fetch-dest");

  const cleanRequest = new Request(request.url, {
    method: request.method,
    headers: cleanHeaders,
    body: request.body,
  });

  try {
    return await authenticate.admin(cleanRequest);
  } catch (e) {
    if (e instanceof Response) {
      return e;
    }
    console.error("[auth] Error:", e);
    throw e;
  }
};
