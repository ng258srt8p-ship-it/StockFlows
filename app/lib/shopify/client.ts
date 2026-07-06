/**
 * Reusable GraphQL Admin API client with throttle awareness.
 *
 * Wraps `admin.graphql()` from @shopify/shopify-app-remix with:
 * - Automatic throttle tracking via response extension cost data
 * - Pre-request throttling when bucket capacity is low
 * - Exponential backoff on rate-limit / server errors (max 3 retries)
 *
 * Usage:
 *   import { ApiVersion, shopifyGraphQL } from "~/lib/shopify/client";
 *   const data = await shopifyGraphQL(session, MY_QUERY, { first: 10 });
 */

import type { Session } from "@shopify/shopify-api";
import { ApiVersion } from "@shopify/shopify-api";
import { ApiVersion, logger } from "~/lib/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Subset of Shopify's cost.throttleStatus we actually read. */
export interface ThrottleStatus {
  /** Maximum available bucket capacity (typically 1 000). */
  maximumAvailable: number;
  /** Currently available request allowance. */
  currentlyAvailable: number;
  /** Restore rate — units restored per second. */
  restoreRate: number;
}

/** Parsed result of a GraphQL call. */
export interface GraphQLResult<T = Record<string, unknown>> {
  data: T;
  errors?: Array<{ message: string; locations?: unknown; path?: unknown }>;
}

/** The response extensions.cost object returned by the Admin API. */
interface CostExtension {
  requestedQueryCost: number;
  actualQueryCost: number | null;
  throttleStatus: ThrottleStatus;
}

/** JSON shape returned by `admin.graphql()` after `.json()`. */
interface AdminGraphQLResponse<T = Record<string, unknown>> {
  data: T;
  errors?: Array<{ message: string }>;
  extensions?: {
    cost?: CostExtension;
  };
}

// ---------------------------------------------------------------------------
// Throttle state (per-process singleton — shared across all requests)
// ---------------------------------------------------------------------------

/** Minimum `currentlyAvailable` before we proactively wait. */
const THROTTLE_THRESHOLD = 50;

/** The latest throttle status seen from the Admin API. */
let lastThrottleStatus: ThrottleStatus | null = null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const log = logger.child({ module: "shopify/client" });

/**
 * Sleep for `ms` milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate the recommended wait time (ms) based on the current throttle
 * bucket.  Returns 0 when no wait is needed.
 */
function recommendedWait(status: ThrottleStatus | null): number {
  if (!status) return 0;
  if (status.currentlyAvailable >= THROTTLE_THRESHOLD) return 0;

  // Time to restore enough tokens to cross the threshold again.
  const deficit = THROTTLE_THRESHOLD - status.currentlyAvailable;
  return Math.ceil((deficit / status.restoreRate) * 1000);
}

/**
 * Handle errors that should trigger a retry (rate-limit / 5xx).
 */
function isRetryableStatus(error: unknown): boolean {
  if (error instanceof Response) {
    return [429, 500, 502, 503].includes(error.status);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

const MAX_RETRIES = 3;

/**
 * Execute a GraphQL query against the Shopify Admin API.
 *
 * @param session  - Active Shopify session (contains shop + accessToken).
 * @param query    - GraphQL query string.
 * @param variables - Optional query variables.
 * @returns        - Parsed response data (unwrapped from `response.data`).
 * @throws         - Rethrows after exhausting retries.
 */
export async function shopifyGraphQL<T = Record<string, unknown>>(
  session: Session,
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  // Dynamic import to avoid circular dependency — server.ts exports `authenticate`
  // which depends on shopifyApp, and we do not want a hard cycle here.
  // However, the caller is expected to pass a session; we resolve `admin` via
  // the remix helper outside this module. Instead, we use the low-level
  // `shopify.clients.graphql` approach — but since the remix package manages
  // authentication internally, callers should use `admin.graphql()` directly
  // and fall back to this wrapper only when they need throttle tracking.
  //
  // Because `admin.graphql()` is the canonical way in @shopify/shopify-app-remix,
  // this function accepts a simple `fetch`-style executor that callers provide.
  // For convenience we also support passing the `admin` object directly.

  // We re-export via a slightly different API: callers pass in an `execute`
  // function that already wraps `admin.graphql(...)`.  See inventory.ts for
  // the concrete usage pattern.

  // --- Direct session-based path using the Shopify REST/GraphQL client ---
  // Build the access token header ourselves for maximum flexibility.
  const shop = session.shop;
  const accessToken = session.accessToken;

  if (!accessToken) {
    throw new Error(`No access token for shop ${shop}`);
  }

  // Pre-flight throttle wait
  const waitMs = recommendedWait(lastThrottleStatus);
  if (waitMs > 0) {
    log.debug(
      { waitMs, currentlyAvailable: lastThrottleStatus?.currentlyAvailable },
      "Throttled — waiting before next request"
    );
    await sleep(waitMs);
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const url = `https://${shop}/admin/api/${'2026-07'}/graphql.json`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({ query, variables }),
      });

      // Parse throttle status from extensions
      const body = (await response.json()) as AdminGraphQLResponse<T>;

      if (body.extensions?.cost?.throttleStatus) {
        lastThrottleStatus = body.extensions.cost.throttleStatus;

        log.debug(
          {
            queryCost: body.extensions.cost.actualQueryCost,
            available: lastThrottleStatus.currentlyAvailable,
            restoreRate: lastThrottleStatus.restoreRate,
          },
          "GraphQL cost recorded"
        );
      }

      // Handle GraphQL-level errors
      if (body.errors && body.errors.length > 0) {
        const isThrottle = body.errors.some((e) =>
          e.message.includes("Throttled") || e.message.includes("rate limit")
        );

        if (isThrottle && attempt < MAX_RETRIES) {
          const backoff = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          log.warn(
            { attempt, backoff, errors: body.errors },
            "Throttled by Shopify — retrying with backoff"
          );
          await sleep(backoff);
          continue;
        }

        throw new ShopifyGraphQLError(body.errors, shop);
      }

      return body.data;
    } catch (error) {
      lastError = error;

      // If it is a retryable HTTP error and we have retries left, backoff
      if (isRetryableStatus(error) && attempt < MAX_RETRIES) {
        const backoff = Math.pow(2, attempt) * 1000;
        log.warn(
          { attempt, backoff, status: (error as Response).status },
          "Retryable HTTP error — retrying with backoff"
        );
        await sleep(backoff);
        continue;
      }

      throw error;
    }
  }

  // Should not reach here, but satisfy TypeScript
  throw lastError;
}

