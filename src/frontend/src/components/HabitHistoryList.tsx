import { ScrollArea } from "@/components/ui/scroll-area";
import type { HabitLogEntry } from "../backend";
import type { HabitCategory } from "../backend";
import { formatDate, getCategoryUnit } from "../lib/analytics";

interface HabitHistoryListProps {
  entries: HabitLogEntry[];
  category: HabitCategory;
  limit?: number;
}

export default function HabitHistoryList({
  entries,
  category,
  limit = 10,
}: HabitHistoryListProps) {
  const unit = getCategoryUnit(category);

  const sorted = [...entries]
    .sort((a, b) => Number(b.date) - Number(a.date))
    .slice(0, limit);

  if (sorted.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-xs">
        No entries yet. Start logging!
      </div>
    );
  }

  return (
    <ScrollArea className="h-48">
      <div className="space-y-1 pr-2">
        {sorted.map((entry) => {
          const dateMs = Number(entry.date) / 1_000_000;
          const dateStr = formatDate(dateMs);
          const key = `${entry.timestamp}-${entry.category}`;
          return (
            <div
              key={key}
              className="flex items-center justify-between py-1.5 px-2 rounded-sm bg-surface-elevated/50 hover:bg-surface-elevated transition-colors"
            >
              <span className="text-xs text-muted-foreground">{dateStr}</span>
              <span className="text-xs font-mono font-semibold text-foreground">
                {entry.quantity}
                <span className="text-muted-foreground ml-1">{unit}</span>
              </span>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
