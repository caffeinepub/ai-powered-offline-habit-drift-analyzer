import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { PlusCircle, RefreshCw } from "lucide-react";
import { HabitCategory } from "../backend";
import HabitAnalyticsCard from "../components/HabitAnalyticsCard";
import { useAllAnalytics } from "../hooks/useQueries";

const CATEGORIES = [
  HabitCategory.sleep,
  HabitCategory.study,
  HabitCategory.exercise,
];

export default function Analytics() {
  const {
    data: allAnalytics,
    isLoading,
    refetch,
    isFetching,
  } = useAllAnalytics();
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["analytics"] });
    queryClient.invalidateQueries({ queryKey: ["logs"] });
    refetch();
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">
            Predictive Analytics
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Collapse probability, drift detection, and behavioral forecasting.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
            className="text-muted-foreground hover:text-foreground h-8 px-3"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`}
            />
            <span className="text-xs uppercase tracking-wider">Refresh</span>
          </Button>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-accent-primary hover:text-accent-primary/80 font-semibold uppercase tracking-wider transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Log Habits
          </Link>
        </div>
      </div>

      {/* Risk legend */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Risk Tiers:
        </span>
        {[
          { label: "Low (0–30)", color: "bg-risk-low", text: "text-risk-low" },
          {
            label: "Medium (31–55)",
            color: "bg-risk-medium",
            text: "text-risk-medium",
          },
          {
            label: "High (56–79)",
            color: "bg-risk-high",
            text: "text-risk-high",
          },
          {
            label: "Critical (80–100)",
            color: "bg-risk-critical",
            text: "text-risk-critical",
          },
        ].map((tier) => (
          <div key={tier.label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${tier.color}`} />
            <span className={`text-xs font-medium ${tier.text}`}>
              {tier.label}
            </span>
          </div>
        ))}
      </div>

      {/* Analytics cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((category) => (
          <HabitAnalyticsCard
            key={category}
            analytics={allAnalytics?.[category] ?? null}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Methodology note */}
      <div className="bg-surface border border-border/30 rounded-sm px-5 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground uppercase tracking-wider mb-1">
              Drift Detection
            </p>
            <p className="leading-relaxed">
              Compares rolling 7-day averages. Flags ≥20% deviation as pattern
              drift.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground uppercase tracking-wider mb-1">
              Momentum Decay
            </p>
            <p className="leading-relaxed">
              EWMA with α=0.3 over last 14 entries. Downward slope over 5 points
              = decay.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground uppercase tracking-wider mb-1">
              Collapse Probability
            </p>
            <p className="leading-relaxed">
              Survival-analysis scoring: days since last log + drift + momentum
              + collapse flags.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