// ---------------------------------------------------------------------------
// Alternative: executor-style wrapper (for use with admin.graphql)
// ---------------------------------------------------------------------------

/**
 * Execute a GraphQL query via the `admin` object from `authenticate.admin()`.
 * This preserves the Remix session-managed auth and reads throttle status
 * from the response extensions.
 *
 * @param execute  - The `admin.graphql(query, { variables })` function.
 * @param query    - GraphQL query string.
 * @param variables - Optional query variables.
 * @returns        - Parsed response data.
 */
export async function shopifyGraphQLWithAdmin<T = Record<string, unknown>>(
  execute: (query: string, options?: { variables?: Record<string, unknown> }) => Promise<Response>,
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  // Pre-flight throttle wait
  const waitMs = recommendedWait(lastThrottleStatus);
  if (waitMs > 0) {
    log.debug(
      { waitMs, currentlyAvailable: lastThrottleStatus?.currentlyAvailable },
      "Throttled — waiting before next request"
    );
    await sleep(waitMs);
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await execute(query, { variables });
      const body = (await response.json()) as AdminGraphQLResponse<T>;

      // Track throttle status
      if (body.extensions?.cost?.throttleStatus) {
        lastThrottleStatus = body.extensions.cost.throttleStatus;

        log.debug(
          {
            queryCost: body.extensions.cost.actualQueryCost,
            available: lastThrottleStatus.currentlyAvailable,
            restoreRate: lastThrottleStatus.restoreRate,
          },
          "GraphQL cost recorded (admin)"
        );
      }

      // Handle GraphQL-level throttle errors
      if (body.errors && body.errors.length > 0) {
        const isThrottle = body.errors.some((e) =>
          e.message.includes("Throttled") || e.message.includes("rate limit")
        );

        if (isThrottle && attempt < MAX_RETRIES) {
          const backoff = Math.pow(2, attempt) * 1000;
          log.warn(
            { attempt, backoff, errors: body.errors },
            "Throttled — retrying with backoff (admin)"
          );
          await sleep(backoff);
          continue;
        }

        throw new ShopifyGraphQLError(body.errors, "<admin>");
      }

      return body.data;
    } catch (error) {
      lastError = error;

      if (isRetryableStatus(error) && attempt < MAX_RETRIES) {
        const backoff = Math.pow(2, attempt) * 1000;
        log.warn(
          { attempt, backoff, status: (error as Response).status },
          "Retryable HTTP error — retrying with backoff (admin)"
        );
        await sleep(backoff);
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

// ---------------------------------------------------------------------------
// Custom error
// ---------------------------------------------------------------------------

export class ShopifyGraphQLError extends Error {
  public readonly errors: Array<{ message: string }>;
  public readonly shop: string;

  constructor(errors: Array<{ message: string }>, shop: string) {
    const summary = errors.map((e) => e.message).join("; ");
    super(`Shopify GraphQL error for ${shop}: ${summary}`);
    this.name = "ShopifyGraphQLError";
    this.errors = errors;
    this.shop = shop;
  }
}
