/**
 * Format a number as currency based on locale.
 * Uses the Intl.NumberFormat API for proper locale-aware formatting.
 */

export interface FormatCurrencyOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  style?: "decimal" | "currency" | "percent";
}

const defaultOptions: Required<FormatCurrencyOptions> = {
  currency: "USD",
  locale: "en-US",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  style: "currency",
};

export function formatCurrency(
  amount: number,
  options?: FormatCurrencyOptions
): string {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "";
  }

  const mergedOptions = { ...defaultOptions, ...options };

  try {
    const formatter = new Intl.NumberFormat(mergedOptions.locale, {
      style: mergedOptions.style,
      currency: mergedOptions.currency,
      minimumFractionDigits: mergedOptions.minimumFractionDigits,
      maximumFractionDigits: mergedOptions.maximumFractionDigits,
    });

    return formatter.format(amount);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return amount.toLocaleString();
  }
}

export default formatCurrency;