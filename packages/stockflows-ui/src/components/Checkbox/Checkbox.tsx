import React from 'react';
import { Checkbox as PolarisCheckbox } from '@shopify/polaris';
import './Checkbox.css';

export interface CheckboxProps {
  label: React.ReactNode;
  checked?: boolean | 'indeterminate';
  onChange?: (checked: boolean, id: string) => void;
  disabled?: boolean;
  error?: boolean;
  helpText?: React.ReactNode;
  name?: string;
  id?: string;
}

export const Checkbox = ({
  label,
  checked,
  onChange,
  disabled,
  error,
  helpText,
  name,
  id,
  ...props
}: CheckboxProps) => {
  return (
    <div className="sf-checkbox">
      <PolarisCheckbox
        label={label}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        error={error}
        helpText={helpText}
        name={name}
        id={id}
        {...props}
      />
    </div>
  );
};

export default Checkbox;