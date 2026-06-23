import * as ss from "simple-statistics";

// ── Shared types ──────────────────────────────────────────────────────────────

export interface DailySales {
  date: string;
  qty: number;
}

/** Output returned by each individual forecasting model. */
export interface ForecastOutput {
  predictions: Array<{ date: string; yhat: number; lower: number; upper: number }>;
  confidence: number;
  model: string;
}

/** Full result returned by the top-level runForecast() orchestrator. */
export interface ForecastResult {
  predictions: ForecastOutput["predictions"];
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

// ── Seasonality analysis ────────────────────────────────────────────────────

export interface SeasonalityResult {
  /** Average sales per day-of-week (index 0 = Monday, 6 = Sunday) */
  dayOfWeek: number[];
  /** Average sales per month (index 0 = January, 11 = December) */
  monthOfYear: number[];
  /** Day-of-week factor relative to overall mean (1.0 = average, >1 = peak) */
  dayOfWeekFactors: number[];
  /** Month factor relative to overall mean */
  monthFactors: number[];
  /** Detected peak day-of-week name */
  peakDay: string;
  /** Detected peak month name */
  peakMonth: string;
}

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Analyse seasonality patterns in daily sales data.
 *
 * @param sales - Array of { date, qty } daily sales records
 * @returns Seasonality breakdown with day-of-week and monthly patterns
 */
export function analyseSeasonality(sales: DailySales[]): SeasonalityResult | null {
  if (sales.length < 14) return null; // Need at least 2 weeks of data

  const overallMean = ss.mean(sales.map((s) => s.qty));

  // Day-of-week aggregation
  const dowSums = new Array(7).fill(0);
  const dowCounts = new Array(7).fill(0);
  for (const s of sales) {
    const d = new Date(s.date);
    const dayIdx = (d.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    dowSums[dayIdx] += s.qty;
    dowCounts[dayIdx]++;
  }
  const dayOfWeek = dowSums.map((sum, i) => (dowCounts[i] > 0 ? sum / dowCounts[i] : 0));
  const dayOfWeekFactors = dayOfWeek.map((avg) => (overallMean > 0 ? avg / overallMean : 1));

  // Month aggregation
  const monthSums = new Array(12).fill(0);
  const monthCounts = new Array(12).fill(0);
  for (const s of sales) {
    const month = new Date(s.date).getMonth();
    monthSums[month] += s.qty;
    monthCounts[month]++;
  }
  const monthOfYear = monthSums.map((sum, i) => (monthCounts[i] > 0 ? sum / monthCounts[i] : 0));
  const monthFactors = monthOfYear.map((avg) => (overallMean > 0 ? avg / overallMean : 1));

  const peakDayIdx = dayOfWeekFactors.indexOf(Math.max(...dayOfWeekFactors));
  const peakMonthIdx = monthFactors.indexOf(Math.max(...monthFactors));

  return {
    dayOfWeek,
    monthOfYear,
    dayOfWeekFactors,
    monthFactors,
    peakDay: DAY_NAMES[peakDayIdx],
    peakMonth: MONTH_NAMES[peakMonthIdx],
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
