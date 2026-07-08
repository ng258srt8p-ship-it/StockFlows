import {
  Html,
  Container,
  Text,
  Button,
  Heading,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface LowStockAlertProps {
  productName: string;
  locationName: string;
  currentQty: number;
  reorderPoint: number;
  recommendedQty: number;
  urgency: "WARNING" | "CRITICAL";
  shopDomain: string;
}

export default function LowStockAlert({
  productName,
  locationName,
  currentQty,
  reorderPoint,
  recommendedQty,
  urgency,
  shopDomain,
}: LowStockAlertProps) {
  const isCritical = urgency === "CRITICAL";
  const accentColor = isCritical ? "#d72c0d" : "#f49342";
  const bgColor = isCritical ? "#fef1f1" : "#fff8f0";

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
          <div
            style={{
              backgroundColor: bgColor,
              borderRadius: "8px",
              padding: "16px 20px",
              marginBottom: "24px",
              borderLeft: `4px solid ${accentColor}`,
            }}
          >
            <Heading
              as="h1"
              style={{
                color: accentColor,
                fontSize: "20px",
                margin: "0 0 4px 0",
              }}
            >
              {isCritical ? "CRITICAL" : "WARNING"} Stock Alert
            </Heading>
            <Text style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>
              {isCritical
                ? "Immediate restocking required"
                : "Stock running low - action recommended"}
            </Text>
          </div>

          {/* Product info */}
          <Text style={{ fontSize: "16px", color: "#111827", margin: "0 0 4px 0" }}>
            <strong>{productName}</strong>
          </Text>
          <Text style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 24px 0" }}>
            Location: {locationName}
          </Text>

          <Hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "0 0 24px 0" }} />

          {/* Metrics */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
            <tbody>
              <tr>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #f3f4f6", color: "#6b7280", fontSize: "14px" }}>
                  Current Stock
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid #f3f4f6",
                    textAlign: "right",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: accentColor,
                  }}
                >
                  {currentQty}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #f3f4f6", color: "#6b7280", fontSize: "14px" }}>
                  Reorder Point
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #f3f4f6", textAlign: "right", fontSize: "14px", color: "#111827" }}>
                  {reorderPoint}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "10px 12px", color: "#6b7280", fontSize: "14px" }}>
                  Recommended Order
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#111827",
                  }}
                >
                  {recommendedQty}
                </td>
              </tr>
            </tbody>
          </table>

          {/* CTA */}
          <Button
            href={`https://${shopDomain}/admin/apps/stockflows/app/purchasing/new`}
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
            Create Purchase Order
          </Button>

          <Hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "24px 0 16px 0" }} />

          <Text style={{ color: "#9ca3af", fontSize: "12px", margin: 0 }}>
            This is an automated alert from StockFlows. You can manage alert
            preferences in the app settings.
          </Text>
        </Container>
      </Container>
    </Html>
  );
}
