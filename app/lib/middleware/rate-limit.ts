import { json } from "@remix-run/node";
import { logger } from "~/lib/logger";

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests
  keyGenerator?: (request: Request) => string | Promise<string>; // Custom key generation
}

interface RateLimitResult {
  limited: boolean;
  retryAfter?: number; // Seconds until retry allowed
}

class InMemoryStore {
  private store = new Map<string, { count: number; resetTime: number }>();
  
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (value.resetTime < now) {
        this.store.delete(key);
      }
    }
  }
  
  get(key: string) {
    const item = this.store.get(key);
    if (!item) return null;
    
    // If window has expired, remove and return null
    if (item.resetTime < Date.now()) {
      this.store.delete(key);
      return null;
    }
    
    return item;
  }
  
  increment(key: string, windowMs: number, maxRequests: number) {
    const now = Date.now();
    let item = this.store.get(key);
    
    if (!item || item.resetTime < now) {
      item = { count: 1, resetTime: now + windowMs };
      this.store.set(key, item);
    } else {
      item.count++;
      this.store.set(key, item);
    }
    
    return item;
  }
  
  delete(key: string) {
    this.store.delete(key);
  }
}

// In-memory rate limit store (for development)
const memoryStore = new InMemoryStore();

// Cleanup interval - run cleanup every 5 minutes
const cleanupInterval = setInterval(() => {
  memoryStore.cleanup();
}, 5 * 60 * 1000);

export async function rateLimit(request: Request, options: RateLimitOptions): Promise<RateLimitResult> {
  const {
    windowMs = 60 * 1000, // 1 minute default
    maxRequests = 10, // 10 requests default
    keyGenerator,
  } = options;
  
  // Generate rate limit key
  let key: string;
  if (keyGenerator) {
    key = await keyGenerator(request);
  } else {
    // Default key based on IP and shop
    const shopDomain = new URL(request.url).searchParams.get('shop') || '';
    const ip = request.headers.get('cf-connecting-ip') || 
              request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip') || 
              'unknown';
    key = `rate_limit_${ip}_${shopDomain}`;
  }
  
  // Check memory store first
  const record = memoryStore.get(key);
  if (record) {
    const now = Date.now();
    const timeLeft = Math.ceil((record.resetTime - now) / 1000);
    
    if (record.count >= maxRequests) {
      logger.warn({ key, count: record.count, maxRequests }, "Rate limit exceeded");
      return { limited: true, retryAfter: timeLeft };
    }
  }
  
  // Increment the counter
  const updatedRecord = memoryStore.increment(key, windowMs, maxRequests);
  
  return { limited: false };
}

export async function shopSettingsRateLimit(request: Request): Promise<RateLimitResult> {
  return rateLimit(request, {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute per shop
    keyGenerator: async (request: Request) => {
      // Extract shop from request
      const shopDomain = new URL(request.url).searchParams.get('shop') || '';
      const ip = request.headers.get('cf-connecting-ip') || 
                request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown';
      
      return `settings_${shopDomain}_${ip}`;
    },
  });
}

export function createRateLimitMiddleware(options: RateLimitOptions) {
  return async function rateLimitMiddleware(request: Request): Promise<RateLimitResult | null> {
    const result = await rateLimit(request, options);
    return result.limited ? result : null;
  };
}

export function shopSettingsRateLimitMiddleware() {
  return async function rateLimitMiddleware(request: Request): Promise<RateLimitResult | null> {
    const result = await shopSettingsRateLimit(request);
    return result.limited ? result : null;
  };
}

export async function rateLimitResponse(request: Request, result: RateLimitResult): Promise<Response> {
  const retryAfter = result.retryAfter || Math.ceil((60 * 1000) / 1000); // Default to 1 minute
  
  return json(
    {
      error: "Too Many Requests",
      message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
        'Content-Type': 'application/json',
      },
    },
  );
}