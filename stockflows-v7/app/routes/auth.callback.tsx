/**
 * OAuth callback handler.
 *
 * Shopify redirects back here after the merchant authorizes the app.
 * This handles the token exchange and session creation.
 */
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/lib/shopify/server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    return await authenticate.admin(request);
  } catch (e) {
    if (e instanceof Response) {
      return e;
    }
    console.error("[auth.callback] Error:", e);
    throw e;
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    return await authenticate.admin(request);
  } catch (e) {
    if (e instanceof Response) {
      return e;
    }
    console.error("[auth.callback] Error:", e);
    throw e;
  }
};