import {
  Html,
  Container,
  Text,
  Button,
  Heading,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface LineItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface POStatusUpdateProps {
  poNumber: string;
  vendorName: string;
  newStatus: string;
  lineItems: LineItem[];
  shopDomain: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "#6b7280",
  submitted: "#2563eb",
  confirmed: "#059669",
  shipped: "#d97706",
  delivered: "#16a34a",
  cancelled: "#d72c0d",
};

export default function POStatusUpdate({
  poNumber,
  vendorName,
  newStatus,
  lineItems,
  shopDomain,
}: POStatusUpdateProps) {
  const statusColor = STATUS_COLORS[newStatus.toLowerCase()] ?? "#6b7280";
  const totalCost = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <Html lang="en">
      <Container
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "40px 20px",
          backgroundColor: "#f4f4f5",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            padding: "32px",
            maxWidth: "520px",
          }}
        >
          {/* Header */}
          <Heading
            as="h1"
            style={{ fontSize: "20px", color: "#111827", margin: "0 0 4px 0" }}
          >
            Purchase Order Updated
          </Heading>
          <Text style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 24px 0" }}>
            PO #{poNumber} has been updated
          </Text>

          <Hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "0 0 24px 0" }} />

          {/* Status badge */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
            <tbody>
              <tr>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #f3f4f6", color: "#6b7280", fontSize: "14px" }}>
                  PO Number
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #f3f4f6", textAlign: "right", fontSize: "14px", fontWeight: "bold", color: "#111827" }}>
                  #{poNumber}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #f3f4f6", color: "#6b7280", fontSize: "14px" }}>
                  Vendor
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #f3f4f6", textAlign: "right", fontSize: "14px", color: "#111827" }}>
                  {vendorName}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "10px 12px", color: "#6b7280", fontSize: "14px" }}>
                  New Status
                </td>
                <td style={{ padding: "10px 12px", textAlign: "right" }}>
                  <span
                    style={{
                      display: "inline-block",
                      backgroundColor: statusColor,
                      color: "#ffffff",
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "13px",
                      fontWeight: "bold",
                      textTransform: "capitalize" as const,
                    }}
                  >
                    {newStatus}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Line items */}
          {lineItems.length > 0 && (
            <>
              <Text style={{ fontSize: "14px", color: "#374151", fontWeight: "bold", margin: "0 0 12px 0" }}>
                Line Items
              </Text>
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", color: "#6b7280", fontWeight: "bold" }}>
                      Product
                    </th>
                    <th style={{ padding: "8px 12px", textAlign: "right", fontSize: "12px", color: "#6b7280", fontWeight: "bold" }}>
                      Qty
                    </th>
                    <th style={{ padding: "8px 12px", textAlign: "right", fontSize: "12px", color: "#6b7280", fontWeight: "bold" }}>
                      Unit Price
                    </th>
                    <th style={{ padding: "8px 12px", textAlign: "right", fontSize: "12px", color: "#6b7280", fontWeight: "bold" }}>
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "10px 12px", fontSize: "14px", color: "#111827" }}>
                        {item.productName}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: "14px", color: "#111827", textAlign: "right" }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: "14px", color: "#111827", textAlign: "right" }}>
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: "14px", color: "#111827", textAlign: "right", fontWeight: "bold" }}>
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "0 0 12px 0" }} />
              <table style={{ width: "100%", marginBottom: "24px" }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "0 12px", fontSize: "16px", fontWeight: "bold", color: "#111827" }}>
                      Total
                    </td>
                    <td style={{ padding: "0 12px", fontSize: "16px", fontWeight: "bold", color: "#111827", textAlign: "right" }}>
                      ${totalCost.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          )}

          {/* CTA */}
          <div style={{ textAlign: "center" as const, marginBottom: "24px" }}>
            <Button
              href={`https://${shopDomain}/admin/apps/stockflows/app/purchasing/${poNumber}`}
              style={{
                backgroundColor: "#0066cc",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "bold",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              View Purchase Order
            </Button>
          </div>

          <Hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "0 0 16px 0" }} />

          <Text style={{ color: "#9ca3af", fontSize: "12px", margin: 0 }}>
            This is an automated notification from StockFlows. You can manage
            alert preferences in the app settings.
          </Text>
        </Container>
      </Container>
    </Html>
  );
}
