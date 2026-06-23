import type { ForecastOutput, DailySales } from "./engine";

/**
 * Model evaluation, selection and ensemble blending.
 *
 * Provides time-series cross-validation with configurable train/test splits,
 * standard error metrics (MAPE, MAE, RMSE, bias), and model selection.
 */

type ModelFn = (data: DailySales[], horizon: number) => ForecastOutput;

export interface EvalMetrics {
  mape: number; // Mean Absolute Percentage Error (0-100)
  mae: number;  // Mean Absolute Error
  rmse: number; // Root Mean Squared Error
  bias: number; // Mean forecast error (positive = over-forecast)
}

export interface ModelScore {
  name: string;
  metrics: EvalMetrics;
  rating: "good" | "acceptable" | "poor";
}

// ---------------------------------------------------------------------------
// evaluateModel
// ---------------------------------------------------------------------------

/**
 * Evaluate a single model using time-series cross-validation.
 *
 * Splits the data at 60%, 70% and 80% train proportions, forecasts the
 * remaining steps, and averages the error metrics across folds.
 */
export function evaluateModel(
  data: DailySales[],
  modelFn: ModelFn
): EvalMetrics {
  if (data.length < 10) {
    return { mape: 100, mae: 0, rmse: 0, bias: 0 };
  }

  const splits = [0.6, 0.7, 0.8];
  const foldMetrics: EvalMetrics[] = [];

  for (const trainRatio of splits) {
    const cut = Math.floor(data.length * trainRatio);
    if (cut < 3 || data.length - cut < 1) continue;

    const train = data.slice(0, cut);
    const test = data.slice(cut);
    const horizon = test.length;

    const forecast = modelFn(train, horizon);
    const metrics = computeMetrics(test, forecast.predictions);
    foldMetrics.push(metrics);
  }

  if (foldMetrics.length === 0) {
    return { mape: 100, mae: 0, rmse: 0, bias: 0 };
  }

  return averageMetrics(foldMetrics);
}

// ---------------------------------------------------------------------------
// selectBestModel
// ---------------------------------------------------------------------------

/**
 * Evaluate multiple models and return the best one.
 *
 * Models are ranked primarily by MAPE (lower is better), then MAE as a tiebreaker.
 */
export function selectBestModel(
  data: DailySales[],
  models: Array<{ name: string; fn: ModelFn }>
): { bestModel: string; scores: ModelScore[] } {
  const scores: ModelScore[] = models.map(({ name, fn }) => {
    const metrics = evaluateModel(data, fn);
    return {
      name,
      metrics,
      rating: rateModel(metrics.mape),
    };
  });

  scores.sort((a, b) => a.metrics.mape - b.metrics.mape);

  return {
    bestModel: scores[0]?.name ?? "none",
    scores,
  };
}

// ---------------------------------------------------------------------------
// blendEnsemble
// ---------------------------------------------------------------------------

/**
 * Combine predictions from multiple models via weighted average.
 *
 * `weights` should have the same length as `predictions` and sum to 1.
 */
export function blendEnsemble(
  predictions: ForecastOutput[],
  weights: number[]
): ForecastOutput {
  if (predictions.length === 0) {
    return { predictions: [], confidence: 0, model: "ensemble" };
  }

  const weightSum = weights.reduce((s, w) => s + w, 0);
  const normWeights = weights.map((w) => w / (weightSum || 1));

  // Use the first prediction's dates as the reference
  const ref = predictions[0].predictions;
  const blended = ref.map((_, i) => {
    let yhat = 0;
    let lower = 0;
    let upper = 0;

    for (let m = 0; m < predictions.length; m++) {
      const p = predictions[m].predictions[i];
      if (!p) continue;
      const w = normWeights[m] ?? 0;
      yhat += p.yhat * w;
      lower += p.lower * w;
      upper += p.upper * w;
    }

    return {
      date: ref[i].date,
      yhat: Math.max(0, Math.round(yhat)),
      lower: Math.max(0, Math.round(lower)),
      upper: Math.round(upper),
    };
  });

  // Confidence is the weighted average of individual confidences
  const confidence =
    predictions.reduce((s, p, i) => s + p.confidence * (normWeights[i] ?? 0), 0);

  return {
    predictions: blended,
    confidence,
    model: "ensemble",
  };
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function computeMetrics(
  actual: DailySales[],
  predicted: ForecastOutput["predictions"]
): EvalMetrics {
  const n = Math.min(actual.length, predicted.length);
  if (n === 0) return { mape: 100, mae: 0, rmse: 0, bias: 0 };

  let sumAbsPctErr = 0;
  let sumAbsErr = 0;
  let sumSqErr = 0;
  let sumErr = 0;
  let countPct = 0;

  for (let i = 0; i < n; i++) {
    const a = actual[i].qty;
    const f = predicted[i].yhat;
    const err = f - a;

    sumAbsErr += Math.abs(err);
    sumSqErr += err * err;
    sumErr += err;

    // Only include MAPE for non-zero actuals
    if (a !== 0) {
      sumAbsPctErr += Math.abs(err / a);
      countPct++;
    }
  }

  const mape = countPct > 0 ? (sumAbsPctErr / countPct) * 100 : 100;
  const mae = sumAbsErr / n;
  const rmse = Math.sqrt(sumSqErr / n);
  const bias = sumErr / n;

  return { mape, mae, rmse, bias };
}

function averageMetrics(metrics: EvalMetrics[]): EvalMetrics {
  const n = metrics.length;
  return {
    mape: metrics.reduce((s, m) => s + m.mape, 0) / n,
    mae: metrics.reduce((s, m) => s + m.mae, 0) / n,
    rmse: metrics.reduce((s, m) => s + m.rmse, 0) / n,
    bias: metrics.reduce((s, m) => s + m.bias, 0) / n,
  };
}

function rateModel(mape: number): "good" | "acceptable" | "poor" {
  if (mape < 20) return "good";
  if (mape < 30) return "acceptable";
  return "poor";
}
