/**
 * Webhook registration, verification, and management helpers.
 *
 * Mirrors the topics defined in `shopify.app.toml` and provides:
 *   - HMAC signature verification (backup for when `authenticate.webhook` is
 *     not used, e.g. custom webhook endpoints or testing).
 *   - Programmatic webhook registration via the Admin API.
 *   - A guard function that checks registered topics and re-registers if any
 *     are missing.
 *
 * Usage:
 *   import { ApiVersion, verifyWebhook, REGISTERED_TOPICS } from "~/lib/shopify/webhooks";
 */

import crypto from "node:crypto";
import type { Session } from "@shopify/shopify-api";
import { ApiVersion } from "@shopify/shopify-api";
import { ApiVersion, prisma } from "~/lib/db/client";
import { ApiVersion, logger } from "~/lib/logger";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * All webhook topics registered in `shopify.app.toml`.
 * Kept in sync with the `[[webhooks.subscriptions]].topics` list.
 */
export const REGISTERED_TOPICS: string[] = [
  "inventory_levels/update",
  "inventory_levels/connect",
  "inventory_levels/disconnect",
  "inventory_items/create",
  "inventory_items/update",
  "inventory_items/delete",
  "variants/in_stock",
  "variants/out_of_stock",
  "locations/create",
  "locations/update",
  "locations/delete",
  "products/create",
  "products/update",
  "app/uninstalled",
];

/**
 * GDPR / compliance topics — these are registered by Shopify automatically
 * and should not be included in manual registration calls.
 */
export const COMPLIANCE_TOPICS: string[] = [
  "customers/redact",
  "customers/data_request",
  "shop/redact",
];

/** All topics including compliance. */
export const ALL_TOPICS = [...REGISTERED_TOPICS, ...COMPLIANCE_TOPICS];

/** Webhook callback base URL. */
const WEBHOOK_CALLBACK_BASE = process.env.SHOPIFY_APP_URL ?? "https://stockflows.app";

/** The API version used for webhook registration. */
const API_VERSION = '2026-07';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WebhookRegistrationResult {
  topic: string;
  webhookId?: string;
  success: boolean;
  error?: string;
}

