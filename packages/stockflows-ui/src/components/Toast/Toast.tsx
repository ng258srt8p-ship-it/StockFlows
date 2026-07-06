import React from 'react';
import { Toast as PolarisToast, type IconSource } from '@shopify/polaris';
import './Toast.css';

export interface ToastAction {
  content: string;
  onAction?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface ToastProps {
  content: string;
  duration?: number;
  error?: boolean;
  tone?: 'magic';
  icon?: IconSource;
  action?: ToastAction;
  onDismiss: () => void;
  onClick?: () => void;
}

export const Toast = ({
  content,
  duration,
  error,
  tone,
  icon,
  action,
  onDismiss,
  onClick,
}: ToastProps) => {
  return (
    <div className="sf-toast">
      <PolarisToast
        content={content}
        duration={duration}
        error={error}
        tone={tone}
        icon={icon}
        action={action}
        onDismiss={onDismiss}
        onClick={onClick}
      />
    </div>
  );
};

export default Toast;