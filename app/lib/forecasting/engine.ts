import * as ss from "simple-statistics";
import {
  ForecastOutput,
  simpleMovingAverage,
  weightedMovingAverage,
  holtsLinearTrend,
  linearRegression
} from "./models";

export type { ForecastOutput } from "./models";

// ── Shared types ──────────────────────────────────────────────────────────────

export interface DailySales {
  date: string;
  qty: number;
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

/** Output for a reorder recommendation. */
export interface ReorderRecommendation {
  sku: string;
  reorderQuantity: number;
  targetStockLevel: number;
  confidence: number;
}

export async function runForecast(
  dailySales: DailySales[],
  horizonDays: number = 30
): Promise<ForecastResult> {
  if (dailySales.length < 7) {
    return emptyForecast(horizonDays);
  }

  const quantities = dailySales.map((d) => d.qty);
  const dates = dailySales.map((d) => d.date);
  const mitigatedQuantities = mitigateOutliers(quantities);

  // Create mitigated dailySales array for model selection
  const mitigatedDailySales: DailySales[] = mitigatedQuantities.map((qty, idx) => ({
    qty,
    date: dates[idx],
  }));

  // 1. Determine the best model based on historical accuracy (MAPE) using mitigated data
  const bestModelName = await selectBestModel(mitigatedDailySales);

  // Use mitigated data for trend detection and final prediction
  const mitigatedLastDateStr = dates[dates.length - 1];

  // Detect trend via linear regression on mitigated data
  const points = mitigatedQuantities.map((qty, i) => [i, qty]);
  const regression = ss.linearRegression(points);
  const slope = regression.m;
  const avg = ss.mean(mitigatedQuantities);
  const sd = ss.standardDeviation(mitigatedQuantities);

  let trendDirection: "up" | "down" | "stable" = "stable";
  if (slope > avg * 0.01) trendDirection = "up";
  else if (slope < -avg * 0.01) trendDirection = "down";

  // 2. Get predictions from the best model using mitigated data
  let predictions: ForecastOutput["predictions"];
  switch (bestModelName) {
    case 'SMA':
      predictions = simpleMovingAverage(mitigatedQuantities, 7, horizonDays, mitigatedLastDateStr).predictions;
      break;
    case 'WMA':
      predictions = weightedMovingAverage(mitigatedQuantities, 7, horizonDays, mitigatedLastDateStr).predictions;
      break;
    case 'Holts':
      predictions = holtsLinearTrend(mitigatedQuantities, 0.3, 0.1, horizonDays, mitigatedLastDateStr).predictions;
      break;
    case 'Regression':
      predictions = linearRegression(mitigatedQuantities, horizonDays, mitigatedLastDateStr).predictions;
      break;
    default:
      predictions = simpleMovingAverage(mitigatedQuantities, 7, horizonDays, mitigatedLastDateStr).predictions;
  }

  const totalPredicted = predictions.reduce((sum, p) => sum + p.yhat, 0);
  const confidence = 0.7; // Placeholder

  return {
    predictions,
    totalPredicted,
    confidence,
    modelUsed: bestModelName,
    avgDailySales: avg,
    trendDirection,
  };
}

/**
 * Evaluates all available models on historical data and returns the name of the best model.
 */
/**
 * Evaluates all available models on historical data and returns the name of the best model.
 */
async function selectBestModel(historicalSales: DailySales[]): Promise<string> {
  if (historicalSales.length < 14) return 'SMA'; // Not enough data to backtest

  // Split data into training (past) and validation (most recent)
  // We use the most recent 7 days as validation to check how well models predicted them.
  const validationSize = 7;
  const trainingData = historicalSales.slice(0, -validationSize);
  const validationData = historicalSales.slice(-validationSize);

  // Extract quantities and apply outlier mitigation before model evaluation
  const validationQuantities = validationData.map(d => d.qty);
  const trainingQuantities = trainingData.map(d => d.qty);
  const cleanedTraining = mitigateOutliers(trainingQuantities);
  const cleanedValidation = mitigateOutliers(validationQuantities);

  const trainingDates = trainingData.map(d => d.date);
  const validationDates = validationData.map(d => d.date);
  const lastDateStr = trainingData[trainingData.length - 1].date;

  const models = [
    { name: 'SMA', func: () => simpleMovingAverage(cleanedTraining, 7, validationSize, lastDateStr) },
    { name: 'WMA', func: () => weightedMovingAverage(cleanedTraining, 7, validationSize, lastDateStr) },
    { name: 'Holts', func: () => holtsLinearTrend(cleanedTraining, 0.3, 0.1, validationSize, lastDateStr) },
    { name: 'Regression', func: () => linearRegression(cleanedTraining, validationSize, lastDateStr) }
  ];

  const results = await Promise.all(models.map(m => m.func()));

  let bestModel = 'SMA';
  let minMAPE = Infinity;

  results.forEach((res, index) => {
    const mape = calculateMAPE(cleanedValidation, res.predictions.map(p => p.yhat));
    if (mape < minMAPE) {
      minMAPE = mape;
      bestModel = models[index].name;
    }
  });

  return bestModel;
}

function calculateMAPE(actuals: number[], predictions: number[]): number {
  let totalError = 0;
  let count = 0;

  for (let i = 0; i < actuals.length; i++) {
    if (actuals[i] > 0) {
      totalError += Math.abs((actuals[i] - predictions[i]) / actuals[i]);
      count++;
    }
  }

  return count === 0 ? 1 : totalError / count;
}

// ── Outlier Detection ─────────────────────────────────────────────────────────
/**
 * Detect outliers in a numeric array using median absolute deviation (MAD).
 * Returns an array of booleans where true indicates an outlier.
 * @param data - Array of numbers
 * @param threshold - Number of MADs beyond which a point is considered an outlier (default 3)
 */
function detectOutliers(data: number[], threshold: number = 3): boolean[] {
  if (data.length < 2) return data.map(() => false);

  // Compute median
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];

