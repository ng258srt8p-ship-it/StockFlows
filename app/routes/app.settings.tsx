import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form, useNavigation, useActionData } from "@remix-run/react";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import { requirePermission } from "~/lib/auth/middleware";
import {
  Page,
  Layout,
  Card,
  TextField,
  Select,
  Button,
  Banner,
  Checkbox,
  Text,
} from "@shopify/polaris";
import { useState } from "react";

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

  // Parse SMS phone numbers from comma-separated string
  const smsRaw = (formData.get("smsPhoneNumbers") as string || "").trim();
  const smsPhoneNumbers = smsRaw
    ? smsRaw.split(",").map((n: string) => n.trim()).filter(Boolean)
    : null;

  await prisma.shopSetting.upsert({
    where: { shopId },
    create: {
      shopId,
      lowStockThreshold: Number(formData.get("lowStockThreshold")) || 10,
      criticalStockThreshold: Number(formData.get("criticalStockThreshold")) || 3,
      forecastHorizonDays: Number(formData.get("forecastHorizonDays")) || 30,
      emailAlerts: formData.get("emailAlerts") === "on",
      slackWebhookUrl: formData.get("slackWebhookUrl") as string || null,
      smsPhoneNumbers: smsPhoneNumbers as any,
      currency: formData.get("currency") as string || "USD",
    },
    update: {
      lowStockThreshold: Number(formData.get("lowStockThreshold")) || 10,
      criticalStockThreshold: Number(formData.get("criticalStockThreshold")) || 3,
      forecastHorizonDays: Number(formData.get("forecastHorizonDays")) || 30,
      emailAlerts: formData.get("emailAlerts") === "on",
      slackWebhookUrl: formData.get("slackWebhookUrl") as string || null,
      smsPhoneNumbers: smsPhoneNumbers as any,
      currency: formData.get("currency") as string || "USD",
    },
  });

  return json({ success: true });
};

export default function Settings() {
  const { settings, locations } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Page title="Settings">
      <Layout>
        <Layout.Section>
          {actionData?.success && (
            <Banner tone="success">
              <p>Settings saved successfully.</p>
            </Banner>
          )}

          <Form method="post">
            <Card title="Alert Thresholds">
              <div className="p-4 space-y-4">
                <TextField
                  name="lowStockThreshold"
                  label="Low stock alert threshold"
                  type="number"
                  value={String(settings?.lowStockThreshold || 10)}
                  helpText="Alert when stock drops below this level"
                />
                <TextField
                  name="criticalStockThreshold"
                  label="Critical stock threshold"
                  type="number"
                  value={String(settings?.criticalStockThreshold || 3)}
                  helpText="Critical alert when stock drops below this level"
                />
              </div>
            </Card>

            <div className="mt-4">
              <Card title="Forecasting">
                <div className="p-4">
                  <TextField
                    name="forecastHorizonDays"
                    label="Forecast horizon (days)"
                    type="number"
                    value={String(settings?.forecastHorizonDays || 30)}
                    helpText="How many days ahead to forecast"
                  />
                </div>
              </Card>
            </div>

            <div className="mt-4">
              <Card title="Notifications">
                <div className="p-4 space-y-4">
                  <Checkbox
                    name="emailAlerts"
                    label="Enable email alerts"
                    checked={settings?.emailAlerts ?? true}
                  />
                  <TextField
                    name="slackWebhookUrl"
                    label="Slack Webhook URL"
                    value={settings?.slackWebhookUrl || ""}
                    placeholder="https://hooks.slack.com/services/..."
                    helpText="Leave empty to disable Slack notifications"
                  />
                  <TextField
                    name="smsPhoneNumbers"
                    label="SMS Alert Phone Numbers"
                    value={
                      Array.isArray(settings?.smsPhoneNumbers)
                        ? (settings.smsPhoneNumbers as string[]).join(", ")
                        : ""
                    }
                    placeholder="+15551234567, +15559876543"
                    helpText="Comma-separated list of phone numbers for critical stock alerts. Leave empty to disable SMS."
                  />
                </div>
              </Card>
            </div>

            <div className="mt-4">
              <Card title="General">
                <div className="p-4">
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
                </div>
              </Card>
            </div>

            <div className="mt-4">
              <Button submit primary loading={isSubmitting}>
                Save Settings
              </Button>
            </div>
          </Form>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
