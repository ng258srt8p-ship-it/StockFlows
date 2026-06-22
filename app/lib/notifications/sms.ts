import twilio from "twilio";
import { logger } from "~/lib/logger";

// ---------------------------------------------------------------------------
// Twilio client — initialised only when credentials are present.
// When TWILIO_ACCOUNT_SID is unset the module operates in stub mode and logs
// messages to the console instead of sending real SMS.
// ---------------------------------------------------------------------------

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Urgency = "CRITICAL" | "WARNING" | "INFO";

// ---------------------------------------------------------------------------
// Core send function
// ---------------------------------------------------------------------------

/**
 * Send an SMS alert via Twilio. Falls back to console logging when the Twilio
 * credentials are not configured.
 */
export async function sendSMSAlert(
  to: string,
  message: string,
): Promise<void> {
  if (!client) {
    console.log("[SMS STUB] To:", to, "Message:", message);
    return;
  }

  if (!fromNumber) {
    logger.error("TWILIO_PHONE_NUMBER env var is not set — cannot send SMS");
    return;
  }

  try {
    await client.messages.create({
      body: message,
      from: fromNumber,
      to,
    });
    logger.info({ to }, "SMS sent successfully");
  } catch (error) {
    logger.error({ err: error, to }, "Failed to send SMS via Twilio");
  }
}

// ---------------------------------------------------------------------------
// Stock-alert convenience wrapper
// ---------------------------------------------------------------------------

/**
 * Send a formatted stock-alert SMS to the given phone number.
 */
export function sendStockAlertSMS(
  phoneNumber: string,
  productName: string,
  currentQty: number,
  locationName: string,
  urgency: Urgency,
): Promise<void> {
  const message =
    `\u{1F6A8} STOCKPULSE: ${productName} is ${urgency} at ` +
    `${locationName} (${currentQty} units remaining)`;

  return sendSMSAlert(phoneNumber, message);
}
