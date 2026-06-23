import { Card, Text, Button } from "@shopify/polaris";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: { label: string; url: string | (() => void) };
  icon?: string;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <Card>
      <div className="p-8 text-center">
        {icon && <div className="text-4xl mb-4">{icon}</div>}
        <Text variant="headingMd" as="h3">
          {title}
        </Text>
        <Text variant="bodyMd" as="p" tone="subdued">
          {description}
        </Text>
        {action && (
          <Button
            primary
            url={typeof action.url === "string" ? action.url : undefined}
            onClick={typeof action.url === "function" ? action.url : undefined}
          >
            {action.label}
          </Button>
        )}
      </div>
    </Card>
  );
}
