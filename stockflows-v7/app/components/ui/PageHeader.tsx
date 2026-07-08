import { Page } from "@shopify/polaris";

interface Breadcrumb {
  content: string;
  url?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  primaryAction?: { content: string; url?: string; onAction?: () => void };
  secondaryActions?: Array<{ content: string; url?: string; onAction?: () => void }>;
  children: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  primaryAction,
  secondaryActions,
  children,
}: PageHeaderProps) {
  return (
    <Page
      title={title}
      subtitle={subtitle}
      breadcrumbs={breadcrumbs}
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
    >
      {children}
    </Page>
  );
}
