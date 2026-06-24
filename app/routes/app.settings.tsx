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
  };

  await prisma.shopSetting.upsert({
    where: { shopId },
    create: { shopId, ...data },
    update: data,
  });

  return json({ success: true });
};

// ---------------------------------------------------------------------------
// Toggle — custom sleek toggle switch (replaces Polaris Checkbox)
// ---------------------------------------------------------------------------

function Toggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description?: string;
  defaultChecked: boolean;
}) {
  const [on, setOn] = useState(defaultChecked);

  return (
    <label className="flex items-center justify-between gap-4 py-1 cursor-pointer group">
      <input
        type="checkbox"
        name={name}
        checked={on}
        onChange={() => setOn(!on)}
        className="sr-only peer"
      />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
          {label}
        </span>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      {/* Track */}
      <div className="relative w-11 h-6 rounded-full bg-gray-200 peer-checked:bg-[#008060] transition-colors duration-200 ease-in-out shrink-0 shadow-inner">
        {/* Thumb */}
        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out peer-checked:translate-x-5 group-has-[:checked]:translate-x-5" />
      </div>
    </label>
  );
}

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
                <Toggle
                  name="emailAlerts"
                  label="Email alerts"
                  description="Get notified about low stock alerts and purchase order updates"
                  defaultChecked={settings?.emailAlerts ?? true}
                />
                <TextField
                  name="slackWebhookUrl"
                  label="Slack Webhook URL"
                  value={slackUrl}
                  onChange={(val) => setSlackUrl(val)}
                  autoComplete="off"
                  placeholder="https://hooks.slack.com/services/..."
                  helpText="Leave empty to disable Slack notifications"
                />
                <TextField
                  name="smsPhoneNumbers"
                  label="SMS Alert Phone Numbers"
                  value={smsPhones}
                  onChange={(val) => setSmsPhones(val)}
                  autoComplete="off"
                  placeholder="+15551234567, +15559876543"
                  helpText="Comma-separated list of phone numbers for critical stock alerts"
                />
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
