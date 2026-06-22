import * as ss from "simple-statistics";
import type { ForecastOutput } from "../engine";

/**
 * Linear and polynomial regression forecasting.
 *
 * Fits a line (degree 1) to the historical data via simple-statistics and
 * extrapolates forward.  R-squared is used to compute confidence.
 *
 * Handles edge cases: constant data, single point, insufficient data.
 */

interface DailySales {
  date: string;
  qty: number;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function linearRegressionForecast(
  data: DailySales[],
  horizon: number
): ForecastOutput {
  if (data.length < 2) {
    return shortDataFallback(data, horizon);
  }

  const y = data.map((d) => d.qty);

  // Check for constant data
  if (isConstant(y)) {
    return constantFallback(y, data, horizon);
  }

  // Build x-y pairs (x = day index)
  const pairs: [number, number][] = y.map((v, i) => [i, v]);

  const regression = ss.linearRegression(pairs);
  const slope = regression.m;
  const intercept = regression.b;

  // R-squared
  const yhatFitted = pairs.map(([x]) => intercept + slope * x);
  const yMean = ss.mean(y);
  const ssTot = y.reduce((s, v) => s + (v - yMean) ** 2, 0);
  const ssRes = y.reduce((s, v, i) => s + (v - yhatFitted[i]) ** 2, 0);
  const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  // Residual standard error for prediction intervals
  const n = y.length;
  const se = Math.sqrt(ssRes / Math.max(n - 2, 1));

  const lastDate = data[data.length - 1].date;
  const predictions: ForecastOutput["predictions"] = [];

  for (let h = 1; h <= horizon; h++) {
    const x = n - 1 + h; // continue the index from last observed point
    const yhat = Math.max(0, Math.round(intercept + slope * x));

    // Wider intervals further out (approximate t-distribution with z=1.96)
    const margin = Math.ceil(1.96 * se * Math.sqrt(1 + 1 / n + (x - (n - 1) / 2) ** 2 / ssTot));

    predictions.push({
      date: addDays(lastDate, h),
      yhat,
      lower: Math.max(0, yhat - margin),
      upper: yhat + margin,
    });
  }

  // Confidence derived from R-squared, clamped
  const confidence = clamp(rSquared, 0.1, 0.95);

  return {
    predictions,
    confidence,
    model: "regression",
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isConstant(arr: number[]): boolean {
  return arr.every((v) => v === arr[0]);
}

function shortDataFallback(data: DailySales[], horizon: number): ForecastOutput {
  const lastDate = data.length > 0 ? data[data.length - 1].date : new Date().toISOString().split("T")[0];
  const value = data.length === 1 ? data[0].qty : 0;

  const predictions: ForecastOutput["predictions"] = [];
  for (let h = 1; h <= horizon; h++) {
    predictions.push({ date: addDays(lastDate, h), yhat: value, lower: 0, upper: value });
  }
  return { predictions, confidence: 0.1, model: "regression" };
}

function constantFallback(y: number[], data: DailySales[], horizon: number): ForecastOutput {
  const constVal = y[0];
  const lastDate = data[data.length - 1].date;

  const predictions: ForecastOutput["predictions"] = [];
  for (let h = 1; h <= horizon; h++) {
    predictions.push({
      date: addDays(lastDate, h),
      yhat: constVal,
      lower: constVal,
      upper: constVal,
    });
  }
  return { predictions, confidence: 0.5, model: "regression" };
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
