import type { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async () => {
  return Response.json({
    status: "alive",
    timestamp: new Date().toISOString(),
  });
};
