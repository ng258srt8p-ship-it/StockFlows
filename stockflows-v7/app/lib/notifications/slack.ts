import { logger } from "~/lib/logger";

interface SlackAlertProps {
  productName: string;
  locationName: string;
  currentQty: number;
  reorderPoint: number;
  urgency: "CRITICAL" | "WARNING" | "INFO";
}

export async function sendSlackAlert(
  webhookUrl: string,
  props: SlackAlertProps
) {
  const emoji = props.urgency === "CRITICAL" ? "🔴" : props.urgency === "WARNING" ? "🟡" : "🔵";

  const payload = {
    text: `${emoji} ${props.productName} is low on stock at ${props.locationName}`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `${emoji} Inventory Alert` },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Product:*\n${props.productName}` },
          { type: "mrkdwn", text: `*Location:*\n${props.locationName}` },
          { type: "mrkdwn", text: `*Current Stock:*\n${props.currentQty} units` },
          { type: "mrkdwn", text: `*Reorder Point:*\n${props.reorderPoint} units` },
        ],
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Create PO" },
            style: "primary",
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Slack webhook failed: ${response.status} — ${error}`);
    }
  } catch (error) {
    logger.error({ err: error }, "Failed to send Slack alert");
    throw error;
  }
}
