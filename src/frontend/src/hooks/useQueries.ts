import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HabitCategory, type HabitLogEntry } from "../backend";
import { type HabitAnalytics, computeAllAnalytics } from "../lib/analytics";
import { useActor } from "./useActor";

// ─── Fetch all logs ───────────────────────────────────────────────────────────
export function useAllLogs() {
  const { actor, isFetching } = useActor();

  return useQuery<HabitLogEntry[]>({
    queryKey: ["logs", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLogs();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Fetch logs by category ───────────────────────────────────────────────────
export function useLogsByCategory(category: HabitCategory) {
  const { actor, isFetching } = useActor();

  return useQuery<HabitLogEntry[]>({
    queryKey: ["logs", "category", category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLogsByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Create log mutation ──────────────────────────────────────────────────────
export function useCreateLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      category,
      quantity,
      date,
    }: {
      category: HabitCategory;
      quantity: number;
      date: bigint;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.createLog(category, quantity, date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

// ─── Analytics per category ───────────────────────────────────────────────────
export function useHabitAnalytics(category: HabitCategory) {
  const { data: logs, isLoading, error } = useLogsByCategory(category);

  const analytics: HabitAnalytics | null = logs
    ? computeAllAnalytics(logs, category)
    : null;

  return { analytics, isLoading, error };
}

// ─── All analytics ────────────────────────────────────────────────────────────
export function useAllAnalytics() {
  const { actor, isFetching } = useActor();

  return useQuery<Record<HabitCategory, HabitAnalytics>>({
    queryKey: ["analytics", "all"],
    queryFn: async () => {
      if (!actor) {
        return {
          [HabitCategory.sleep]: computeAllAnalytics([], HabitCategory.sleep),
          [HabitCategory.study]: computeAllAnalytics([], HabitCategory.study),
          [HabitCategory.exercise]: computeAllAnalytics(
            [],
            HabitCategory.exercise,
          ),
        };
      }
      const [sleepLogs, studyLogs, exerciseLogs] = await Promise.all([
        actor.getLogsByCategory(HabitCategory.sleep),
        actor.getLogsByCategory(HabitCategory.study),
        actor.getLogsByCategory(HabitCategory.exercise),
      ]);
      return {
        [HabitCategory.sleep]: computeAllAnalytics(
          sleepLogs,
          HabitCategory.sleep,
        ),
        [HabitCategory.study]: computeAllAnalytics(
          studyLogs,
          HabitCategory.study,
        ),
        [HabitCategory.exercise]: computeAllAnalytics(
          exerciseLogs,
          HabitCategory.exercise,
        ),
      };
    },
    enabled: !!actor && !isFetching,
  });
}
