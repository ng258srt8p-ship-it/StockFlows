import type { AIMessage, AICompletionResponse, InventoryContext, AIInsight } from "./types";
import { buildSystemPrompt } from "./context-builder";

const OPENCODE_API_URL = "https://opencode.ai/api/v1/chat/completions";
const API_KEY = process.env.OPENCODE_API_KEY || "";
const MODEL = process.env.OPENCODE_MODEL || "big-pickle";

// Simple in-memory cache (5-minute TTL)
const cache = new Map<string, { data: unknown; expires: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) return entry.data as T;
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown, ttlMs: number = 300000) {
  cache.set(key, { data, expires: Date.now() + ttlMs });
  // Cleanup old entries every 100 writes
  if (cache.size > 100) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (v.expires < now) cache.delete(k);
    }
  }
}

export async function queryAI(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  if (!API_KEY) {
    return "AI service not configured. Set OPENCODE_API_KEY environment variable.";
  }

  const cacheKey = `ai:${systemPrompt.length}:${userMessage}`;
  const cached = getCached<string>(cacheKey);
  if (cached) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(OPENCODE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 1024,
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      logger.error({ status: response.status, error: errorText }, "AI API error");
      return "I'm having trouble processing that right now. Please try again.";
    }

    const data: AICompletionResponse = await response.json();
    const content = data.choices[0]?.message?.content || "";
    setCache(cacheKey, content);
    return content;
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === "AbortError") {
      return "The request timed out. Please try a simpler question.";
    }
    logger.error({ err: error }, "AI request failed");
    return "Something went wrong. Please try again.";
  }
}

import { logger } from "~/lib/logger";

export async function generateInsights(
  context: InventoryContext
): Promise<AIInsight[]> {
  const systemPrompt = buildSystemPrompt(context);
  const userMessage =
    "Analyze this inventory data and generate 3-5 actionable insights. " +
    "Focus on stockout risks, overstock situations, and reorder timing. " +
    "Return a JSON array of objects with: type (risk|opportunity|trend|recommendation), " +
    "title, description, severity (high|medium|low). Be specific with numbers.";

  const response = await queryAI(systemPrompt, userMessage);

  try {
    const parsed = JSON.parse(response);
    if (Array.isArray(parsed)) {
      return parsed.map((item: any, index: number) => ({
        id: `ai-insight-${index}`,
        type: item.type || "recommendation",
        title: item.title || "Insight",
        description: item.description || "",
        severity: item.severity || "medium",
      }));
    }
  } catch {
    // Response wasn't valid JSON — return a text insight
    return [
      {
        id: "ai-insight-text",
        type: "recommendation" as const,
        title: "Inventory Analysis",
        description: response.substring(0, 200),
        severity: "medium" as const,
      },
    ];
  }

  return [];
}

export async function explainForecast(
  productName: string,
  avgDailySales: number,
  currentStock: number,
  trendDirection: string,
  confidence: number
): Promise<string> {
  const systemPrompt =
    "You are an inventory analyst. Explain this product's demand forecast " +
    "in simple terms for a merchant. Be specific with numbers. " +
    "Keep the response under 100 words.";

  const userMessage =
    `${productName}: Average daily sales is ${avgDailySales.toFixed(1)} units. ` +
    `Current stock: ${currentStock}. ` +
    `30-day trend: ${trendDirection}. ` +
    `Forecast confidence: ${Math.round(confidence * 100)}%. ` +
    `What does this mean for the merchant?`;

  return queryAI(systemPrompt, userMessage);
}
