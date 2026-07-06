import React from 'react';
import { Modal as PolarisModal } from '@shopify/polaris';
import './Modal.css';

export type ModalSize = 'small' | 'large' | 'fullScreen';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  titleHidden?: boolean;
  sectioned?: boolean;
  limitHeight?: boolean;
  loading?: boolean;
}

export const Modal = ({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'large',
  titleHidden,
  sectioned,
  limitHeight,
  loading,
  ...props
}: ModalProps) => {
  return (
    <PolarisModal
      open={open}
      onClose={onClose}
      title={title}
      footer={footer}
      size={size}
      titleHidden={titleHidden}
      sectioned={sectioned}
      limitHeight={limitHeight}
      loading={loading}
      {...props}
    >
      <div className="sf-modal">{children}</div>
    </PolarisModal>
  );
};

export default Modal;