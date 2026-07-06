import React from 'react';
import { EmptyState as PolarisEmptyState } from '@shopify/polaris';
import type { ComplexAction } from '@shopify/polaris';
import './EmptyState.css';

export interface EmptyStateProps {
  heading: string;
  image: string;
  largeImage?: string;
  imageContained?: boolean;
  fullWidth?: boolean;
  action?: ComplexAction;
  secondaryAction?: ComplexAction;
  footerContent?: React.ReactNode;
  children?: React.ReactNode;
}

export const EmptyState = ({
  heading,
  image,
  largeImage,
  imageContained,
  fullWidth,
  action,
  secondaryAction,
  footerContent,
  children,
}: EmptyStateProps) => {
  return (
    <PolarisEmptyState
      heading={heading}
      image={image}
      largeImage={largeImage}
      imageContained={imageContained}
      fullWidth={fullWidth}
      action={action}
      secondaryAction={secondaryAction}
      footerContent={footerContent}
    >
      {children}
    </PolarisEmptyState>
  );
};

EmptyState.displayName = 'EmptyState';