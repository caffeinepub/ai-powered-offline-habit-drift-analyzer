import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { DriftStatus, MomentumStatus } from "../lib/analytics";

interface DriftMomentumIndicatorsProps {
  drift: DriftStatus;
  momentum: MomentumStatus;
}

function TrendIndicator({
  label,
  value,
  isNegative,
  isActive,
  suffix = "%",
}: {
  label: string;
  value: number;
  isNegative: boolean;
  isActive: boolean;
  suffix?: string;
}) {
  const Icon = !isActive ? Minus : isNegative ? TrendingDown : TrendingUp;
  const colorClass = !isActive
    ? "text-muted-foreground"
    : isNegative
      ? "text-risk-high"
      : "text-risk-low";

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <div className={`flex items-center gap-1.5 ${colorClass}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-bold font-mono">
          {isActive ? `${Math.abs(value).toFixed(1)}${suffix}` : "—"}
        </span>
      </div>
      {isActive && (
        <span className={`text-xs font-medium ${colorClass}`}>
          {isNegative ? "Declining" : "Improving"}
        </span>
      )}
    </div>
  );
}

export default function DriftMomentumIndicators({
  drift,
  momentum,
}: DriftMomentumIndicatorsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-surface-elevated/50 rounded-sm px-3 py-2 border border-border/30">
        <TrendIndicator
          label="Pattern Drift"
          value={drift.driftMagnitude}
          isNegative={drift.currentAvg < drift.priorAvg}
          isActive={drift.isDrifting}
          suffix="%"
        />
      </div>
      <div className="bg-surface-elevated/50 rounded-sm px-3 py-2 border border-border/30">
        <TrendIndicator
          label="Momentum"
          value={Math.abs(momentum.decayRate) * 100}
          isNegative={momentum.isDecaying}
          isActive={momentum.isDecaying || momentum.ewmaValues.length > 1}
          suffix="%"
        />
      </div>
    </div>
  );
}
