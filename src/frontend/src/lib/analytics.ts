import { HabitCategory, type HabitLogEntry } from "../backend";

export interface DriftStatus {
  isDrifting: boolean;
  driftMagnitude: number; // percentage
  currentAvg: number;
  priorAvg: number;
}

export interface CollapseStatus {
  isCollapsed: boolean;
  consecutiveMissedDays: number;
  consecutiveZeroDays: number;
}

export interface MomentumStatus {
  isDecaying: boolean;
  decayRate: number;
  ewmaValues: number[];
}

export interface ProbabilityPrediction {
  probabilityScore: number; // 0-100
  riskTier: "Low" | "Medium" | "High" | "Critical";
}

export interface ForecastPoint {
  date: number; // ms timestamp
  value: number;
}

export interface TimeSeriesForecast {
  historicalSeries: ForecastPoint[];
  forecastedSeries: ForecastPoint[];
  hasEnoughData: boolean;
}

export interface HabitCluster {
  clusterLabel: "Stable" | "Volatile" | "Declining" | "Dormant";
  consistencyScore: number; // coefficient of variation
  averageValue: number;
  collapseProbability: number;
}

export interface HabitAnalytics {
  category: HabitCategory;
  drift: DriftStatus;
  collapse: CollapseStatus;
  momentum: MomentumStatus;
  prediction: ProbabilityPrediction;
  forecast: TimeSeriesForecast;
  cluster: HabitCluster;
  logCount: number;
}

const MS_PER_DAY = 86_400_000;

function sortByDate(entries: HabitLogEntry[]): HabitLogEntry[] {
  return [...entries].sort((a, b) => Number(a.date) - Number(b.date));
}

function nanosToMs(nano: bigint): number {
  return Number(nano / 1_000_000n);
}

function msToDay(ms: number): number {
  return Math.floor(ms / MS_PER_DAY);
}

export function computeDrift(entries: HabitLogEntry[]): DriftStatus {
  const sorted = sortByDate(entries);
  if (sorted.length < 2) {
    return { isDrifting: false, driftMagnitude: 0, currentAvg: 0, priorAvg: 0 };
  }

  const now = Date.now();
  const sevenDaysAgo = now - 7 * MS_PER_DAY;
  const fourteenDaysAgo = now - 14 * MS_PER_DAY;

  const currentWindow = sorted.filter((e) => nanosToMs(e.date) >= sevenDaysAgo);
  const priorWindow = sorted.filter((e) => {
    const ms = nanosToMs(e.date);
    return ms >= fourteenDaysAgo && ms < sevenDaysAgo;
  });

  if (currentWindow.length === 0 && priorWindow.length === 0) {
    return { isDrifting: false, driftMagnitude: 0, currentAvg: 0, priorAvg: 0 };
  }

  const currentAvg =
    currentWindow.length > 0
      ? currentWindow.reduce((s, e) => s + e.quantity, 0) / currentWindow.length
      : 0;
  const priorAvg =
    priorWindow.length > 0
      ? priorWindow.reduce((s, e) => s + e.quantity, 0) / priorWindow.length
      : 0;

  if (priorAvg === 0) {
    return { isDrifting: false, driftMagnitude: 0, currentAvg, priorAvg };
  }

  const driftMagnitude = Math.abs((currentAvg - priorAvg) / priorAvg) * 100;
  return {
    isDrifting: driftMagnitude >= 20,
    driftMagnitude,
    currentAvg,
    priorAvg,
  };
}