export interface WebhookVerificationResult {
  valid: boolean;
  shopDomain?: string;
  topic?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const log = logger.child({ module: "shopify/webhooks" });

/**
 * Compute HMAC-SHA256 digest of a request body using the app's API secret.
 *
 * Per Shopify's spec the digest is base64-encoded:
 *   crypto.createHmac('sha256', secret).update(rawBody).digest('base64')
 *
 * @param body     - Raw request body (string or Buffer).
 * @param secret   - HMAC secret (defaults to SHOPIFY_API_SECRET env var).
 * @returns        - Base64-encoded HMAC digest.
 */
function computeHmac(body: string | Buffer, secret?: string): string {
  const hmacSecret = secret ?? process.env.SHOPIFY_API_SECRET;
  if (!hmacSecret) {
    throw new Error("SHOPIFY_API_SECRET is not set — cannot compute HMAC");
  }

  const rawBody = Buffer.isBuffer(body) ? body : Buffer.from(body, "utf-8");
  return crypto.createHmac("sha256", hmacSecret).update(rawBody).digest("base64");
}

// ---------------------------------------------------------------------------
// verifyWebhook
// ---------------------------------------------------------------------------

/**
 * Verify the HMAC signature of an incoming webhook request.
 *
 * This is a backup verification method for scenarios where
 * `authenticate.webhook` from @shopify/shopify-app-remix is not used
 * (e.g. custom middleware, testing, or non-Remix contexts).
 *
 * Shopify sends two relevant headers:
 *   - `X-Shopify-Hmac-SHA256` — HMAC of the raw body
 *   - `X-Shopify-Shop-Domain` — the shop's myshopify.com domain
 *   - `X-Shopify-Topic`      — the webhook topic
 *
 * @param request  - The incoming Request object.
 * @param secret   - Optional HMAC secret override (defaults to env var).
 * @returns        - Verification result with shop domain and topic.
 */
export async function verifyWebhook(
  request: Request,
  secret?: string
): Promise<WebhookVerificationResult> {
  const logCtx = log.child({
    headers: {
      shop: request.headers.get("X-Shopify-Shop-Domain"),
      topic: request.headers.get("X-Shopify-Topic"),
    },
  });

  // 1. Check required HMAC header
  const hmacHeader = request.headers.get("X-Shopify-Hmac-SHA256");
  if (!hmacHeader) {
    logCtx.warn("Missing X-Shopify-Hmac-SHA256 header");
    return { valid: false, error: "Missing HMAC header" };
  }

  // 2. Read raw body (clone the request so it can be re-read downstream)
  const clonedRequest = request.clone();
  const rawBody = await clonedRequest.text();

  if (!rawBody) {
    logCtx.warn("Empty request body");
    return { valid: false, error: "Empty request body" };
  }

  // 3. Compute and compare
  try {
    const expectedHmac = computeHmac(rawBody, secret);

    // Use timing-safe comparison to prevent timing attacks
    // Shopify sends the HMAC as base64 — match that encoding.
    const hmacBuffer = Buffer.from(hmacHeader, "base64");
    const expectedBuffer = Buffer.from(expectedHmac, "base64");

    if (hmacBuffer.length !== expectedBuffer.length) {
      logCtx.warn("HMAC length mismatch");
      return { valid: false, error: "HMAC mismatch" };
    }

    const isValid = crypto.timingSafeEqual(hmacBuffer, expectedBuffer);

    if (!isValid) {
      logCtx.warn("HMAC verification failed");
      return { valid: false, error: "HMAC mismatch" };
    }

    const shopDomain = request.headers.get("X-Shopify-Shop-Domain") ?? undefined;
    const topic = request.headers.get("X-Shopify-Topic") ?? undefined;

    logCtx.debug("Webhook HMAC verified successfully");

    return { valid: true, shopDomain, topic };
  } catch (error) {
    logCtx.error({ error }, "HMAC verification threw an exception");
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
}

// ---------------------------------------------------------------------------
// registerWebhooks
// ---------------------------------------------------------------------------

/**
 * Register all webhook topics for a shop via the Admin GraphQL API.
 *
 * This calls `webhookSubscriptionCreate` for each topic in REGISTERED_TOPICS.
 * Topics that are already registered will be skipped (upsert behaviour).
 *
 * @param session - Active Shopify session.
 * @returns       - Registration results per topic.
 */
export async function registerWebhooks(
  session: Session
): Promise<WebhookRegistrationResult[]> {
  const shop = session.shop;
  const logCtx = log.child({ shop });

  logCtx.info(
    { topicCount: REGISTERED_TOPICS.length },
    "Registering webhook subscriptions"
  );

  const results: WebhookRegistrationResult[] = [];

  // Build the callback URL with topic path segment for routing
  const callbackUrl = `${WEBHOOK_CALLBACK_BASE}/webhooks`;

  // Use bulk registration via a single GraphQL mutation per topic.
  // Shopify limits each mutation to one topic, so we iterate.
  for (const topic of REGISTERED_TOPICS) {
    try {
      const MUTATION = `
        mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
          webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
            webhookSubscription {
              id
              callbackUrl
              topic
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const response = await fetch(
        `https://${shop}/admin/api/${API_VERSION}/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": session.accessToken!,
          },
          body: JSON.stringify({
            query: MUTATION,
            variables: {
              topic: topic.toUpperCase().replace(/\//g, "_") as any,
              webhookSubscription: {
                callbackUrl,
                format: "JSON",
              },
            },
          }),
        }
      );

      const body = await response.json() as any;
      const result = body.data?.webhookSubscriptionCreate;

      if (result?.userErrors?.length > 0) {
        const errorMsg = result.userErrors[0].message;
        logCtx.warn({ topic, error: errorMsg }, "Webhook registration error");
        results.push({ topic, success: false, error: errorMsg });
        continue;
      }

      const webhookId = result?.webhookSubscription?.id;
      logCtx.debug({ topic, webhookId }, "Webhook registered");
      results.push({ topic, webhookId, success: true });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      logCtx.error({ topic, error: errorMsg }, "Failed to register webhook");
      results.push({ topic, success: false, error: errorMsg });
    }
  }

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  logCtx.info({ succeeded, failed }, "Webhook registration complete");

