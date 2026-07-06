import React from 'react';
import { Select as PolarisSelect } from '@shopify/polaris';
import './Select.css';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

export interface SelectProps {
  label: React.ReactNode;
  options?: (SelectOption | SelectGroup)[];
  value?: string;
  onChange?: (selected: string, id: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helpText?: React.ReactNode;
  requiredIndicator?: boolean;
}

export const Select = ({ 
  label, 
  options = [], 
  value, 
  onChange, 
  placeholder, 
  disabled, 
  error, 
  helpText,
  requiredIndicator,
  ...props 
}: SelectProps) => {
  return (
    <div className="sf-select">
      <PolarisSelect
        label={label}
        options={options as any}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        helpText={helpText}
        requiredIndicator={requiredIndicator}
        {...props}
      />
    </div>
  );
};

export default Select;