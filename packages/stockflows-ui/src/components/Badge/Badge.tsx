import React from 'react';
import { Badge as PolarisBadge, type BadgeProps as PolarisBadgeProps } from '@shopify/polaris';
import type { IconSource } from '@shopify/polaris';
import './Badge.css';

export interface BadgeProps {
  children: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'critical' | 'info' | 'attention' | 'new' | 'magic';
  size?: 'small' | 'medium' | 'large';
  tone?: PolarisBadgeProps['tone'];
  progress?: PolarisBadgeProps['progress'];
  icon?: IconSource;
}

export const Badge = ({
  children,
  variant = 'default',
  size = 'medium',
  tone,
  progress,
  icon,
}: BadgeProps) => {
  const variantToneMap: Record<string, PolarisBadgeProps['tone']> = {
    default: undefined,
    primary: 'info',
    success: 'success',
    warning: 'warning',
    critical: 'critical',
    info: 'info',
    attention: 'attention',
    new: 'new',
    magic: 'magic',
  };

  const effectiveTone = tone || variantToneMap[variant];

  // @ts-ignore Polaris v12 type compatibility — works at runtime
  if (icon) {
    return (
      // @ts-ignore Polaris v12 type compatibility
      <PolarisBadge
        {...(effectiveTone ? { tone: effectiveTone } : {})}
        icon={icon}
        size={size}
      >
        {children}
      </PolarisBadge>
    );
  }

  return (
    // @ts-ignore Polaris v12 type compatibility
    <PolarisBadge
      {...(effectiveTone ? { tone: effectiveTone } : {})}
      progress={progress}
      size={size}
    >
      {children}
    </PolarisBadge>
  );
};

Badge.displayName = 'Badge';