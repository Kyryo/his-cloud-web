import type { OpdQueueEncounter } from "@/features/clinical-opd/types/clinical-opd.types";
import { resolveOpdQueueStage } from "@/features/clinical-opd/utils/opd-queue-stage";

export type OpdQueueSummaryStats = {
  total: number;
  registered: number;
  triaged: number;
  with_clinician: number;
  completed: number;
};

export function computeOpdQueueStats(
  encounters: OpdQueueEncounter[],
): OpdQueueSummaryStats {
  const stages = encounters.map(resolveOpdQueueStage);
  return {
    total: encounters.length,
    registered: stages.filter((stage) => stage === "registered").length,
    triaged: stages.filter((stage) => stage === "triaged").length,
    with_clinician: stages.filter((stage) => stage === "with_clinician").length,
    completed: stages.filter((stage) => stage === "completed").length,
  };
}
