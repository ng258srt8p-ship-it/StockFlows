import React from 'react';
import { Avatar as PolarisAvatar } from '@shopify/polaris';
import './Avatar.css';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  size?: AvatarSize;
  name?: string;
  initials?: string;
  customer?: boolean;
  source?: string;
  onError?: () => void;
  accessibilityLabel?: string;
}

export const Avatar = ({
  size = 'md',
  name,
  initials,
  customer,
  source,
  onError,
  accessibilityLabel,
  ...props
}: AvatarProps) => {
  return (
    <div className="sf-avatar">
      <PolarisAvatar
        size={size}
        name={name}
        initials={initials}
        customer={customer}
        source={source}
        onError={onError}
        accessibilityLabel={accessibilityLabel}
        {...props}
      />
    </div>
  );
};

export default Avatar;