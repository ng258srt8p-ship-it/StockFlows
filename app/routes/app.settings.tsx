import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form, useNavigation, useActionData } from "@remix-run/react";
import { Prisma } from "@prisma/client";
import { prisma } from "~/lib/db/client";
import { requirePermission } from "~/lib/auth/middleware";
import { logger } from "~/lib/logger";
import { shopSettingsRateLimit, rateLimitResponse } from "~/lib/middleware/rate-limit";
import { SettingsFormSchema } from "~/lib/schemas/settings";
import { useState } from "react";
import {
  TextField,
  Select,
} from "@shopify/polaris";
import { SettingsCard, NotificationToggle } from "~/components/settings";

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Use requirePermission which catches auth failures gracefully
  const { session } = await requirePermission(request, "settings:read");

  const shop = await prisma.shop.findUnique({
    where: { shopifyDomain: session.shop },
    include: { settings: true, locations: true },
  });

  if (!shop) {
    return json(
      { error: "Not Found", message: "Shop not found." },
      { status: 404 }
    );
  }

  return json({ settings: shop?.settings, locations: shop?.locations || [] });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  // Rate limiting: 10 requests per minute per shop
  const rateLimitResult = await shopSettingsRateLimit(request);
  if (rateLimitResult.limited) {
    return rateLimitResponse(request, rateLimitResult);
  }

  const { shopId } = await requirePermission(request, "settings:write");

  const formData = await request.formData();
  
  // Parse form data into object for Zod validation
  const formDataObj: Record<string, any> = {};
  for (const [key, value] of formData.entries()) {
    // Handle multiple values (e.g., checkboxes)
    if (formDataObj[key]) {
      if (Array.isArray(formDataObj[key])) {
        formDataObj[key].push(value);
      } else {
        formDataObj[key] = [formDataObj[key], value];
      }
    } else {
      formDataObj[key] = value;
    }
  }

  // Convert checkbox values ("on" -> true, missing -> false)
  const booleanFields = [
    "emailAlerts",
    "slackEnabled",
    "smsEnabled",
    "enableAiInsights",
    "enableForecastExplanations",
  ];
  
  for (const field of booleanFields) {
    formDataObj[field] = formDataObj[field] === "on";
  }

  // Transform slackEnabled -> slackWebhookUrl handling
  if (!formDataObj.slackEnabled) {
    formDataObj.slackWebhookUrl = null;
  } else if (!formDataObj.slackWebhookUrl) {
    // Slack is enabled but no URL provided -- slack events will be enabled
    // without a URL which is fine (the backend just won't send Slack alerts)
    formDataObj.slackWebhookUrl = null;
  }

  // Transform smsEnabled -> smsPhoneNumbers handling
  if (!formDataObj.smsEnabled) {
    formDataObj.smsPhoneNumbers = null;
  }

  // Ensure smsPhoneNumbers is always a string before Zod validation
  if (formDataObj.smsPhoneNumbers && typeof formDataObj.smsPhoneNumbers !== "string") {
    formDataObj.smsPhoneNumbers = String(formDataObj.smsPhoneNumbers);
  }

  // Validate with Zod schema
  const validationResult = SettingsFormSchema.safeParse(formDataObj);

  if (!validationResult.success) {
    const errors = validationResult.error.flatten();
    logger.warn({ errors, formData: formDataObj }, "Settings validation failed");
    return json(
      {
        error: "Validation Failed",
        message: "Please check your input and try again.",
        fieldErrors: errors.fieldErrors,
        formErrors: errors.formErrors,
      },
      { status: 400 }
    );
  }

  const validatedData = validationResult.data;

  // Prisma requires Prisma.JsonNull instead of null for JSON fields.
  // The smsPhoneNumbers field comes from a Zod transformer that returns
  // either null, a string[], or a string[]. We normalize it here.
  let smsPhoneNumbersJson: any = Prisma.JsonNull;
  if (validatedData.smsPhoneNumbers && Array.isArray(validatedData.smsPhoneNumbers) && validatedData.smsPhoneNumbers.length > 0) {
    smsPhoneNumbersJson = validatedData.smsPhoneNumbers;
  }

  const dbData = {
    lowStockThreshold: validatedData.lowStockThreshold,
    criticalStockThreshold: validatedData.criticalStockThreshold,
    safetyStockMultiplier: validatedData.safetyStockMultiplier,
    forecastHorizonDays: validatedData.forecastHorizonDays,
    emailAlerts: validatedData.emailAlerts,
    slackWebhookUrl: validatedData.slackWebhookUrl ?? null,
    smsPhoneNumbers: smsPhoneNumbersJson,
    currency: validatedData.currency,
    enableAiInsights: validatedData.enableAiInsights,
    enableForecastExplanations: validatedData.enableForecastExplanations,
  };

  await prisma.shopSetting.upsert({
    where: { shopId },
    create: { shopId, ...dbData },
    update: dbData,
  });

  return json({ success: true });
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function Settings() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  // Handle error case from loader
  if ("error" in data) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Settings</h1>
        <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: "var(--danger-muted, #EF444415)", color: "var(--danger)" }}>
          <span className="material-symbols-outlined">error</span>
          <p className="text-sm font-medium">{data.error}: {data.message}</p>
        </div>
      </div>
    );
  }

  const { settings, locations } = data;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [lowStock, setLowStock] = useState(String(settings?.lowStockThreshold || 10));
  const [criticalStock, setCriticalStock] = useState(String(settings?.criticalStockThreshold || 3));
  const [safetyStockMultiplier, setSafetyStockMultiplier] = useState(String(settings?.safetyStockMultiplier || 1.5));
  const [forecastHorizon, setForecastHorizon] = useState(String(settings?.forecastHorizonDays || 30));
  const [slackUrl, setSlackUrl] = useState(settings?.slackWebhookUrl || "");
  const [smsPhones, setSmsPhones] = useState(
    Array.isArray(settings?.smsPhoneNumbers)
      ? (settings.smsPhoneNumbers as string[]).join(", ")
      : settings?.smsPhoneNumbers
        ? (typeof settings.smsPhoneNumbers === "string"
            ? settings.smsPhoneNumbers
            : Array.isArray(settings.smsPhoneNumbers)
            ? (settings.smsPhoneNumbers as string[]).join(", ")
            : "")
        : ""
  );

  const [emailOn, setEmailOn] = useState(settings?.emailAlerts ?? true);
  const [slackOn, setSlackOn] = useState(!!settings?.slackWebhookUrl);
  const [smsOn, setSmsOn] = useState(Array.isArray(settings?.smsPhoneNumbers) && (settings.smsPhoneNumbers as string[]).length > 0);
  const [aiInsightsOn, setAiInsightsOn] = useState(settings?.enableAiInsights ?? false);
  const [forecastExplOn, setForecastExplOn] = useState(settings?.enableForecastExplanations ?? false);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          Settings
        </h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Manage alerts, thresholds, and preferences
        </p>
      </div>

      <Form method="post">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ── Notifications Card ─────────────────────────── */}
            <SettingsCard
              title="Notifications"
              description="Configure how StockFlows alerts your team about low stock levels."
            >
              <NotificationToggle
                label="Email Alerts"
                checked={emailOn}
                onChange={setEmailOn}
                name="emailAlerts"
              />
              <NotificationToggle
                label="Slack Alerts"
                checked={slackOn}
                onChange={setSlackOn}
                name="slackEnabled"
                additionalFields={
                  <TextField
                    label="Slack Webhook URL"
                    type="url"
                    name="slackWebhookUrl"
                    value={slackUrl}
                    onChange={setSlackUrl}
                    placeholder="https://hooks.slack.com/services/..."
                    autoComplete="off"
                  />
                }
              />
              <NotificationToggle
                label="SMS Alerts"
                checked={smsOn}
                onChange={setSmsOn}
                name="smsEnabled"
                additionalFields={
                  <TextField
                    label="Phone Numbers"
                    type="text"
                    name="smsPhoneNumbers"
                    value={smsPhones}
                    onChange={setSmsPhones}
                    placeholder="+155****5310, +155****5311"
                    autoComplete="off"
                  />
                }
              />
            </SettingsCard>

            {/* ── Alert Thresholds Card ──────────────────────── */}
            <SettingsCard
              title="Alert Thresholds"
              description="Set stock levels that trigger reorder alerts. Critical must be lower than Low."
            >
              <TextField
                label="Low Stock Threshold"
                type="number"
                name="lowStockThreshold"
                value={lowStock}
                onChange={setLowStock}
                suffix="units"
                autoComplete="off"
              />
              <TextField
                label="Critical Stock Threshold"
                type="number"
                name="criticalStockThreshold"
                value={criticalStock}
                onChange={setCriticalStock}
                suffix="units"
                autoComplete="off"
              />
              <TextField
                label="Safety Stock Multiplier"
                type="number"
                step={0.1}
                name="safetyStockMultiplier"
                value={safetyStockMultiplier}
                onChange={setSafetyStockMultiplier}
                suffix="×"
                autoComplete="off"
              />
            </SettingsCard>

            {/* ── Forecasting Card ───────────────────────────── */}
            <SettingsCard
              title="Forecasting"
              description="Configure how far ahead the demand forecast predicts future sales."
            >
              <TextField
                label="Forecast Horizon"
                type="number"
                name="forecastHorizonDays"
                value={forecastHorizon}
                onChange={setForecastHorizon}
                suffix="days"
                autoComplete="off"
              />
            </SettingsCard>

            {/* ── AI Features Card ───────────────────────────── */}
            <SettingsCard
              title="AI Features"
              description="Enable AI-powered insights and natural language explanations for your inventory data."
            >
              <div className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                  AI Insights
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={aiInsightsOn}
                    onChange={(e) => setAiInsightsOn(e.target.checked)}
                  />
                  <div className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" style={{ backgroundColor: aiInsightsOn ? "var(--accent)" : "var(--border)" }} />
                  <input type="hidden" name="enableAiInsights" value={aiInsightsOn ? "on" : ""} />
                </label>
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--text-tertiary)" }}>
                Uses OpenCode API to analyze inventory data and generate insights.
                Statistical forecasting still works when AI is disabled.
              </p>

              <div className="flex items-center justify-between py-2 mt-2" style={{ borderBottom: "1px solid var(--border)" }}>
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                  Forecast Explanations
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={forecastExplOn}
                    onChange={(e) => setForecastExplOn(e.target.checked)}
                  />
                  <div className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" style={{ backgroundColor: forecastExplOn ? "var(--accent)" : "var(--border)" }} />
                  <input type="hidden" name="enableForecastExplanations" value={forecastExplOn ? "on" : ""} />
                </label>
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--text-tertiary)" }}>
                Shows AI-generated natural language explanations of forecast data.
              </p>
            </SettingsCard>

            {/* ── General Card ───────────────────────────────── */}
            <SettingsCard
              title="General"
              description="Configure general settings for your StockFlows account."
            >
              <Select
                label="Currency"
                name="currency"
                value={settings?.currency || "USD"}
                options={[
                  { label: "USD ($)", value: "USD" },
                  { label: "EUR (€)", value: "EUR" },
                  { label: "GBP (£)", value: "GBP" },
                  { label: "CAD (C$)", value: "CAD" },
                  { label: "AUD (A$)", value: "AUD" },
                ]}
              />
            </SettingsCard>
          </div>

          {/* ── Save Button ─────────────────────────────────────── */}
          <div className="flex justify-end pt-4 mt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: "var(--accent)",
                color: "white",
                border: "none",
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </Form>

        {/* ── Success Banner ──────────────────────────────────── */}
        {actionData?.success && (
          <div className="pt-4">
            <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: "#10B98115", color: "#10B981" }}>
              <span className="material-symbols-outlined">check_circle</span>
              <p className="text-sm font-medium">Settings saved successfully.</p>
            </div>
          </div>
        )}
    </div>
  );
}
