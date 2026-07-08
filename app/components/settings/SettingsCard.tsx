import type { ReactNode } from "react";

interface SettingsCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

/**
 * A settings card using CSS variables matching demo visual style.
 */
export function SettingsCard({ title, description, children }: SettingsCardProps) {
  return (
    <div className="rounded-lg border p-5" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
      <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
        {title}
      </h3>
      {description && (
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
      )}
      <div className="space-y-4 mt-4">{children}</div>
    </div>
  );
}
