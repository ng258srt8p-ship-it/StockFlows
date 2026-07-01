import { Text } from "@shopify/polaris";

interface SettingsSectionProps {
  title: string;
  description?: string;
}

/**
 * Reusable card header pattern: heading + optional description.
 * Used inside SettingsCard or any other Card-based layout.
 */
export function SettingsSection({ title, description }: SettingsSectionProps) {
  return (
    <>
      <Text variant="headingLg" as="h2" className="text-gray-900 font-semibold">
        {title}
      </Text>
      {description && (
        <Text variant="bodySm" as="p" tone="subdued" className="mt-1">
          {description}
        </Text>
      )}
    </>
  );
}