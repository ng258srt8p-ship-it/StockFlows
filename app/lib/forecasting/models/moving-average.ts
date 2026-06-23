import type { ForecastOutput, DailySales } from "../engine";

/**
 * Weighted Moving Average forecasting.
 *
 * Implements both simple moving average (SMA) and weighted moving average
 * (WMA).  Automatically detects the optimal window size by minimising
 * in-sample MAE.
 *
 * Best suited for products with stable, non-trending demand.
 */

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function movingAverageForecast(
  data: DailySales[],
  horizon: number,
  windowSize?: number
): ForecastOutput {
  if (data.length === 0) {
    return emptyOutput(horizon);
  }

  const y = data.map((d) => d.qty);

  // Determine window size (auto-detect or user-supplied)
  const w = windowSize ?? optimalWindowSize(y);
  const effectiveWindow = Math.min(w, y.length);

  // Pick SMA vs WMA based on data volatility
  const cv = coefficientOfVariation(y);
  const useWma = cv < 0.3; // stable series benefit from WMA weights

  const weights = useWma ? generateLinearWeights(effectiveWindow) : uniformWeights(effectiveWindow);

  // Forecast is the weighted average of the last `effectiveWindow` points
  const lastSlice = y.slice(y.length - effectiveWindow);
  const forecastValue = weightedMean(lastSlice, weights);

  // Residual standard deviation for confidence intervals
  const inSample = weightedInSample(y, effectiveWindow, weights);
  const residuals = y.slice(effectiveWindow).map((v, i) => v - inSample[i]);
  const sigma =
    residuals.length > 1
      ? Math.sqrt(residuals.reduce((s, r) => s + r * r, 0) / (residuals.length - 1))
      : coefficientOfVariation(y) * forecastValue;

  const predictions: ForecastOutput["predictions"] = [];
  const lastDate = data[data.length - 1].date;

  for (let h = 1; h <= horizon; h++) {
    const predDate = addDays(lastDate, h);
    const yhat = Math.max(0, Math.round(forecastValue));
    const margin = Math.ceil(1.96 * sigma * Math.sqrt(h));

    predictions.push({
      date: predDate,
      yhat,
      lower: Math.max(0, yhat - margin),
      upper: yhat + margin,
    });
  }

  const cvForecast = sigma / (forecastValue || 1);
  const confidence = clamp(1 - cvForecast, 0.1, 0.95);

  return {
    predictions,
    confidence,
    model: "moving_average",
  };
}

// ---------------------------------------------------------------------------
// Optimal window detection
// ---------------------------------------------------------------------------

function optimalWindowSize(y: number[]): number {
  // Try windows 3..min(30, n) and pick the one with lowest MAE
  const maxW = Math.min(30, y.length);
  let bestW = 3;
  let bestMae = Infinity;

  for (let w = 3; w <= maxW; w++) {
    const weights = uniformWeights(w);
    const fitted = weightedInSample(y, w, weights);
    const actual = y.slice(w);

    const mae =
      actual.length > 0
        ? actual.reduce((s, v, i) => s + Math.abs(v - fitted[i]), 0) / actual.length
        : Infinity;

    if (mae < bestMae) {
      bestMae = mae;
      bestW = w;
    }
  }

  return bestW;
}

// ---------------------------------------------------------------------------
// Weight generators
// ---------------------------------------------------------------------------

function uniformWeights(w: number): number[] {
  return Array.from({ length: w }, () => 1 / w);
}

/** Linear weights: most recent observation gets the highest weight. */
function generateLinearWeights(w: number): number[] {
  const raw = Array.from({ length: w }, (_, i) => i + 1); // 1, 2, ..., w
  const sum = raw.reduce((s, v) => s + v, 0);
  return raw.map((v) => v / sum);
}

// ---------------------------------------------------------------------------
// Math helpers
// ---------------------------------------------------------------------------

function weightedMean(values: number[], weights: number[]): number {
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i] * weights[i];
  }
  return sum;
}

/** Compute one-step-ahead weighted forecasts for in-sample evaluation. */
function weightedInSample(y: number[], w: number, weights: number[]): number[] {
  const fitted: number[] = [];
  for (let t = w; t < y.length; t++) {
    const slice = y.slice(t - w, t);
    fitted.push(weightedMean(slice, weights));
  }
  return fitted;
}

function coefficientOfVariation(arr: number[]): number {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((s, v) => s + v, 0) / arr.length;
  if (mean === 0) return 0;
  const variance = arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length;
  return Math.sqrt(variance) / mean;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function emptyOutput(horizon: number): ForecastOutput {
  const today = new Date().toISOString().split("T")[0];
  const predictions: ForecastOutput["predictions"] = [];
  for (let h = 1; h <= horizon; h++) {
    predictions.push({ date: addDays(today, h), yhat: 0, lower: 0, upper: 0 });
  }
  return { predictions, confidence: 0, model: "moving_average" };
}
