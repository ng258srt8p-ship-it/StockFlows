import type { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async () => {
  return new Response(JSON.stringify({
    status: "alive",
    timestamp: new Date().toISOString(),
  }), {
    headers: { "Content-Type": "application/json" },
  });
};
