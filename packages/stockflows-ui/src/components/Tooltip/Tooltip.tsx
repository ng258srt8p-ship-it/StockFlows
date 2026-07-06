import React from 'react';
import { Tooltip as PolarisTooltip } from '@shopify/polaris';
import './Tooltip.css';

export type TooltipWidth = 'default' | 'wide';
export type TooltipPadding = 'default' | '400';
export type TooltipBorderRadius = '100' | '200';
export type TooltipPreferredPosition = 'above' | 'below' | 'mostSpace' | 'cover';

export interface TooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
  active?: boolean;
  hoverDelay?: number;
  dismissOnMouseOut?: boolean;
  preferredPosition?: TooltipPreferredPosition;
  activatorWrapper?: string;
  accessibilityLabel?: string;
  width?: TooltipWidth;
  padding?: TooltipPadding;
  borderRadius?: TooltipBorderRadius;
  zIndexOverride?: number;
  hasUnderline?: boolean;
  persistOnClick?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export const Tooltip = ({
  content,
  children,
  active,
  hoverDelay,
  dismissOnMouseOut,
  preferredPosition,
  activatorWrapper,
  accessibilityLabel,
  width = 'default',
  padding = 'default',
  borderRadius = '200',
  zIndexOverride,
  hasUnderline,
  persistOnClick,
  onOpen,
  onClose,
  ...props
}: TooltipProps) => {
  return (
    <PolarisTooltip
      content={content}
      active={active}
      hoverDelay={hoverDelay}
      dismissOnMouseOut={dismissOnMouseOut}
      preferredPosition={preferredPosition}
      activatorWrapper={activatorWrapper}
      accessibilityLabel={accessibilityLabel}
      width={width}
      padding={padding}
      borderRadius={borderRadius}
      zIndexOverride={zIndexOverride}
      hasUnderline={hasUnderline}
      persistOnClick={persistOnClick}
      onOpen={onOpen}
      onClose={onClose}
      {...props}
    >
      {children}
    </PolarisTooltip>
  );
};

export default Tooltip;