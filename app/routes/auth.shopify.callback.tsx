/**
 * Shopify OAuth callback handler.
 *
 * Alternative callback path used by Shopify's managed install flow.
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
    console.error("[auth.shopify.callback] Error:", e);
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
    console.error("[auth.shopify.callback] Error:", e);
    throw e;
  }
};