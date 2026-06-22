/**
 * Index route -- redirects to the main app dashboard.
 *
 * The `/app` route tree contains the authenticated app shell.
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  // Preserve query params (e.g. shop, hmac from Shopify OAuth callback).
  const searchParams = url.searchParams.toString();
  const target = searchParams ? `/app?${searchParams}` : "/app";

  return redirect(target, 302);
};
