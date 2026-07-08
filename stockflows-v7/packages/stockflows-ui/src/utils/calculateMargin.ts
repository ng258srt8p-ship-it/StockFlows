/**
 * Calculate profit margin from cost and price.
 * Returns margin as a decimal (0-1) and percentage string.
 */

export interface MarginResult {
  margin: number; // 0-1 decimal
  percentage: string;
  profit: number;
  isValid: boolean;
}

export interface CalculateMarginOptions {
  currency?: string;
  locale?: string;
}

/**
 * Calculate profit margin from cost price and selling price.
 * 
 * @param costPrice - The cost/wholesale price
 * @param sellingPrice - The selling/retail price
 * @param options - Optional formatting configuration
 * @returns MarginResult with margin decimal, formatted percentage, and validity flag
 */
export function calculateMargin(
  costPrice: number,
  sellingPrice: number,
  options?: CalculateMarginOptions
): MarginResult {
  const locale = options?.locale || "en-US";

  // Validation checks
  if (typeof costPrice !== "number" || typeof sellingPrice !== "number") {
    return { margin: 0, percentage: "", profit: 0, isValid: false };
  }

  if (isNaN(costPrice) || isNaN(sellingPrice)) {
    return { margin: 0, percentage: "", profit: 0, isValid: false };
  }

  if (costPrice < 0 || sellingPrice < 0) {
    return { margin: 0, percentage: "", profit: 0, isValid: false };
  }

  if (costPrice === 0) {
    return { margin: 1, percentage: "100%", profit: sellingPrice, isValid: true };
  }

  const profit = sellingPrice - costPrice;
  const margin = profit / costPrice;
  const isValid = sellingPrice > 0 && costPrice > 0;

  const percentage = (margin * 100).toFixed(1) + "%";

  return { margin, percentage, profit, isValid };
}

export default calculateMargin;