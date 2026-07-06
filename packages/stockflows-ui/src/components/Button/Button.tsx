import React from 'react';
import { Button as PolarisButton, type ButtonProps as PolarisButtonProps } from '@shopify/polaris';
import type { IconSource } from '@shopify/polaris';
import './Button.css';

export interface ButtonProps {
  children?: string | string[];
  variant?: 'primary' | 'secondary' | 'tertiary' | 'plain';
  size?: 'micro' | 'slim' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconSource;
  url?: string;
  external?: boolean;
  download?: boolean | string;
  submit?: boolean;
  pressed?: boolean;
  className?: string;
  onClick?: () => void;
  accessibilityLabel?: string;
  id?: string;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled,
  icon,
  url,
  external,
  download,
  submit,
  pressed,
  className = '',
  onClick,
  accessibilityLabel,
  id,
}: ButtonProps) => {
  const combinedClassName = `sf-button sf-button--${variant} sf-button--${size} ${fullWidth ? 'sf-button--full-width' : ''} ${className}`;

  return (
    <span className={combinedClassName}>
    {/* @ts-ignore Polaris v12 type compatibility — works at runtime */}
    <PolarisButton
      variant={variant}
      size={size}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      loading={loading}
      icon={icon}
      url={url}
      external={external}
      download={download}
      submit={submit}
      pressed={pressed}
      onClick={onClick}
      accessibilityLabel={accessibilityLabel}
      id={id}
    >
      {children}
    </PolarisButton>
    </span>
  );
};

Button.displayName = 'Button';