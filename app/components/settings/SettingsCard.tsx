import { Card } from "@shopify/polaris";
import type { ReactNode } from "react";
import { SettingsSection } from "./SettingsSection";

interface SettingsCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

/**
 * A complete settings card: Polaris Card with standard header
 * (title + description) and a content area separated by spacing.
 */
export function SettingsCard({ title, description, children }: SettingsCardProps) {
  return (
    <Card>
      <div className="p-4">
        <SettingsSection title={title} description={description} />
        <div className="space-y-4 mt-4">{children}</div>
      </div>
    </Card>
  );
}