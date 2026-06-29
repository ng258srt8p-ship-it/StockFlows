import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form, useNavigation, useActionData } from "@remix-run/react";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import { requirePermission } from "~/lib/auth/middleware";
import { useState } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  Checkbox,
  TextField,
  Select,
  Button,
  Banner,
} from "@shopify/polaris";

// ---------------------------------------------------------------------------
// Server — UNCHANGED from current implementation
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

  const [emailOn, setEmailOn] = useState(settings?.emailAlerts ?? true);
  const [slackOn, setSlackOn] = useState(!!settings?.slackWebhookUrl);
  const [smsOn, setSmsOn] = useState(Array.isArray(settings?.smsPhoneNumbers) && (settings.smsPhoneNumbers as string[]).length > 0);
  const [aiInsightsOn, setAiInsightsOn] = useState(settings?.enableAiInsights ?? false);
  const [forecastExplOn, setForecastExplOn] = useState(settings?.enableForecastExplanations ?? false);

  return (
    <Page title="Settings" subtitle="Manage your stock alerts, thresholds, and preferences">
      <Layout>
        <Layout.Section>
          <Form method="post">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* ── Notifications Card ─────────────────────────── */}
              <Card>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Text variant="headingMd" as="h2">
                      Notifications
                    </Text>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <Text variant="bodyMd" as="p">
                        Email Alerts
                      </Text>
                      <div>
                        <Checkbox
                          label="Email Alerts"
                          labelHidden
                          checked={emailOn}
                          onChange={setEmailOn}
                        />
                        <input type="hidden" name="emailAlerts" value={emailOn ? "on" : ""} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <Text variant="bodyMd" as="p">
                        Slack Alerts
                      </Text>
                      <div>
                        <Checkbox
                          label="Slack Alerts"
                          labelHidden
                          checked={slackOn}
                          onChange={setSlackOn}
                        />
                        <input type="hidden" name="slackEnabled" value={slackOn ? "on" : ""} />
                      </div>
                    </div>
                    {slackOn && (
                      <div className="mt-2 ml-0">
                        <TextField
                          label="Slack Webhook URL"
                          type="url"
                          name="slackWebhookUrl"
                          value={slackUrl}
                          onChange={setSlackUrl}
                          placeholder="https://hooks.slack.com/services/..."
                          autoComplete="off"
                        />
                        <Text variant="bodySm" as="p" tone="subdued">
                          Create one at Settings &gt; Apps &gt; Incoming Webhooks
                        </Text>
                      </div>
                    )}

                    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <Text variant="bodyMd" as="p">
                        SMS Alerts
                      </Text>
                      <div>
                        <Checkbox
                          label="SMS Alerts"
                          labelHidden
                          checked={smsOn}
                          onChange={setSmsOn}
                        />
                        <input type="hidden" name="smsEnabled" value={smsOn ? "on" : ""} />
                      </div>
                    </div>
                    {smsOn && (
                      <div className="mt-2 ml-0">
                        <TextField
                          label="Phone Numbers"
                          type="text"
                          name="smsPhoneNumbers"
                          value={smsPhones}
                          onChange={setSmsPhones}
                          placeholder="+155****4567, +155****6543"
                          autoComplete="off"
                        />
                        <Text variant="bodySm" as="p" tone="subdued">
                          Comma-separated phone numbers for critical stock alerts
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* ── Alert Thresholds Card ──────────────────────── */}
              <Card>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Text variant="headingMd" as="h2">
                      Alert Thresholds
                    </Text>
                  </div>
                  <div className="space-y-4">
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
                  </div>
                </div>
              </Card>

              {/* ── Forecasting Card ───────────────────────────── */}
              <Card>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Text variant="headingMd" as="h2">
                      Forecasting
                    </Text>
                  </div>
                  <div className="space-y-4">
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
                </div>
              </Card>

              {/* ── AI Features Card ───────────────────────────── */}
              <Card>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Text variant="headingMd" as="h2">
                      AI Features
                    </Text>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <Text variant="bodyMd" as="p">
                        AI Insights
                      </Text>
                      <div>
                        <Checkbox
                          label="AI Insights"
                          labelHidden
                          checked={aiInsightsOn}
                          onChange={setAiInsightsOn}
                        />
                        <input type="hidden" name="enableAiInsights" value={aiInsightsOn ? "on" : ""} />
                      </div>
                    </div>
                    <Text variant="bodySm" as="p" tone="subdued">
                      Uses OpenCode API to analyze inventory data and generate insights.
                      Statistical forecasting still works when AI is disabled.
                    </Text>

                    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <Text variant="bodyMd" as="p">
                        Forecast Explanations
                      </Text>
                      <div>
                        <Checkbox
                          label="Forecast Explanations"
                          labelHidden
                          checked={forecastExplOn}
                          onChange={setForecastExplOn}
                        />
                        <input type="hidden" name="enableForecastExplanations" value={forecastExplOn ? "on" : ""} />
                      </div>
                    </div>
                    <Text variant="bodySm" as="p" tone="subdued">
                      Shows AI-generated natural language explanations of forecast data.
                    </Text>
                  </div>
                </div>
              </Card>

              {/* ── General Card ───────────────────────────────── */}
              <Card>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Text variant="headingMd" as="h2">
                      General
                    </Text>
                  </div>
                  <div className="space-y-4">
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
                </div>
              </Card>
            </div>

            {/* ── Save Button ─────────────────────────────────────── */}
            <div className="flex justify-end">
              <Button primary submit loading={isSubmitting}>
                Save Settings
              </Button>
            </div>
          </Form>
        </Layout.Section>

        {/* ── Success Banner ──────────────────────────────────── */}
        {actionData?.success && (
          <Layout.Section>
            <Banner tone="success">
              <p>Settings saved successfully.</p>
            </Banner>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}
