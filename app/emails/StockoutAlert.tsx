import {
  Html,
  Container,
  Text,
  Button,
  Heading,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface StockoutAlertProps {
  productName: string;
  locationName: string;
  currentQty: number;
  reorderPoint: number;
  recommendedQty: number;
  shopDomain: string;
}

export default function StockoutAlert({
  productName,
  locationName,
  currentQty,
  reorderPoint,
  recommendedQty,
  shopDomain,
}: StockoutAlertProps) {
  const accentColor = "#d72c0d";

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
            border: `2px solid ${accentColor}`,
          }}
        >
          {/* Urgent header */}
          <div
            style={{
              backgroundColor: "#fef1f1",
              borderRadius: "8px",
              padding: "16px 20px",
              marginBottom: "24px",
              borderLeft: `4px solid ${accentColor}`,
              textAlign: "center" as const,
            }}
          >
            <Heading
              as="h1"
              style={{
                color: accentColor,
                fontSize: "24px",
                margin: "0 0 4px 0",
                letterSpacing: "1px",
              }}
            >
              OUT OF STOCK
            </Heading>
            <Text style={{ color: "#991b1b", fontSize: "13px", margin: 0, fontWeight: "bold" }}>
              Immediate restocking required
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

          {/* Urgent CTA */}
          <div style={{ textAlign: "center" as const, marginBottom: "24px" }}>
            <Button
              href={`https://${shopDomain}/admin/apps/stockflows/app/purchasing/new`}
              style={{
                backgroundColor: accentColor,
                color: "#ffffff",
                padding: "14px 28px",
                borderRadius: "6px",
                fontSize: "15px",
                fontWeight: "bold",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Urgent - Create Purchase Order
            </Button>
          </div>

          <Hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "0 0 16px 0" }} />

          <Text style={{ color: "#9ca3af", fontSize: "12px", margin: 0 }}>
            This is an urgent automated alert from StockFlows. You can manage
            alert preferences in the app settings.
          </Text>
        </Container>
      </Container>
    </Html>
  );
}
