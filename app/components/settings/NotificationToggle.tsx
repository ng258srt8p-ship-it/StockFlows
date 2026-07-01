import { Checkbox, TextField, Text } from "@shopify/polaris";
import type { ReactNode } from "react";

interface NotificationToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  name: string;
  additionalFields?: ReactNode;
}

/**
 * A reusable toggle row using Polaris Checkbox (acting as a toggle).
 * Uses hidden input for form submission so unchecked state is still submitted.
 */
export function NotificationToggle({
  label,
  checked,
  onChange,
  name,
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
            checked={checked}
            onChange={onChange}
          />
          <input
            type="hidden"
            name={name}
            value={checked ? "on" : ""}
          />
        </div>
      </div>
      {checked && additionalFields && (
        <div className="mt-2">{additionalFields}</div>
      )}
    </>
  );
}
