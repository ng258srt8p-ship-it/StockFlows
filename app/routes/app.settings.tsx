import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form, useNavigation, useActionData } from "@remix-run/react";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import { requirePermission } from "~/lib/auth/middleware";
import {
  Page,
  Layout,
  TextField,
  Select,
  Button,
  Banner,
  Text,
} from "@shopify/polaris";
import { useState } from "react";
import { PillToggle } from "~/components/ui/PillToggle";

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requirePermission(request, "settings:read");
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopifyDomain: session.shop },
    include: { settings: true, locations: true },
  });

  return json({ settings: shop?.settings, locations: shop?.locations || [] });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shopId } = await requirePermission(request, "settings:write");
  await authenticate.admin(request);

  const formData = await request.formData();

  const smsRaw = (formData.get("smsPhoneNumbers") as string || "").trim();
  const smsPhoneNumbers = smsRaw
    ? smsRaw.split(",").map((n: string) => n.trim()).filter(Boolean)
    : null;

  const data = {
    lowStockThreshold: Number(formData.get("lowStockThreshold")) || 10,
    criticalStockThreshold: Number(formData.get("criticalStockThreshold")) || 3,
    forecastHorizonDays: Number(formData.get("forecastHorizonDays")) || 30,
    emailAlerts: formData.get("emailAlerts") === "on",
    slackWebhookUrl: formData.get("slackWebhookUrl") as string || null,
    smsPhoneNumbers: smsPhoneNumbers as any,
    currency: formData.get("currency") as string || "USD",
    enableAiInsights: formData.get("enableAiInsights") === "on",
    enableForecastExplanations: formData.get("enableForecastExplanations") === "on",
  };

  await prisma.shopSetting.upsert({
    where: { shopId },
    create: { shopId, ...data },
    update: data,
  });

  return json({ success: true });
};

