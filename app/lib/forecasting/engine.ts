import * as ss from "simple-statistics";

interface DailySales {
  date: string;
  qty: number;
}

interface ForecastResult {
  predictions: Array<{ date: string; yhat: number; lower: number; upper: number }>;
  totalPredicted: number;
  confidence: number;
  modelUsed: string;
  avgDailySales: number;
  trendDirection: "up" | "down" | "stable";
}

export function runForecast(
  dailySales: DailySales[],
  horizonDays: number = 30
): ForecastResult {
  if (dailySales.length < 7) {
    return emptyForecast(horizonDays);
  }

  const quantities = dailySales.map((d) => d.qty);
  const avg = ss.mean(quantities);
  const sd = ss.standardDeviation(quantities);

  // Detect trend via linear regression
  const data = quantities.map((qty, i) => [i, qty]);
  const regression = ss.linearRegression(data);
  const slope = regression.m; // simple-statistics uses 'm' for slope

  let trendDirection: "up" | "down" | "stable" = "stable";
  if (slope > avg * 0.01) trendDirection = "up";
  else if (slope < -avg * 0.01) trendDirection = "down";

  // Exponential smoothing
  const alpha = 0.3;
  let smoothed = quantities[0];
  for (let i = 1; i < quantities.length; i++) {
    smoothed = alpha * quantities[i] + (1 - alpha) * smoothed;
  }

  // Generate predictions
  const predictions: ForecastResult["predictions"] = [];
  const lastDate = new Date(dailySales[dailySales.length - 1].date);

  for (let i = 1; i <= horizonDays; i++) {
    const predDate = new Date(lastDate);
    predDate.setDate(predDate.getDate() + i);

    const predicted = Math.max(0, Math.round(smoothed + slope * i));
    const margin = Math.ceil(1.96 * sd * Math.sqrt(i / quantities.length));

    predictions.push({
      date: predDate.toISOString().split("T")[0],
      yhat: predicted,
      lower: Math.max(0, predicted - margin),
      upper: predicted + margin,
    });
  }

  const totalPredicted = predictions.reduce((sum, p) => sum + p.yhat, 0);

  // Confidence: 1 - (coefficient of variation), clamped
  const cv = sd / (avg || 1);
  const confidence = Math.max(0.1, Math.min(0.95, 1 - cv));

  return {
    predictions,
    totalPredicted,
    confidence,
    modelUsed: "ets",
    avgDailySales: avg,
    trendDirection,
  };
}

function emptyForecast(horizonDays: number): ForecastResult {
  return {
    predictions: [],
    totalPredicted: 0,
    confidence: 0,
    modelUsed: "none",
    avgDailySales: 0,
    trendDirection: "stable",
  };
}

export function calculateSafetyStock(
  dailySales: number[],
  leadTimeDays: number,
  reviewPeriodDays: number = 7,
  serviceLevel: number = 0.95
): number {
  const zScore = serviceLevel === 0.95 ? 1.65 : serviceLevel === 0.99 ? 2.33 : 1.28;
  const demandStdDev = ss.standardDeviation(dailySales);
  return Math.ceil(zScore * demandStdDev * Math.sqrt(leadTimeDays + reviewPeriodDays));
}
