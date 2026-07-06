import React from 'react';
import { Tabs as PolarisTabs } from '@shopify/polaris';
import './Tabs.css';

export interface TabItem {
  id: string;
  content: string;
  panelID?: string;
  badge?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  url?: string;
  onAction?: () => void;
}

export interface TabsProps {
  tabs: TabItem[];
  selected: number;
  onSelect?: (selectedTabIndex: number) => void;
  children?: React.ReactNode;
  fitted?: boolean;
  disabled?: boolean;
  canCreateNewView?: boolean;
  newViewAccessibilityLabel?: string;
  onCreateNewView?: (value: string) => Promise<boolean>;
  disclosureText?: string;
}

export const Tabs = ({
  tabs,
  selected,
  onSelect,
  children,
  fitted,
  disabled,
  canCreateNewView,
  newViewAccessibilityLabel,
  onCreateNewView,
  disclosureText,
}: TabsProps) => {
  return (
    <div className="sf-tabs">
      <PolarisTabs
        tabs={tabs}
        selected={selected}
        onSelect={onSelect}
        fitted={fitted}
        disabled={disabled}
        canCreateNewView={canCreateNewView}
        newViewAccessibilityLabel={newViewAccessibilityLabel}
        onCreateNewView={onCreateNewView}
        disclosureText={disclosureText}
      >
        {children}
      </PolarisTabs>
    </div>
  );
};

export default Tabs;