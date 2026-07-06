import React from 'react';
import { Spinner as PolarisSpinner } from '@shopify/polaris';
import './Spinner.css';

export type SpinnerSize = 'small' | 'large';

export interface SpinnerProps {
  size?: SpinnerSize;
  accessibilityLabel?: string;
  hasFocusableParent?: boolean;
}

export const Spinner = ({
  size = 'large',
  accessibilityLabel,
  hasFocusableParent,
}: SpinnerProps) => {
  return (
    <div className="sf-spinner">
      <PolarisSpinner
        size={size}
        accessibilityLabel={accessibilityLabel}
        hasFocusableParent={hasFocusableParent}
      />
    </div>
  );
};

export default Spinner;