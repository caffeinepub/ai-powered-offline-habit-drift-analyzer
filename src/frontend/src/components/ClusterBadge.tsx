import { Moon, Shield, TrendingDown, Zap } from "lucide-react";

type ClusterLabel = "Stable" | "Volatile" | "Declining" | "Dormant";

interface ClusterBadgeProps {
  label: ClusterLabel;
}

const clusterConfig: Record<
  ClusterLabel,
  {
    icon: React.ElementType;
    colorClass: string;
    bgClass: string;
    borderClass: string;
  }
> = {
  Stable: {
    icon: Shield,
    colorClass: "text-risk-low",
    bgClass: "bg-risk-low/10",
    borderClass: "border-risk-low/30",
  },
  Volatile: {
    icon: Zap,
    colorClass: "text-risk-medium",
    bgClass: "bg-risk-medium/10",
    borderClass: "border-risk-medium/30",
  },
  Declining: {
    icon: TrendingDown,
    colorClass: "text-risk-high",
    bgClass: "bg-risk-high/10",
    borderClass: "border-risk-high/30",
  },
  Dormant: {
    icon: Moon,
    colorClass: "text-muted-foreground",
    bgClass: "bg-surface-elevated",
    borderClass: "border-border/40",
  },
};

export default function ClusterBadge({ label }: ClusterBadgeProps) {
  const config = clusterConfig[label];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-xs font-semibold tracking-wider uppercase ${config.colorClass} ${config.bgClass} ${config.borderClass}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </div>
  );
}