  return results;
}

// ---------------------------------------------------------------------------
// ensureWebhooksRegistered
// ---------------------------------------------------------------------------

/**
 * Check which webhook topics are currently registered for a shop and
 * re-register any that are missing.
 *
 * This is designed to be called periodically (e.g. on app startup or via
 * a scheduled job) to ensure webhook coverage is complete.
 *
 * @param shopId      - The internal shop ID from the database.
 * @param accessToken - The shop's access token for Admin API calls.
 * @returns           - true if all topics are registered (or were successfully registered).
 */
export async function ensureWebhooksRegistered(
  shopId: string,
  accessToken: string
): Promise<boolean> {
  const shopRecord = await prisma.shop.findUnique({ where: { id: shopId } });
  if (!shopRecord) {
    log.error({ shopId }, "Shop not found — cannot ensure webhooks");
    return false;
  }

  const shop = shopRecord.shopifyDomain;
  const logCtx = log.child({ shop, shopId });

  logCtx.debug("Checking webhook registrations");

  // Query existing webhooks via GraphQL
  const QUERY = `
    query {
      webhookSubscriptions(first: 50) {
        nodes {
          id
          topic
          callbackUrl
        }
      }
    }
  `;

  let existingTopics: Set<string>;

  try {
    const response = await fetch(
      `https://${shop}/admin/api/${API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({ query: QUERY }),
      }
    );

    const body = await response.json() as any;
    const nodes = body.data?.webhookSubscriptions?.nodes ?? [];

    existingTopics = new Set(
      nodes.map((n: any) => n.topic.toLowerCase().replace(/_/g, "/"))
    );

    logCtx.debug(
      { registered: existingTopics.size, topics: [...existingTopics] },
      "Found existing webhook subscriptions"
    );
  } catch (error) {
    logCtx.error({ error }, "Failed to query existing webhooks");
    return false;
  }

  // Find missing topics
  const missingTopics = REGISTERED_TOPICS.filter(
    (topic) => !existingTopics.has(topic)
  );

  if (missingTopics.length === 0) {
    logCtx.info("All webhook topics are registered");
    return true;
  }

  logCtx.warn(
    { missingTopics, count: missingTopics.length },
    "Missing webhook topics — registering"
  );

  // Register missing topics
  // We need a Session-like object for registerWebhooks; construct a minimal one.
  const session = {
    shop,
    accessToken,
  } as Session;

  // Re-register only the missing topics
  const results: WebhookRegistrationResult[] = [];
  const callbackUrl = `${WEBHOOK_CALLBACK_BASE}/webhooks`;

  for (const topic of missingTopics) {
    try {
      const MUTATION = `
        mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
          webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
            webhookSubscription {
              id
              topic
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const response = await fetch(
        `https://${shop}/admin/api/${API_VERSION}/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessToken,
          },
          body: JSON.stringify({
            query: MUTATION,
            variables: {
              topic: topic.toUpperCase().replace(/\//g, "_") as any,
              webhookSubscription: {
                callbackUrl,
                format: "JSON",
              },
            },
          }),
        }
      );

      const body = await response.json() as any;
      const result = body.data?.webhookSubscriptionCreate;

      if (result?.userErrors?.length > 0) {
        results.push({ topic, success: false, error: result.userErrors[0].message });
      } else {
        results.push({ topic, webhookId: result?.webhookSubscription?.id, success: true });
      }
    } catch (error) {
      results.push({
        topic,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  logCtx.info({ succeeded, failed, missingTopics }, "Missing webhook registration complete");

  return failed === 0;
}
