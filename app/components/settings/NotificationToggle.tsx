import type { ReactNode } from "react";

interface NotificationToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  name: string;
  additionalFields?: ReactNode;
}

/**
 * A reusable toggle row using custom-styled toggle matching demo visual style.
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
      <div className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}>
        <span className="text-sm" style={{ color: "var(--text-primary)" }}>
          {label}
        </span>
        <div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
            />
            <div
              className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"
              style={{ backgroundColor: checked ? "var(--accent)" : "var(--border)" }}
            />
          </label>
          <input type="hidden" name={name} value={checked ? "on" : ""} />
        </div>
      </div>
      {checked && additionalFields && (
        <div className="mt-2">{additionalFields}</div>
      )}
    </>
  );
}
