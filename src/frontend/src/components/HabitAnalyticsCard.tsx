import { Skeleton } from "@/components/ui/skeleton";
import { HabitCategory } from "../backend";
import {
  type HabitAnalytics,
  getCategoryIcon,
  getCategoryLabel,
  getCategoryUnit,
} from "../lib/analytics";
import ClusterBadge from "./ClusterBadge";
import CollapseProbabilityMeter from "./CollapseProbabilityMeter";
import CollapseWarningBanner from "./CollapseWarningBanner";
import DriftMomentumIndicators from "./DriftMomentumIndicators";
import HabitChart from "./HabitChart";

interface HabitAnalyticsCardProps {
  analytics: HabitAnalytics | null;
  isLoading?: boolean;
}

const categoryColors: Record<HabitCategory, string> = {
  [HabitCategory.sleep]: "#6366f1",
  [HabitCategory.study]: "#22d3ee",
  [HabitCategory.exercise]: "#f59e0b",
};

export default function HabitAnalyticsCard({
  analytics,
  isLoading,
}: HabitAnalyticsCardProps) {
  if (isLoading || !analytics) {
    return (
      <div className="bg-surface border border-border/40 rounded-sm p-5 space-y-4">
        <Skeleton className="h-5 w-32 bg-surface-elevated" />
        <Skeleton className="h-36 w-full bg-surface-elevated" />
        <Skeleton className="h-16 w-full bg-surface-elevated" />
        <Skeleton className="h-12 w-full bg-surface-elevated" />
      </div>
    );
  }

  const {
    category,
    drift,
    collapse,
    momentum,
    prediction,
    forecast,
    cluster,
    logCount,
  } = analytics;
  const label = getCategoryLabel(category);
  const unit = getCategoryUnit(category);
  const icon = getCategoryIcon(category);
  const color = categoryColors[category];

  return (
    <div className="bg-surface border border-border/40 rounded-sm p-5 space-y-4 hover:border-border/70 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-foreground">
              {label}
            </h3>
            <p className="text-xs text-muted-foreground">
              {logCount} entries logged
            </p>
          </div>
        </div>
        <ClusterBadge label={cluster.clusterLabel} />
      </div>

      {/* Collapse Warning */}
      {collapse.isCollapsed && <CollapseWarningBanner collapse={collapse} />}

      {/* Chart */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Trend & Forecast
          </span>
          {!forecast.hasEnoughData && (
            <span className="text-xs text-muted-foreground italic">
              Need 7+ entries for forecast
            </span>
          )}
        </div>
        <HabitChart
          historicalSeries={forecast.historicalSeries}
          forecastedSeries={forecast.forecastedSeries}
          unit={unit}
          color={color}
        />
      </div>

      {/* Collapse Probability */}
      <CollapseProbabilityMeter
        score={prediction.probabilityScore}
        riskTier={prediction.riskTier}
      />

      {/* Drift & Momentum */}
      <DriftMomentumIndicators drift={drift} momentum={momentum} />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/20">
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
            Avg
          </p>
          <p className="text-sm font-bold font-mono text-foreground">
            {cluster.averageValue.toFixed(1)}
            <span className="text-xs text-muted-foreground ml-0.5">{unit}</span>
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
            CV
          </p>
          <p className="text-sm font-bold font-mono text-foreground">
            {cluster.consistencyScore.toFixed(0)}
            <span className="text-xs text-muted-foreground ml-0.5">%</span>
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
            Drift
          </p>
          <p
            className={`text-sm font-bold font-mono ${drift.isDrifting ? "text-risk-high" : "text-risk-low"}`}
          >
            {drift.isDrifting ? `${drift.driftMagnitude.toFixed(0)}%` : "None"}
          </p>
        </div>
      </div>
    </div>
  );
}
