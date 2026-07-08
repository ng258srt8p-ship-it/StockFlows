import { Card, Text } from "@shopify/polaris";
import type { ReactNode } from "react";

interface SettingsCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

/**
 * A settings card using native Polaris Card component.
 * Matches the pattern used by Forecasting and other app pages.
 */
export function SettingsCard({ title, description, children }: SettingsCardProps) {
  return (
    <Card>
      <div className="p-4">
        <Text variant="headingSm" as="h3">
          {title}
        </Text>
        {description && (
          <Text variant="bodySm" as="p" tone="subdued" className="mt-1">
            {description}
          </Text>
        )}
        <div className="space-y-4 mt-4">{children}</div>
      </div>
    </Card>
  );
}
