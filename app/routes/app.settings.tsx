import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useNavigation, useActionData, useNavigate } from "@remix-run/react";
import { Prisma } from "@prisma/client";
import { prisma } from "~/lib/db/client";
import { requirePermission } from "~/lib/auth/middleware";
import { logger } from "~/lib/logger";
import { shopSettingsRateLimit, rateLimitResponse } from "~/lib/middleware/rate-limit";
import { SettingsFormSchema } from "~/lib/schemas/settings";
import { useState } from "react";
import {
  Page,
  Layout,
  TextField,
  Select,
  Button,
  Banner,
  Text,
  Card,
  Checkbox,
} from "@shopify/polaris";
import { SettingsCard, SettingsSection } from "~/components/settings";
import { NotificationToggle } from "~/components/settings";

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
      <Page title="Settings">
        <Banner tone="critical">
          <p>{data.error}: {data.message}</p>
        </Banner>
      </Page>
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
    <Page title="Settings" subtitle="Manage alerts, thresholds, and preferences">
      <Layout>
        <Layout.Section>
          <div className="px-4 py-6">
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
                  <Card>
                    <div className="p-4">
                      <Text variant="headingSm" as="h3">
                        Alert Thresholds
                      </Text>
                      <Text variant="bodySm" as="p" tone="subdued" className="mt-1">
                        Set stock levels that trigger reorder alerts. Critical must be lower than Low.
                      </Text>

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
                    </div>
                  </Card>

                  {/* ── Forecasting Card ───────────────────────────── */}
                  <Card>
                    <div className="p-4">
                      <Text variant="headingSm" as="h3">
                        Forecasting
                      </Text>
                      <Text variant="bodySm" as="p" tone="subdued" className="mt-1">
                        Configure how far ahead the demand forecast predicts future sales.
                      </Text>

                      <TextField
                        label="Forecast Horizon"
                        type="number"
                        name="forecastHorizonDays"
                        value={forecastHorizon}
                        onChange={setForecastHorizon}
                        suffix="days"
                        autoComplete="off"
                      />
                    </div>
                  </Card>

                  {/* ── AI Features Card ───────────────────────────── */}
                  <Card>
                    <div className="p-4">
                      <Text variant="headingSm" as="h3">
                        AI Features
                      </Text>
                      <Text variant="bodySm" as="p" tone="subdued" className="mt-1">
                        Enable AI-powered insights and natural language explanations for your inventory data.
                      </Text>

                      <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                        <Text variant="bodyMd" as="p">
                          AI Insights
                        </Text>
                        <Checkbox
                          label="AI Insights"
                          labelHidden
                          checked={aiInsightsOn}
                          onChange={setAiInsightsOn}
                        />
                        <input
                          type="hidden"
                          name="enableAiInsights"
                          value={aiInsightsOn ? "on" : ""}
                        />
                      </div>
                      <Text variant="bodySm" as="p" tone="subdued">
                        Uses OpenCode API to analyze inventory data and generate insights.
                        Statistical forecasting still works when AI is disabled.
                      </Text>

                      <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                        <Text variant="bodyMd" as="p">
                          Forecast Explanations
                        </Text>
                        <Checkbox
                          label="Forecast Explanations"
                          labelHidden
                          checked={forecastExplOn}
                          onChange={setForecastExplOn}
                        />
                        <input
                          type="hidden"
                          name="enableForecastExplanations"
                          value={forecastExplOn ? "on" : ""}
                        />
                      </div>
                      <Text variant="bodySm" as="p" tone="subdued">
                        Shows AI-generated natural language explanations of forecast data.
                      </Text>
                    </div>
                  </Card>

                  {/* ── General Card ───────────────────────────────── */}
                  <Card>
                    <div className="p-4">
                      <Text variant="headingSm" as="h3">
                        General
                      </Text>
                      <Text variant="bodySm" as="p" tone="subdued" className="mt-1">
                        Configure general settings for your StockFlows account.
                      </Text>

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
                    </div>
                  </Card>
                </div>

                {/* ── Save Button ─────────────────────────────────────── */}
                <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
                  <Button primary submit loading={isSubmitting}>
                    Save Settings
                  </Button>
                </div>
              </Form>

              {/* ── Success Banner ──────────────────────────────────── */}
              {actionData?.success && (
                <div className="pt-4">
                  <Banner tone="success">
                    <p>Settings saved successfully.</p>
                  </Banner>
                </div>
              )}
            </div>
          </Layout.Section>
      </Layout>
    </Page>
  );
}
