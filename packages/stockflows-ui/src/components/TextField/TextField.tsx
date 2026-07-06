import React from 'react';
import { TextField as PolarisTextField } from '@shopify/polaris';
import './TextField.css';

export interface TextFieldProps {
  label: React.ReactNode;
  value?: string;
  onChange?: (value: string, id: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string | boolean;
  helpText?: React.ReactNode;
  type?: 'text' | 'email' | 'password' | 'number' | 'integer' | 'search' | 'tel' | 'url' | 'date' | 'datetime-local' | 'month' | 'time' | 'week' | 'currency';
  requiredIndicator?: boolean;
  autoComplete: string;
  multiline?: boolean | number;
  autoFocus?: boolean;
  name?: string;
  id?: string;
  size?: 'slim' | 'medium';
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  readOnly?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  step?: number;
  max?: number | string;
  min?: number | string;
  showCharacterCount?: boolean;
  align?: 'left' | 'center' | 'right';
  monospaced?: boolean;
  variant?: 'inherit' | 'borderless';
  loading?: boolean;
  tone?: 'magic';
  autoSize?: boolean;
}

export const TextField = ({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  error,
  helpText,
  type = 'text',
  requiredIndicator,
  autoComplete,
  multiline,
  autoFocus,
  name,
  id,
  size = 'medium',
  prefix,
  suffix,
  readOnly,
  maxLength,
  minLength,
  pattern,
  step,
  max,
  min,
  showCharacterCount,
  align,
  monospaced,
  variant,
  loading,
  tone,
  autoSize,
}: TextFieldProps) => {
  return (
    <div className="sf-text-field">
      <PolarisTextField
        label={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        helpText={helpText}
        type={type}
        requiredIndicator={requiredIndicator}
        autoComplete={autoComplete}
        multiline={multiline}
        autoFocus={autoFocus}
        name={name}
        id={id || name}
        size={size}
        prefix={prefix}
        suffix={suffix}
        readOnly={readOnly}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        step={step}
        max={max}
        min={min}
        showCharacterCount={showCharacterCount}
        align={align}
        monospaced={monospaced}
        variant={variant}
        loading={loading}
        tone={tone}
        autoSize={autoSize}
      />
    </div>
  );
};

export default TextField;