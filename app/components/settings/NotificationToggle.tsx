import { Checkbox, Text } from "@shopify/polaris";
import type { ReactNode } from "react";

interface NotificationToggleProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  hiddenName: string;
  additionalFields?: ReactNode;
}

/**
 * A reusable toggle row with a label on the left and a Polaris Checkbox
 * (acting as a switch) on the right, plus a hidden input so the
 * unchecked state is still submitted to the Remix action.
 *
 * Optionally renders `additionalFields` below the row when toggled on
 * (e.g. Slack webhook URL, SMS phone numbers).
 */
export function NotificationToggle({
  label,
  enabled,
  onChange,
  hiddenName,
  additionalFields,
}: NotificationToggleProps) {
  return (
    <>
      <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
        <Text variant="bodyMd" as="p">
          {label}
        </Text>
        <div>
          <Checkbox
            label={label}
            labelHidden
            checked={enabled}
            onChange={onChange}
          />
          <input
            type="hidden"
            name={hiddenName}
            value={enabled ? "on" : ""}
          />
        </div>
      </div>
      {enabled && additionalFields && (
        <div className="mt-2">{additionalFields}</div>
      )}
    </>
  );
}