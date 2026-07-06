import React from 'react';
import { Layout as PolarisLayout } from '@shopify/polaris';
import './Layout.css';

export interface LayoutProps {
  sectioned?: boolean;
  children?: React.ReactNode;
}

export interface LayoutSectionProps {
  children: React.ReactNode;
  secondary?: React.ReactNode;
  variant?: 'oneHalf' | 'oneThird' | 'fullWidth';
}

export interface LayoutAnnotatedSectionProps {
  children: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  id?: string;
}

const LayoutSectionComponent = ({
  children,
  secondary,
  variant,
}: LayoutSectionProps) => {
  return (
    <PolarisLayout.Section variant={variant}>
      <div className="sf-layout-section__primary">{children}</div>
      {secondary && <div className="sf-layout-section__secondary">{secondary}</div>}
    </PolarisLayout.Section>
  );
};

const LayoutAnnotatedSectionComponent = ({
  children,
  title,
  description,
  id,
}: LayoutAnnotatedSectionProps) => {
  return (
    <PolarisLayout.AnnotatedSection
      title={title}
      description={description}
      id={id}
    >
      <div className="sf-layout-annotated__content">{children}</div>
    </PolarisLayout.AnnotatedSection>
  );
};

export const Layout = ({
  sectioned = false,
  children,
}: LayoutProps) => {
  return (
    <PolarisLayout sectioned={sectioned}>
      <div className="sf-layout">{children}</div>
    </PolarisLayout>
  );
};

export const LayoutSection = LayoutSectionComponent;
export const LayoutAnnotatedSection = LayoutAnnotatedSectionComponent;

export default Layout;