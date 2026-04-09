import { Progress } from "@/components/ui/progress";

interface CollapseProbabilityMeterProps {
  score: number;
  riskTier: "Low" | "Medium" | "High" | "Critical";
}

const tierConfig = {
  Low: {
    color: "text-risk-low",
    barClass: "bg-risk-low",
    label: "LOW RISK",
    bgClass: "bg-risk-low/10 border-risk-low/30",
  },
  Medium: {
    color: "text-risk-medium",
    barClass: "bg-risk-medium",
    label: "MEDIUM RISK",
    bgClass: "bg-risk-medium/10 border-risk-medium/30",
  },
  High: {
    color: "text-risk-high",
    barClass: "bg-risk-high",
    label: "HIGH RISK",
    bgClass: "bg-risk-high/10 border-risk-high/30",
  },
  Critical: {
    color: "text-risk-critical",
    barClass: "bg-risk-critical",
    label: "CRITICAL",
    bgClass: "bg-risk-critical/10 border-risk-critical/30",
  },
};

export default function CollapseProbabilityMeter({
  score,
  riskTier,
}: CollapseProbabilityMeterProps) {
  const config = tierConfig[riskTier];

  return (
    <div className={`rounded-sm border px-3 py-2 ${config.bgClass}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Collapse Risk
        </span>
        <span className={`text-xs font-bold tracking-widest ${config.color}`}>
          {config.label}
        </span>
      </div>
      <div className="flex items-end gap-3">
        <span
          className={`text-3xl font-black font-mono leading-none ${config.color}`}
        >
          {score}
          <span className="text-base font-semibold">%</span>
        </span>
        <div className="flex-1 pb-1">
          <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${config.barClass}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
