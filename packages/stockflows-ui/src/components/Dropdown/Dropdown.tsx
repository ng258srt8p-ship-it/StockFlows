import React from 'react';
import { ActionList as PolarisActionList, Popover as PolarisPopover, PopoverCloseSource, type IconSource } from '@shopify/polaris';
import './Dropdown.css';

export interface DropdownAction {
  content: string;
  onAction?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  helpText?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  icon?: IconSource;
  url?: string;
  external?: boolean;
  target?: string;
  id?: string;
  accessibilityLabel?: string;
}

export interface DropdownSection {
  title?: string;
  items: DropdownAction[];
}

export interface DropdownProps {
  open: boolean;
  activator: React.ReactElement;
  actions?: DropdownAction[];
  sections?: DropdownSection[];
  onClose: (source: PopoverCloseSource) => void;
  fullWidth?: boolean;
  preferredAlignment?: 'left' | 'center' | 'right';
  preferredPosition?: 'above' | 'below' | 'mostSpace';
}

export const Dropdown = ({
  open,
  activator,
  actions,
  sections,
  onClose,
  fullWidth = true,
  preferredAlignment = 'left',
  preferredPosition = 'below',
}: DropdownProps) => {
  return (
    <div className="sf-dropdown">
      <PolarisPopover
        active={open}
        activator={activator}
        onClose={onClose}
        fullWidth={fullWidth}
        preferredAlignment={preferredAlignment}
        preferredPosition={preferredPosition}
        sectioned={false}
      >
        <div className="sf-dropdown__content">
          {sections ? (
            sections.map((section, index) => (
              <PolarisActionList
                key={index}
                items={section.items as any}
                sections={section.title ? [{ title: section.title, items: section.items as any }] : undefined}
              />
            ))
          ) : actions ? (
            <PolarisActionList items={actions as any} />
          ) : null}
        </div>
      </PolarisPopover>
    </div>
  );
};

export default Dropdown;