import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form, useNavigation, useActionData } from "@remix-run/react";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import { requirePermission } from "~/lib/auth/middleware";
import { useState } from "react";
import { IosToggle } from "~/components/ui/PillToggle";

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
// iOS Settings helpers
// ---------------------------------------------------------------------------

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <p className="ios-section-header">{children}</p>;
}

function SectionGroup({ children }: { children: React.ReactNode }) {
  return <div className="ios-section">{children}</div>;
}

function NumberRow({
  name,
  label,
  value,
  onChange,
  suffix,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <div className="ios-row">
      <span className="ios-row-label">{label}</span>
      <div className="flex items-center gap-2">
        <input
          name={name}
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-16 text-right bg-transparent border-none outline-none text-[0.9375rem] text-black font-normal"
        />
        {suffix && <span className="ios-row-value text-sm">{suffix}</span>}
        <span className="ios-chevron" />
      </div>
    </div>
  );
}

function SelectRow({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value: string;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="ios-row">
      <span className="ios-row-label">{label}</span>
      <div className="flex items-center gap-2">
        <select
          name={name}
          defaultValue={value}
          className="bg-transparent border-none outline-none text-[0.9375rem] text-[#6d6d72] appearance-none cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="ios-chevron" />
      </div>
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

  const [emailOn, setEmailOn] = useState(settings?.emailAlerts ?? true);
  const [slackOn, setSlackOn] = useState(!!settings?.slackWebhookUrl);
  const [smsOn, setSmsOn] = useState(Array.isArray(settings?.smsPhoneNumbers) && (settings.smsPhoneNumbers as string[]).length > 0);
  const [aiInsightsOn, setAiInsightsOn] = useState(settings?.enableAiInsights ?? false);
  const [forecastExplOn, setForecastExplOn] = useState(settings?.enableForecastExplanations ?? false);

  return (
    <div className="ios-settings">
      <h1 className="text-[2rem] font-bold text-black -mt-4 mb-2 pl-4">Settings</h1>

      {actionData?.success && (
        <div className="ios-section mb-4 mx-5">
          <div className="px-4 py-3 text-sm text-[#008060] font-medium">
            Settings saved successfully.
          </div>
        </div>
      )}

      <Form method="post">
        {/* ── Notifications ─────────────────────────────── */}
        <SectionHeader>Notifications</SectionHeader>
        <SectionGroup>
          <IosToggle
            name="emailAlerts"
            label="Email Alerts"
            icon="mail"
            iconBg="#008060"
            value={emailOn}
            onChange={setEmailOn}
          />
          <IosToggle
            name="slackEnabled"
            label="Slack Alerts"
            icon="chat"
            iconBg="#36a64f"
            value={slackOn}
            onChange={setSlackOn}
          />
          <div
            className="ios-expand"
            style={{ gridTemplateRows: slackOn ? "1fr" : "0fr" }}
          >
            <div className="ios-expand-inner">
              <div className="ios-expand-input">
                <input
                  name="slackWebhookUrl"
                  type="url"
                  value={slackUrl}
                  onChange={(e) => setSlackUrl(e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                  disabled={!slackOn}
                  className="w-full px-3 py-2 rounded-lg bg-[#f2f2f7] border border-[#e5e5ea] text-sm outline-none focus:border-[#008060] disabled:opacity-40"
                />
                <p className="text-xs text-[#6d6d72] mt-1 ml-1">
                  Create one at Settings &gt; Apps &gt; Incoming Webhooks
                </p>
              </div>
            </div>
          </div>
          <IosToggle
            name="smsEnabled"
            label="SMS Alerts"
            icon="smartphone"
            iconBg="#af52de"
            value={smsOn}
            onChange={setSmsOn}
          />
          <div
            className="ios-expand"
            style={{ gridTemplateRows: smsOn ? "1fr" : "0fr" }}
          >
            <div className="ios-expand-inner">
              <div className="ios-expand-input">
                <input
                  name="smsPhoneNumbers"
                  type="text"
                  value={smsPhones}
                  onChange={(e) => setSmsPhones(e.target.value)}
                  placeholder="+15551234567, +15559876543"
                  disabled={!smsOn}
                  className="w-full px-3 py-2 rounded-lg bg-[#f2f2f7] border border-[#e5e5ea] text-sm outline-none focus:border-[#008060] disabled:opacity-40"
                />
                <p className="text-xs text-[#6d6d72] mt-1 ml-1">
                  Comma-separated phone numbers for critical stock alerts
                </p>
              </div>
            </div>
          </div>
        </SectionGroup>

        {/* ── Alert Thresholds ──────────────────────────── */}
        <SectionHeader>Alert Thresholds</SectionHeader>
        <SectionGroup>
          <NumberRow
            name="lowStockThreshold"
            label="Low Stock"
            value={lowStock}
            onChange={setLowStock}
          />
          <NumberRow
            name="criticalStockThreshold"
            label="Critical Stock"
            value={criticalStock}
            onChange={setCriticalStock}
          />
        </SectionGroup>

        {/* ── Forecasting ───────────────────────────────── */}
        <SectionHeader>Forecasting</SectionHeader>
        <SectionGroup>
          <NumberRow
            name="forecastHorizonDays"
            label="Forecast Horizon"
            value={forecastHorizon}
            onChange={setForecastHorizon}
            suffix="days"
          />
        </SectionGroup>

        {/* ── AI Features ───────────────────────────────── */}
        <SectionHeader>AI Features</SectionHeader>
        <SectionGroup>
          <IosToggle
            name="enableAiInsights"
            label="AI Insights"
            icon="auto_awesome"
            iconBg="#ff9500"
            value={aiInsightsOn}
            onChange={setAiInsightsOn}
          />
          <p className="ios-row-sublabel">
            Uses OpenCode API to analyze inventory data and generate insights.
            Statistical forecasting still works when AI is disabled.
          </p>
          <IosToggle
            name="enableForecastExplanations"
            label="Forecast Explanations"
            icon="auto_stories"
            iconBg="#5856d6"
            value={forecastExplOn}
            onChange={setForecastExplOn}
          />
          <p className="ios-row-sublabel">
            Shows AI-generated natural language explanations of forecast data.
          </p>
        </SectionGroup>

        {/* ── General ────────────────────────────────────── */}
        <SectionHeader>General</SectionHeader>
        <SectionGroup>
          <SelectRow
            name="currency"
            label="Currency"
            value={settings?.currency || "USD"}
            options={[
              { label: "USD ($)", value: "USD" },
              { label: "EUR (€)", value: "EUR" },
              { label: "GBP (£)", value: "GBP" },
              { label: "CAD (C$)", value: "CAD" },
              { label: "AUD (A$)", value: "AUD" },
            ]}
          />
        </SectionGroup>

        {/* ── Save ──────────────────────────────────────── */}
        <div className="px-5 pt-4 pb-10">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-[#008060] text-white font-semibold text-base
              hover:bg-[#006e50] active:scale-[0.98] transition-all duration-150
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </Form>
    </div>
  );
}
