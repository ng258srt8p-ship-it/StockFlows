import * as ss from "simple-statistics";

export interface ForecastOutput {
  predictions: Array<{ date: string; yhat: number; lower: number; upper: number }>;
  confidence: number;
  model: string;
}

/**
 * Simple Moving Average (SMA)
 */
export function simpleMovingAverage(
  data: number[],
  window: number,
  horizon: number,
  startDate: string
): ForecastOutput {
  const predictions = [];
  const lastDate = new Date(startDate);

  const avg = ss.mean(data.slice(-window));

  for (let i = 1; i <= horizon; i++) {
    const predDate = new Date(lastDate);
    predDate.setDate(predDate.getDate() + i);
    predictions.push({
      date: predDate.toISOString().split("T")[0],
      yhat: avg,
      lower: avg * 0.8,
      upper: avg * 1.2,
    });
  }

  return {
    predictions,
    confidence: 0.5,
    model: "SMA",
  }
}

/**
 * Weighted Moving Average (WMA)
 */
export function weightedMovingAverage(
  data: number[],
  window: number,
  horizon: number,
  startDate: string
): ForecastOutput {
  const predictions = [];
  const lastDate = new Date(startDate);

  const weights = Array.from({ length: window }, (_, i) => i + 1);
  const sumWeights = weights.reduce((a, b) => a + b, 0);

  const windowData = data.slice(-window);
  const weightedAvg = windowData.reduce((sum, val, i) => sum + (val * weights[i]), 0) / sumWeights;

  for (let i = 1; i <= horizon; i++) {
    const predDate = new Date(lastDate);
    predDate.setDate(predDate.getDate() + i);
    predictions.push({
      date: predDate.toISOString().split("T")[0],
      yhat: weightedAvg,
      lower: weightedAvg * 0.8,
      upper: weightedAvg * 1.2,
    });
  }

  return {
    predictions,
    confidence: 0.6,
    model: "WMA",
  }
}

/**
 * Holt's Linear Trend (Double Exponential Smoothing)
 */
export function holtsLinearTrend(
  data: number[],
  alpha: number = 0.3,
  beta: number = 0.1,
  horizon: number = 30,
  startDate: string
): ForecastOutput {
  const predictions = [];
  const lastDate = new Date(startDate);

  let level = data[0];
  let trend = data[1] - data[0];

  for (let i = 1; i < data.length; i++) {
    const lastLevel = level;
    level = alpha * data[i] + (1 - alpha) * (level + trend);
    trend = beta * (level - lastLevel) + (1 - beta) * trend;
  }

  for (let i = 1; i <= horizon; i++) {
    const predDate = new Date(lastDate);
    predDate.setDate(predDate.getDate() + i);
    const yhat = level + i * trend;

    predictions.push({
      date: predDate.toISOString().split("T")[0],
      yhat,
      lower: Math.max(0, yhat * 0.8),
      upper: yhat * 1.2,
    });
  }

  return {
    predictions,
    confidence: 0.7,
    model: "Holts",
  }
}

/**
 * Linear Regression
 */
export function linearRegression(
  data: number[],
  horizon: number,
  startDate: string
): ForecastOutput {
  const predictions = [];
  const lastDate = new Date(startDate);

  const points = data.map((val, i) => [i, val]);
  const regression = ss.linearRegression(points);
  const slope = regression.m;
  const intercept = regression.b;

  for (let i = 1; i <= horizon; i++) {
    const predDate = new Date(lastDate);
    predDate.setDate(predDate.getDate() + i);
    const yhat = Math.max(0, slope * (data.length + i) + intercept);

    predictions.push({
      date: predDate.toISOString().split("T")[0],
      yhat,
      lower: yhat * 0.8,
      upper: yhat * 1.2,
    });
  }

  return {
    predictions,
    confidence: 0.7,
    model: "Regression",
  }
}
