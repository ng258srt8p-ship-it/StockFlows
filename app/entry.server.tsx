import { PassThrough } from "node:stream";

import type { AppLoadContext, EntryContext } from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import * as Sentry from "@sentry/remix";

// Global uncaughtException handler for ioredis connection errors
// These are non-fatal when Redis is not configured (workers gracefully degrade)
process.on("uncaughtException", (error) => {
  if (error?.message?.includes("ioredis") || error?.constructor?.name === "AggregateError") {
    // Silently ignore ioredis connection errors
    return;
  }
  // Re-throw for all other uncaught exceptions
  throw error;
});

// Import job workers — they start listening when Redis is configured
import "~/lib/jobs/index.server";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});

const ABORT_DELAY = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  _loadContext: AppLoadContext
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const userAgent = request.headers.get("user-agent");

    const { pipe, abort } = renderToPipeableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
        abortDelay={ABORT_DELAY}
      />,
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        },
      }
    );

    if (isbot(userAgent ?? "")) {
      // Bot requests: wait for all content before responding
    } else {
      // Human requests: abort after delay for streaming
      setTimeout(abort, ABORT_DELAY);
    }
  });
}
