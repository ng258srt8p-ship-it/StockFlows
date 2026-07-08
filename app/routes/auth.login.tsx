/**
 * Auth login entry point.
 *
 * When Shopify redirects the merchant to install the app, it hits /auth/login.
 * This route triggers the OAuth redirect to Shopify's authorization page.
 */
import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/lib/shopify/server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    return await authenticate.admin(request);
  } catch (e) {
    if (e instanceof Response) {
      return e;
    }
    console.error("[auth.login] Error:", e);
    return new Response("Auth error — check Shopify configuration.", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
};
