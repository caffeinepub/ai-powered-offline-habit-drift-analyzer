import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BarChart2 } from "lucide-react";
import { HabitCategory } from "../backend";
import HabitHistoryList from "../components/HabitHistoryList";
import HabitLogForm from "../components/HabitLogForm";
import { useLogsByCategory } from "../hooks/useQueries";

const CATEGORIES = [
  HabitCategory.sleep,
  HabitCategory.study,
  HabitCategory.exercise,
];

function HabitCard({ category }: { category: HabitCategory }) {
  const { data: logs, isLoading } = useLogsByCategory(category);

  return (
    <div className="bg-surface border border-border/40 rounded-sm p-5 space-y-5">
      <HabitLogForm category={category} />
      <div className="border-t border-border/20 pt-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
          Recent History
        </p>
        {isLoading ? (
          <div className="space-y-1.5">
            {["s1", "s2", "s3", "s4"].map((id) => (
              <Skeleton key={id} className="h-7 w-full bg-surface-elevated" />
            ))}
          </div>
        ) : (
          <HabitHistoryList
            entries={logs ?? []}
            category={category}
            limit={10}
          />
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">
            Daily Log
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track your habits. The system will detect drift before you do.
          </p>
        </div>
        <Link
          to="/analytics"
          className="flex items-center gap-2 text-xs text-accent-primary hover:text-accent-primary/80 font-semibold uppercase tracking-wider transition-colors"
        >
          <BarChart2 className="w-4 h-4" />
          View Analytics
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CATEGORIES.map((category) => (
          <HabitCard key={category} category={category} />
        ))}
      </div>

      <div className="bg-surface border border-border/30 rounded-sm px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="w-1 h-full bg-accent-primary rounded-full self-stretch min-h-[2rem]" />
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              How it works
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Log your habits daily. After 7+ entries, the system computes drift
              detection, momentum decay, behavioral collapse probability, and
              7-day forecasts — all processed locally on-chain. Visit the
              Analytics tab to see your predictive risk scores.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
