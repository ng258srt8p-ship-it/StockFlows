import React from 'react';
import { Popover as PolarisPopover, PopoverCloseSource } from '@shopify/polaris';
import './Popover.css';

export type PopoverPreferredPosition = 'above' | 'below' | 'mostSpace';
export type PopoverPreferredAlignment = 'left' | 'center' | 'right';
export type PopoverAutofocusTarget = 'none' | 'first-node' | 'container';

export interface PopoverProps {
  active: boolean;
  activator: React.ReactElement;
  children?: React.ReactNode;
  preferredPosition?: PopoverPreferredPosition;
  preferredAlignment?: PopoverPreferredAlignment;
  preferInputActivator?: boolean;
  activatorWrapper?: string;
  zIndexOverride?: number;
  preventFocusOnClose?: boolean;
  sectioned?: boolean;
  fullWidth?: boolean;
  fullHeight?: boolean;
  fluidContent?: boolean;
  fixed?: boolean;
  ariaHaspopup?: React.AriaAttributes['aria-haspopup'];
  hideOnPrint?: boolean;
  onClose: (source: PopoverCloseSource) => void;
  autofocusTarget?: PopoverAutofocusTarget;
  preventCloseOnChildOverlayClick?: boolean;
  captureOverscroll?: boolean;
}

export const Popover = ({
  active,
  activator,
  children,
  preferredPosition,
  preferredAlignment,
  preferInputActivator,
  activatorWrapper,
  zIndexOverride,
  preventFocusOnClose,
  sectioned,
  fullWidth,
  fullHeight,
  fluidContent,
  fixed,
  ariaHaspopup,
  hideOnPrint,
  onClose,
  autofocusTarget,
  preventCloseOnChildOverlayClick,
  captureOverscroll,
  ...props
}: PopoverProps) => {
  return (
    <PolarisPopover
      active={active}
      activator={activator}
      preferredPosition={preferredPosition}
      preferredAlignment={preferredAlignment}
      preferInputActivator={preferInputActivator}
      activatorWrapper={activatorWrapper}
      zIndexOverride={zIndexOverride}
      preventFocusOnClose={preventFocusOnClose}
      sectioned={sectioned}
      fullWidth={fullWidth}
      fullHeight={fullHeight}
      fluidContent={fluidContent}
      fixed={fixed}
      ariaHaspopup={ariaHaspopup}
      hideOnPrint={hideOnPrint}
      onClose={onClose}
      autofocusTarget={autofocusTarget}
      preventCloseOnChildOverlayClick={preventCloseOnChildOverlayClick}
      captureOverscroll={captureOverscroll}
      {...props}
    >
      {children}
    </PolarisPopover>
  );
};

export default Popover;