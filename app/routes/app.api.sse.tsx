import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/lib/shopify/server";
import { addSSEConnection, removeSSEConnection } from "~/lib/sse/manager.server";
import { logger } from "~/lib/logger";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request) as any;
  const shop = session.shop;

  const encoder = new TextEncoder();
  let client: ReturnType<typeof addSSEConnection>;

  const stream = new ReadableStream({
    start(controller) {
      client = addSSEConnection(shop, controller);

      // Send initial connection event
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ shopDomain: shop })}\n\n`)
      );

      // Heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30_000);

      // Clean up on close
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        removeSSEConnection(client);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
};
