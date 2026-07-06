import React from 'react';
import { Card as PolarisCard } from '@shopify/polaris';
import { SettingsData } from '../../types';
import './SettingsCard.css';

export interface SettingsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export const SettingsCard = ({ title, description, children, action, ...props }: SettingsCardProps) => {
  return (
    <PolarisCard padding="400" {...props}>
      <div className="sf-settings-card__header">
        <div className="sf-settings-card__title-section">
          <h3 className="sf-settings-card__title">{title}</h3>
          {description && <p className="sf-settings-card__description">{description}</p>}
        </div>
        {action && <div className="sf-settings-card__action">{action}</div>}
      </div>
      <div className="sf-settings-card__content">{children}</div>
    </PolarisCard>
  );
};

export default SettingsCard;