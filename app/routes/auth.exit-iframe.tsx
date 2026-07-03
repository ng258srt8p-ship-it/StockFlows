/**
 * Auth exit-iframe route.
 *
 * The Shopify library handles this route internally via authenticate.admin().
 * We just call authenticate.admin() and it renders the App Bridge page
 * that breaks out of the iframe using window.open().
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
    console.error("[auth.exit-iframe] Error:", e);
    throw e;
  }
};
