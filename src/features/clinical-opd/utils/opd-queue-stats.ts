import type { OpdQueueEncounter } from "@/features/clinical-opd/types/clinical-opd.types";

export type OpdQueueSummaryStats = {
  total: number;
  waiting: number;
  in_progress: number;
  completed: number;
};

export function computeOpdQueueStats(
  encounters: OpdQueueEncounter[],
): OpdQueueSummaryStats {
  return {
    total: encounters.length,
    waiting: encounters.filter((item) => item.status === "waiting").length,
    in_progress: encounters.filter((item) => item.status === "in_progress")
      .length,
    completed: encounters.filter((item) => item.status === "completed").length,
  };
}
