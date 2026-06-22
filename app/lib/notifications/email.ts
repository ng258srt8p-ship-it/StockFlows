import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface LowStockEmailProps {
  shopDomain: string;
  productName: string;
  locationName: string;
  currentQty: number;
  reorderPoint: number;
  urgency: string;
  recommendedQty: number;
}

export async function sendLowStockEmail(props: LowStockEmailProps) {
  if (!resend) {
    console.log("[EMAIL STUB] Low stock:", props.productName);
    return;
  }

  const emoji = props.urgency === "CRITICAL" ? "🔴" : "🟡";
  const fromEmail = process.env.RESEND_FROM_EMAIL || "alerts@stockflows.app";

  await resend.emails.send({
    from: `StockFlows <${fromEmail}>`,
    to: await getShopEmail(props.shopDomain),
    subject: `${emoji} ${props.urgency}: ${props.productName} needs restocking`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: ${props.urgency === "CRITICAL" ? "#d72c0d" : "#f49342"};">
          ${emoji} ${props.urgency} Stock Alert
        </h1>
        <p><strong>${props.productName}</strong> at <strong>${props.locationName}</strong>
           has dropped below the reorder point.</p>
        <table style="border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;">Current Stock</td>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>${props.currentQty}</strong></td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;">Reorder Point</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${props.reorderPoint}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;">Recommended Order</td>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>${props.recommendedQty}</strong></td></tr>
        </table>
        <a href="https://${props.shopDomain}/admin/apps/stockflows/app/purchasing/new"
           style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
          Create Purchase Order
        </a>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          This is an automated alert from StockFlows.
        </p>
      </div>
    `,
  });
}

async function getShopEmail(shopDomain: string): Promise<string> {
  // In production, look up shop owner email from DB
  // For now, use a placeholder
  return process.env.ALERT_EMAIL || "admin@" + shopDomain;
}
