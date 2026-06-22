import type { ForecastOutput } from "../engine";

/**
 * Holt's Linear Exponential Smoothing (Double Exponential Smoothing)
 *
 * Captures level and trend in a time series with two smoothing parameters:
 *   - alpha (level smoothing, 0..1)
 *   - beta  (trend smoothing, 0..1)
 *
 * Alpha and beta are auto-selected via grid search minimising the in-sample
 * one-step-ahead MAE.
 */

interface DailySales {
  date: string;
  qty: number;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function etsForecast(
  data: DailySales[],
  horizon: number
): ForecastOutput {
  if (data.length < 2) {
    return emptyOutput(horizon, data);
  }

  const y = data.map((d) => d.qty);

  // Auto-select alpha & beta via grid search
  const { alpha, beta } = optimiseParams(y);

  // Fit the model over the full history and keep final level / trend
  const { level, trend } = fitHolt(y, alpha, beta);

  // Estimate residual standard deviation for prediction intervals
  const fitted = holtFittedValues(y, alpha, beta);
  const residuals = y.map((v, i) => v - fitted[i]);
  const sse = residuals.reduce((s, r) => s + r * r, 0);
  const sigma = Math.sqrt(sse / Math.max(residuals.length - 2, 1));

  // Generate forecasts
  const predictions: ForecastOutput["predictions"] = [];
  const lastDate = data[data.length - 1].date;

  for (let h = 1; h <= horizon; h++) {
    const predDate = addDays(lastDate, h);
    const yhat = Math.max(0, Math.round(level + trend * h));

    // Growing confidence interval (h-steps-ahead variance ~ sigma * sqrt(h))
    const margin = Math.ceil(1.96 * sigma * Math.sqrt(h));

    predictions.push({
      date: predDate,
      yhat,
      lower: Math.max(0, yhat - margin),
      upper: yhat + margin,
    });
  }

  const cv = sigma / (ssMean(y) || 1);
  const confidence = clamp(1 - cv, 0.1, 0.95);

  return {
    predictions,
    confidence,
    model: "ets",
  };
}

// ---------------------------------------------------------------------------
// Holt's linear method
// ---------------------------------------------------------------------------

function fitHolt(
  y: number[],
  alpha: number,
  beta: number
): { level: number; trend: number } {
  let level = y[0];
  let trend = y.length > 1 ? y[1] - y[0] : 0;

  for (let t = 1; t < y.length; t++) {
    const prevLevel = level;
    level = alpha * y[t] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }

  return { level, trend };
}

/** Return one-step-ahead fitted values (the level *before* the update for t). */
function holtFittedValues(y: number[], alpha: number, beta: number): number[] {
  const fitted: number[] = [y[0]];
  let level = y[0];
  let trend = y.length > 1 ? y[1] - y[0] : 0;

  for (let t = 1; t < y.length; t++) {
    const prevLevel = level;
    fitted.push(level + trend); // forecast for t made at t-1
    level = alpha * y[t] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }

  return fitted;
}

// ---------------------------------------------------------------------------
// Grid search for alpha / beta
// ---------------------------------------------------------------------------

function optimiseParams(y: number[]): { alpha: number; beta: number } {
  let bestMae = Infinity;
  let bestAlpha = 0.3;
  let bestBeta = 0.1;

  // Coarse-then-fine search: step 0.1 then 0.02 around the best
  for (let step of [0.1, 0.02]) {
    const startA = step === 0.1 ? 0 : Math.max(0, bestAlpha - 0.1);
    const endA = step === 0.1 ? 1.0 : Math.min(1, bestAlpha + 0.1);
    const startB = step === 0.1 ? 0 : Math.max(0, bestBeta - 0.1);
    const endB = step === 0.1 ? 1.0 : Math.min(1, bestBeta + 0.1);

    for (let a = startA; a <= endA; a += step) {
      for (let b = startB; b <= endB; b += step) {
        const mae = inSampleMae(y, a, b);
        if (mae < bestMae) {
          bestMae = mae;
          bestAlpha = a;
          bestBeta = b;
        }
      }
    }
  }

  return { alpha: bestAlpha, beta: bestBeta };
}

function inSampleMae(y: number[], alpha: number, beta: number): number {
  let level = y[0];
  let trend = y.length > 1 ? y[1] - y[0] : 0;
  let absErr = 0;

  for (let t = 1; t < y.length; t++) {
    const forecast = level + trend;
    absErr += Math.abs(y[t] - forecast);
    const prevLevel = level;
    level = alpha * y[t] + (1 - alpha) * forecast;
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }

  return absErr / (y.length - 1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ssMean(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / (arr.length || 1);
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function emptyOutput(horizon: number, data: DailySales[]): ForecastOutput {
  const lastDate = data.length > 0 ? data[data.length - 1].date : new Date().toISOString().split("T")[0];
  const predictions: ForecastOutput["predictions"] = [];
  for (let h = 1; h <= horizon; h++) {
    predictions.push({ date: addDays(lastDate, h), yhat: 0, lower: 0, upper: 0 });
  }
  return { predictions, confidence: 0, model: "ets" };
}
