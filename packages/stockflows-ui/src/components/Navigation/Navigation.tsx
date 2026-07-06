import React from 'react';
import { Navigation as PolarisNavigation } from '@shopify/polaris';
import './Navigation.css';

export interface NavigationItem {
  label: string;
  url: string;
  icon?: React.ReactNode;
  badge?: string | number;
  new?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export interface NavigationProps {
  items: NavigationItem[];
  activeItem?: string;
  onItemClick?: (item: NavigationItem) => void;
  logo?: React.ReactNode;
  className?: string;
}

export const Navigation = ({
  items,
  activeItem,
  onItemClick,
  logo,
  className = '',
}: NavigationProps) => {
  return (
    <div className={`sf-navigation ${className}`}>
      <PolarisNavigation location="/">
        <PolarisNavigation.Section
          items={items.map((item) => ({
            url: item.url,
            label: item.label,
            selected: item.url === activeItem || item.selected === true,
            onClick: item.onClick ? () => item.onClick!() : undefined,
            badge: item.badge != null ? String(item.badge) : undefined,
          }))}
        />
      </PolarisNavigation>
    </div>
  );
};

Navigation.displayName = 'Navigation';