export function computeCollapse(entries: HabitLogEntry[]): CollapseStatus {
  if (entries.length === 0) {
    return {
      isCollapsed: false,
      consecutiveMissedDays: 0,
      consecutiveZeroDays: 0,
    };
  }

  const sorted = sortByDate(entries);
  const now = Date.now();
  const nowDay = msToDay(now);

  // Build a map of day -> quantity
  const dayMap = new Map<number, number>();
  for (const e of sorted) {
    const day = msToDay(nanosToMs(e.date));
    dayMap.set(day, e.quantity);
  }

  // Find the earliest logged day
  const firstDay = msToDay(nanosToMs(sorted[0].date));

  // Count consecutive missed days from today backwards
  let consecutiveMissedDays = 0;
  for (let d = nowDay; d >= firstDay; d--) {
    if (!dayMap.has(d)) {
      consecutiveMissedDays++;
    } else {
      break;
    }
  }

  // Count consecutive zero days from most recent entry backwards
  const lastDay = msToDay(nanosToMs(sorted[sorted.length - 1].date));
  let consecutiveZeroDays = 0;
  for (let d = lastDay; d >= firstDay; d--) {
    if (dayMap.has(d) && dayMap.get(d) === 0) {
      consecutiveZeroDays++;
    } else if (dayMap.has(d)) {
      break;
    }
  }

  const isCollapsed = consecutiveMissedDays >= 3 || consecutiveZeroDays >= 2;
  return { isCollapsed, consecutiveMissedDays, consecutiveZeroDays };
}

