import React from 'react';
import { Page } from '@shopify/polaris';
import type { MenuGroupDescriptor } from '@shopify/polaris';
import './PageHeader.css';

export interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{ content: string; url?: string }>;
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  actionGroups?: MenuGroupDescriptor[];
  backAction?: { content: string; onAction: () => void };
  children?: React.ReactNode;
  fullWidth?: boolean;
  narrowWidth?: boolean;
}

export const PageHeader = ({
  title,
  subtitle,
  primaryAction,
  secondaryActions,
  actionGroups,
  backAction,
  children,
  fullWidth = false,
  narrowWidth = false,
}: PageHeaderProps) => {
  return (
    <div className="sf-page-header">
      <Page
        title={title}
        subtitle={subtitle}
        primaryAction={primaryAction}
        secondaryActions={secondaryActions}
        actionGroups={actionGroups}
        backAction={backAction}
        fullWidth={fullWidth}
        narrowWidth={narrowWidth}
      >
        {children}
      </Page>
    </div>
  );
};

PageHeader.displayName = 'PageHeader';