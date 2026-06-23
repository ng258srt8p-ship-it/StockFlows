/**
 * Ambient module declarations for packages without type definitions
 * or with incorrect types.
 */
declare module "googleapis" {
  export const google: any;
}

declare module "twilio" {
  function twilio(sid: string, token: string): any;
  export default twilio;
  export = twilio;
}

declare module "csv-stringify/sync" {
  function stringify(data: any[], options?: any): string;
  export default stringify;
}

declare module "csv-parse/sync" {
  function parse(input: string, options?: any): any[];
  export default parse;
}

/**
 * Type augmentations for Polaris v12 components.
 *
 * Some Polaris components accept props at runtime that aren't reflected
 * in the TypeScript definitions (e.g., Card.title). These augmentations
 * make the types match actual runtime behavior so we can remove @ts-nocheck.
 */

import "@shopify/polaris";

declare module "@shopify/polaris" {
  // Card accepts a title prop at runtime (rendered as internal header)
  interface CardProps {
    title?: string;
  }

  // Text accepts a className prop for Tailwind integration
  interface TextProps {
    className?: string;
  }

  // Badge — tone is the correct prop name (v12)
  // IndexTable — onRowClick signature
  interface IndexTableProps {
    onRowClick?: (id: string, row: any) => void;
    selectable?: boolean;
  }

  // Page — breadcrumbs array can have objects or strings
  interface PageProps {
    breadcrumbs?: Array<{ content: string; url?: string } | string>;
  }

  // Button — submit and primary are valid shorthand props
  interface ButtonProps {
    submit?: boolean;
    primary?: boolean;
    loading?: boolean;
    disabled?: boolean;
    url?: string;
    pressed?: boolean;
  }
  // Select — label is required by types but optional at runtime for inline use
  interface SelectProps {
    label?: string;
    name?: string;
    error?: string | boolean;
    required?: boolean;
  }

  // Banner — tone is correct
}
