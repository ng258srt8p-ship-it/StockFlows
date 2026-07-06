import React from 'react';
import './Card.css';

export interface BoxProps {
  children: React.ReactNode;
  padding?: 'none' | '100' | '200' | '300' | '400' | '500' | '600';
  background?: 'surface' | 'subdued' | 'transparent';
  className?: string;
  as?: React.ElementType;
  [key: string]: any;
}

export const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ children, padding = '400', background = 'surface', className = '', as: Component = 'div', ...props }, ref) => {
    const paddingClass = padding !== 'none' ? `sf-box--p-${padding}` : '';
    const backgroundClass = `sf-box--bg-${background}`;
    
    return (
      <Component
        ref={ref}
        className={`sf-box ${paddingClass} ${backgroundClass} ${className}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Box.displayName = 'Box';

export interface ShadowBevelProps {
  children: React.ReactNode;
  className?: string;
  zIndex?: number;
  borderRadius?: '100' | '200' | '300';
  style?: React.CSSProperties;
}

export const ShadowBevel = React.forwardRef<HTMLDivElement, ShadowBevelProps>(
  ({ children, className = '', zIndex = 32, borderRadius = '300', style, ...props }, ref) => {
    const cssVars: React.CSSProperties = {
      '--pc-shadow-bevel-z-index': zIndex,
      '--pc-shadow-bevel-border-radius-xs': `var(--p-border-radius-${borderRadius})`,
      '--pc-shadow-bevel-box-shadow-xs': 'var(--p-shadow-100)',
      ...style,
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        className={`sf-shadow-bevel sf-shadow-bevel--radius-${borderRadius} ${className}`}
        style={cssVars}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ShadowBevel.displayName = 'ShadowBevel';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | '100' | '200' | '300' | '400' | '500' | '600';
  withShadowBevel?: boolean;
  zIndex?: number;
  borderRadius?: '100' | '200' | '300';
  style?: React.CSSProperties;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', padding = '400', withShadowBevel = true, zIndex = 32, borderRadius = '300', style, ...props }, ref) => {
    const content = (
      <Box padding={padding} background="surface" className="sf-card__inner">
        {children}
      </Box>
    );

    if (withShadowBevel) {
      return (
        <ShadowBevel
          ref={ref}
          zIndex={zIndex}
          borderRadius={borderRadius}
          className={`sf-card ${className}`}
          style={style}
          {...props}
        >
          {content}
        </ShadowBevel>
      );
    }

    return (
      <Box
        ref={ref}
        padding="none"
        background="transparent"
        className={`sf-card sf-card--no-bevel ${className}`}
        style={style}
        {...props}
      >
        {content}
      </Box>
    );
  }
);

Card.displayName = 'Card';