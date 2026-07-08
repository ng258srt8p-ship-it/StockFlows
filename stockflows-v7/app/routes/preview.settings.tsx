/**
 * Local preview page — renders the REAL Settings component
 * without Shopify auth so you can visually inspect it in the browser.
 *
 * Visit: http://localhost:5173/preview/settings
 */
import Settings from "~/routes/app.settings";

export default function PreviewSettingsPage() {
  // Simply render the real Settings component.
  // The root.tsx loader bypasses auth for /preview/* paths,
  // and the Settings component uses useLoaderData / useActionData
  // which will receive mock data from this route's loader.
  return <Settings />;
}

/**
 * Mock loader that provides fake settings data
 * so the real Settings component renders without a database.
 */
export const loader = async () => {
  return {
    settings: {
      lowStockThreshold: 10,
      criticalStockThreshold: 3,
      safetyStockMultiplier: 1.5,
      forecastHorizonDays: 30,
      slackWebhookUrl: "",
      smsPhoneNumbers: [],
      currency: "USD",
      emailAlerts: true,
      enableAiInsights: false,
      enableForecastExplanations: false,
    },
    locations: [],
  };
};