  // Compute absolute deviations from median
  const absDevs = data.map(val => Math.abs(val - median));
  const sortedAbsDevs = [...absDevs].sort((a, b) => a - b);
  const medianAbsDev = sortedAbsDevs.length % 2 === 0
    ? (sortedAbsDevs[mid - 1] + sortedAbsDevs[mid]) / 2
    : sortedAbsDevs[mid];

  // Avoid division by zero
  if (medianAbsDev === 0) {
    // If all values are the same, no outliers
    return data.map(() => false);
  }

  // Compute modified z-scores
  const modifiedZScores = absDevs.map(dev => (0.6745 * dev) / medianAbsDev);
  return modifiedZScores.map(z => Math.abs(z) > threshold);
}

/**
 * Mitigate outliers in a numeric array by replacing them with the median.
 * @param data - Array of numbers
 * @param threshold - Number of MADs beyond which a point is considered an outlier (default 3)
 * @returns New array with outliers replaced by median
 */
function mitigateOutliers(data: number[], threshold: number = 3): number[] {
  const outliers = detectOutliers(data, threshold);
  if (!outliers.some(isOutlier => isOutlier)) return data;

  // Compute median
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];

  return data.map((val, idx) => outliers[idx] ? median : val);
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
  dayOfWeek: number[];
  monthOfYear: number[];
  dayOfWeekFactors: number[];
  monthFactors: number[];
  peakDay: string;
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

/**
 * Generates a reorder recommendation based on forecast and current stock.
 *
 * @param currentStock - Current inventory level.
 * @param predictedDemandDuringLeadTime - Total predicted demand during lead time.
 * @param safetyStock - Calculated safety stock level.
 */
export function getReorderRecommendation(
  currentStock: number,
  predictedDemandDuringLeadTime: number,
  safetyStock: number
): ReorderRecommendation {
  const targetStockLevel = Math.ceil(predictedDemandDuringLeadTime + safetyStock);
  const reorderQuantity = Math.max(0, targetStockLevel - currentStock);

  return {
    sku: "", // To be filled by caller
    reorderQuantity,
    targetStockLevel,
    confidence: 0.9, // Simplified
  };
}