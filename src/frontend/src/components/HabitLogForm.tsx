import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { HabitCategory } from "../backend";
import { useCreateLog } from "../hooks/useQueries";
import {
  getCategoryIcon,
  getCategoryLabel,
  getCategoryUnit,
} from "../lib/analytics";

interface HabitLogFormProps {
  category: HabitCategory;
}

export default function HabitLogForm({ category }: HabitLogFormProps) {
  const [value, setValue] = useState("");
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const createLog = useCreateLog();

  const label = getCategoryLabel(category);
  const unit = getCategoryUnit(category);
  const icon = getCategoryIcon(category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = Number.parseFloat(value);
    if (Number.isNaN(quantity) || quantity < 0) {
      toast.error("Please enter a valid positive number");
      return;
    }

    const dateMs = new Date(date).getTime();
    const dateNano = BigInt(dateMs) * 1_000_000n;

    try {
      await createLog.mutateAsync({ category, quantity, date: dateNano });
      toast.success(`${label} logged: ${quantity} ${unit}`);
      setValue("");
    } catch (_err) {
      toast.error("Failed to save log entry");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{icon}</span>
        <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">
          {label}
        </h3>
        <span className="text-xs text-muted-foreground ml-auto">{unit}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label
            htmlFor={`value-${category}`}
            className="text-xs text-muted-foreground uppercase tracking-wider"
          >
            Value ({unit})
          </Label>
          <Input
            id={`value-${category}`}
            type="number"
            min="0"
            step="0.1"
            placeholder={category === HabitCategory.exercise ? "30" : "7.5"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="bg-surface-elevated border-border/50 text-foreground placeholder:text-muted-foreground/50 h-9 text-sm"
            required
          />
        </div>
        <div className="space-y-1">
          <Label
            htmlFor={`date-${category}`}
            className="text-xs text-muted-foreground uppercase tracking-wider"
          >
            Date
          </Label>
          <Input
            id={`date-${category}`}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-surface-elevated border-border/50 text-foreground h-9 text-sm"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={createLog.isPending || !value}
        className="w-full h-9 bg-accent-primary hover:bg-accent-primary/90 text-background text-xs font-semibold tracking-wider uppercase"
      >
        {createLog.isPending ? (
          <Loader2 className="w-3 h-3 animate-spin mr-2" />
        ) : (
          <Plus className="w-3 h-3 mr-2" />
        )}
        Log {label}
      </Button>
    </form>
  );
}
