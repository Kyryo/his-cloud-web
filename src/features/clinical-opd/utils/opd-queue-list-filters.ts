import type { OpdQueueEncounter, OpdQueueStage } from "@/features/clinical-opd/types/clinical-opd.types";
import { resolveOpdQueueStage } from "@/features/clinical-opd/utils/opd-queue-stage";

export type OpdQueueStageFilter = OpdQueueStage;

export type OpdQueueListFilterState = {
  queueStage: OpdQueueStageFilter;
};

export const DEFAULT_OPD_QUEUE_FILTERS: OpdQueueListFilterState = {
  queueStage: "registered",
};

export const OPD_QUEUE_STAGE_OPTIONS: Array<{
  value: OpdQueueStageFilter;
  label: string;
  group: "live" | "closed";
}> = [
  { value: "registered", label: "Registered", group: "live" },
  { value: "triaged", label: "Ready", group: "live" },
  { value: "with_clinician", label: "With clinician", group: "live" },
  { value: "completed", label: "Completed", group: "closed" },
  { value: "cancelled", label: "Cancelled", group: "closed" },
];

export function countActiveOpdQueueFilters(
  filters: OpdQueueListFilterState,
): number {
  return filters.queueStage === DEFAULT_OPD_QUEUE_FILTERS.queueStage ? 0 : 1;
}

export function filterOpdQueueEncounters(
  encounters: OpdQueueEncounter[],
  filters: OpdQueueListFilterState,
): OpdQueueEncounter[] {
  return encounters.filter(
    (encounter) => resolveOpdQueueStage(encounter) === filters.queueStage,
  );
}