// ---------------------------------------------------------------------------
// Section card — consistent card wrapper
// ---------------------------------------------------------------------------

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2.5">
        {icon && (
          <span className="material-symbols-outlined text-gray-400" style={{ fontSize: 20 }}>
            {icon}
          </span>
        )}
        <Text variant="headingSm" as="h3">
          {title}
        </Text>
      </div>
      <div className="px-5 py-4 space-y-4">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function Settings() {
  const { settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [lowStock, setLowStock] = useState(String(settings?.lowStockThreshold || 10));
  const [criticalStock, setCriticalStock] = useState(String(settings?.criticalStockThreshold || 3));
  const [forecastHorizon, setForecastHorizon] = useState(String(settings?.forecastHorizonDays || 30));
  const [slackUrl, setSlackUrl] = useState(settings?.slackWebhookUrl || "");
  const [smsPhones, setSmsPhones] = useState(
    Array.isArray(settings?.smsPhoneNumbers)
      ? (settings.smsPhoneNumbers as string[]).join(", ")
      : ""
  );

  // Pill toggle states — controlled, so config fields expand/collapse
  const [emailOn, setEmailOn] = useState(settings?.emailAlerts ?? true);
  const [slackOn, setSlackOn] = useState(!!settings?.slackWebhookUrl);
  const [smsOn, setSmsOn] = useState(Array.isArray(settings?.smsPhoneNumbers) && (settings.smsPhoneNumbers as string[]).length > 0);
  const [aiInsightsOn, setAiInsightsOn] = useState(settings?.enableAiInsights ?? false);
  const [forecastExplOn, setForecastExplOn] = useState(settings?.enableForecastExplanations ?? false);

  return (
    <Page title="Settings">
      <Layout>
        <Layout.Section>
          {actionData?.success && (
            <div className="mb-4">
              <Banner tone="success">
                <p>Settings saved successfully.</p>
              </Banner>
            </div>
          )}

          <Form method="post">
            <div className="space-y-4 max-w-2xl">
              {/* ── Notifications ─────────────────────────────── */}
              <Section title="Notifications" icon="notifications">
                <div className="space-y-4">
                  {/* Email — simple toggle, no config */}
                  <PillToggle
                    name="emailAlerts"
                    label="Email Alerts"
                    icon="mail"
                    value={emailOn}
                    onChange={setEmailOn}
                  />

                  {/* Slack — toggle + expandable webhook config */}
                  <div>
                    <PillToggle
                      name="slackEnabled"
                      label="Slack Alerts"
                      icon="chat"
                      value={slackOn}
                      onChange={setSlackOn}
                    />
                    <div
                      className="grid transition-all duration-300 ease-in-out"
                      style={{ gridTemplateRows: slackOn ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <div className="pt-3 pl-10 pr-2">
                          <TextField
                            name="slackWebhookUrl"
                            label="Slack Webhook URL"
                            value={slackUrl}
                            onChange={(val) => setSlackUrl(val)}
                            autoComplete="off"
                            placeholder="https://hooks.slack.com/services/..."
                            helpText="Create one at Settings > Apps > Incoming Webhooks"
                            disabled={!slackOn}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SMS — toggle + expandable phone config */}
                  <div>
                    <PillToggle
                      name="smsEnabled"
                      label="SMS Alerts"
                      icon="smartphone"
                      value={smsOn}
                      onChange={setSmsOn}
                    />
                    <div
                      className="grid transition-all duration-300 ease-in-out"
                      style={{ gridTemplateRows: smsOn ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <div className="pt-3 pl-10 pr-2">
                          <TextField
                            name="smsPhoneNumbers"
                            label="SMS Alert Phone Numbers"
                            value={smsPhones}
                            onChange={(val) => setSmsPhones(val)}
                            autoComplete="off"
                            placeholder="+15551234567, +15559876543"
                            helpText="Comma-separated list of phone numbers for critical stock alerts"
                            disabled={!smsOn}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Section>

              {/* ── Alert Thresholds ──────────────────────────── */}
              <Section title="Alert Thresholds" icon="warning">
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    name="lowStockThreshold"
                    label="Low stock"
                    type="number"
                    value={lowStock}
                    onChange={(val) => setLowStock(val)}
                    autoComplete="off"
                    helpText="Trigger warning when stock drops below"
                  />
                  <TextField
                    name="criticalStockThreshold"
                    label="Critical stock"
                    type="number"
                    value={criticalStock}
                    onChange={(val) => setCriticalStock(val)}
                    autoComplete="off"
                    helpText="Trigger critical alert below this level"
                  />
                </div>
              </Section>

              {/* ── Forecasting ───────────────────────────────── */}
              <Section title="Forecasting" icon="query_stats">
                <TextField
                  name="forecastHorizonDays"
                  label="Forecast horizon"
                  type="number"
                  value={forecastHorizon}
                  onChange={(val) => setForecastHorizon(val)}
                  autoComplete="off"
                  helpText="Number of days to predict demand ahead"
                />
              </Section>

              {/* ── AI Features ───────────────────────────────── */}
              <Section title="AI Features" icon="psychology">
                <div className="space-y-4">
                  {/* AI Insights — toggle + always-visible description */}
                  <div>
                    <PillToggle
                      name="enableAiInsights"
                      label="Enable AI Insights"
                      icon="auto_awesome"
                      value={aiInsightsOn}
                      onChange={setAiInsightsOn}
                    />
                    <p className="text-xs text-gray-500 pl-10 pt-2 leading-relaxed">
                      Uses the OpenCode API with the Big Pickle model to analyze your inventory
                      data and generate insights. Requires an OpenCode API key set as
                      OPENCODE_API_KEY in your app environment. Your inventory levels, forecasts,
                      and alerts are sent to an external AI service for analysis. Statistical
                      forecasting (the core demand engine) still works when AI is disabled.
                    </p>
                  </div>

                  {/* Forecast Explanations — toggle + always-visible description */}
                  <div>
                    <PillToggle
                      name="enableForecastExplanations"
                      label="Enable Forecast Explanations"
                      icon="auto_stories"
                      value={forecastExplOn}
                      onChange={setForecastExplOn}
                    />
                    <p className="text-xs text-gray-500 pl-10 pt-2 leading-relaxed">
                      Shows AI-generated natural language explanations of forecast data when you
                      view a product's forecast. These explanations help you understand what
                      the numbers mean.
                    </p>
                  </div>
                </div>
              </Section>

              {/* ── General ────────────────────────────────────── */}
              <Section title="General" icon="tune">
                <Select
                  name="currency"
                  label="Currency"
                  options={[
                    { label: "USD ($)", value: "USD" },
                    { label: "EUR (€)", value: "EUR" },
                    { label: "GBP (£)", value: "GBP" },
                    { label: "CAD (C$)", value: "CAD" },
                    { label: "AUD (A$)", value: "AUD" },
                  ]}
                  value={settings?.currency || "USD"}
                />
              </Section>

              {/* ── Save ──────────────────────────────────────── */}
              <div className="flex justify-end pt-2 pb-8">
                <Button submit primary loading={isSubmitting}>
                  Save Settings
                </Button>
              </div>
            </div>
          </Form>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