export function computeMomentum(entries: HabitLogEntry[]): MomentumStatus {
  const sorted = sortByDate(entries);
  const recent = sorted.slice(-14);

  if (recent.length < 2) {
    return {
      isDecaying: false,
      decayRate: 0,
      ewmaValues: recent.map((e) => e.quantity),
    };
  }

  const alpha = 0.3;
  const ewmaValues: number[] = [];
  let ewma = recent[0].quantity;
  ewmaValues.push(ewma);

  for (let i = 1; i < recent.length; i++) {
    ewma = alpha * recent[i].quantity + (1 - alpha) * ewma;
    ewmaValues.push(ewma);
  }

  // Check last 5 EWMA points for downward trend
  const last5 = ewmaValues.slice(-5);
  if (last5.length < 2) {
    return { isDecaying: false, decayRate: 0, ewmaValues };
  }

  // Linear regression on last 5 points
  const n = last5.length;
  const xs = Array.from({ length: n }, (_, i) => i);
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = last5.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((s, x, i) => s + x * last5[i], 0);
  const sumX2 = xs.reduce((s, x) => s + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  return {
    isDecaying: slope < 0,
    decayRate: slope,
    ewmaValues,
  };
}

export function computeProbability(
  entries: HabitLogEntry[],
  drift: DriftStatus,
  collapse: CollapseStatus,
  momentum: MomentumStatus,
): ProbabilityPrediction {
  if (entries.length === 0) {
    return { probabilityScore: 85, riskTier: "Critical" };
  }

  const sorted = sortByDate(entries);
  const lastEntryMs = nanosToMs(sorted[sorted.length - 1].date);
  const daysSinceLast = (Date.now() - lastEntryMs) / MS_PER_DAY;

  let score = 0;

  // Days since last log (0-30 points)
  score += Math.min(30, daysSinceLast * 5);

  // Drift magnitude (0-25 points)
  if (drift.isDrifting) {
    score += Math.min(25, drift.driftMagnitude * 0.5);
  }

  // Momentum decay (0-20 points)
  if (momentum.isDecaying) {
    score += Math.min(20, Math.abs(momentum.decayRate) * 10 + 10);
  }

  // Collapse flags (0-25 points)
  if (collapse.isCollapsed) {
    score += 15;
    score += Math.min(
      10,
      collapse.consecutiveMissedDays * 2 + collapse.consecutiveZeroDays * 3,
    );
  }

  const probabilityScore = Math.min(100, Math.round(score));

  let riskTier: "Low" | "Medium" | "High" | "Critical";
  if (probabilityScore <= 30) riskTier = "Low";
  else if (probabilityScore <= 55) riskTier = "Medium";
  else if (probabilityScore <= 79) riskTier = "High";
  else riskTier = "Critical";

  return { probabilityScore, riskTier };
}

export function computeForecast(entries: HabitLogEntry[]): TimeSeriesForecast {
  const sorted = sortByDate(entries);

  const historicalSeries: ForecastPoint[] = sorted.map((e) => ({
    date: nanosToMs(e.date),
    value: e.quantity,
  }));

  if (sorted.length < 7) {
    return { historicalSeries, forecastedSeries: [], hasEnoughData: false };
  }

  // Linear regression on all data
  const n = sorted.length;
  const xs = sorted.map((_, i) => i);
  const ys = sorted.map((e) => e.quantity);

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
  const sumX2 = xs.reduce((s, x) => s + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const lastDate = nanosToMs(sorted[sorted.length - 1].date);
  const forecastedSeries: ForecastPoint[] = [];

  for (let i = 1; i <= 7; i++) {
    const predictedValue = Math.max(0, intercept + slope * (n - 1 + i));
    forecastedSeries.push({
      date: lastDate + i * MS_PER_DAY,
      value: Math.round(predictedValue * 100) / 100,
    });
  }

  return { historicalSeries, forecastedSeries, hasEnoughData: true };
}

export function computeCluster(
  entries: HabitLogEntry[],
  prediction: ProbabilityPrediction,
): HabitCluster {
  if (entries.length === 0) {
    return {
      clusterLabel: "Dormant",
      consistencyScore: 0,
      averageValue: 0,
      collapseProbability: prediction.probabilityScore,
    };
  }

  const values = entries.map((e) => e.quantity);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((s, v) => s + (v - avg) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const cv = avg > 0 ? (stdDev / avg) * 100 : 100; // coefficient of variation %

  let clusterLabel: "Stable" | "Volatile" | "Declining" | "Dormant";

  if (prediction.probabilityScore >= 70) {
    clusterLabel = "Declining";
  } else if (cv > 50) {
    clusterLabel = "Volatile";
  } else if (cv <= 25 && prediction.probabilityScore <= 30) {
    clusterLabel = "Stable";
  } else {
    // Check if dormant (very low average relative to expected)
    const sorted = sortByDate(entries);
    const lastMs = nanosToMs(sorted[sorted.length - 1].date);
    const daysSinceLast = (Date.now() - lastMs) / MS_PER_DAY;
    if (daysSinceLast > 5) {
      clusterLabel = "Dormant";
    } else {
      clusterLabel = "Volatile";
    }
  }

  return {
    clusterLabel,
    consistencyScore: cv,
    averageValue: avg,
    collapseProbability: prediction.probabilityScore,
  };
}

export function computeAllAnalytics(
  entries: HabitLogEntry[],
  category: HabitCategory,
): HabitAnalytics {
  const drift = computeDrift(entries);
  const collapse = computeCollapse(entries);
  const momentum = computeMomentum(entries);
  const prediction = computeProbability(entries, drift, collapse, momentum);
  const forecast = computeForecast(entries);
  const cluster = computeCluster(entries, prediction);

  return {
    category,
    drift,
    collapse,
    momentum,
    prediction,
    forecast,
    cluster,
    logCount: entries.length,
  };
}

export function getCategoryLabel(category: HabitCategory): string {
  switch (category) {
    case HabitCategory.sleep:
      return "Sleep";
    case HabitCategory.study:
      return "Study";
    case HabitCategory.exercise:
      return "Exercise";
  }
}

export function getCategoryUnit(category: HabitCategory): string {
  switch (category) {
    case HabitCategory.sleep:
      return "hrs";
    case HabitCategory.study:
      return "hrs";
    case HabitCategory.exercise:
      return "min";
  }
}

export function getCategoryIcon(category: HabitCategory): string {
  switch (category) {
    case HabitCategory.sleep:
      return "🌙";
    case HabitCategory.study:
      return "📚";
    case HabitCategory.exercise:
      return "⚡";
  }
}

export function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
