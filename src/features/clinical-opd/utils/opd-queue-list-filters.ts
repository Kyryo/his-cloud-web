import type { OpdQueueEncounter } from "@/features/clinical-opd/types/clinical-opd.types";

export type OpdQueueStatusFilter =
  | "all"
  | "waiting"
  | "in_progress"
  | "completed"
  | "cancelled";

export type OpdQueueListFilterState = {
  status: OpdQueueStatusFilter;
};

export const DEFAULT_OPD_QUEUE_FILTERS: OpdQueueListFilterState = {
  status: "all",
};

export const OPD_QUEUE_STATUS_OPTIONS: Array<{
  value: OpdQueueStatusFilter;
  label: string;
}> = [
  { value: "all", label: "All statuses" },
  { value: "waiting", label: "Waiting" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function countActiveOpdQueueFilters(
  filters: OpdQueueListFilterState,
): number {
  return filters.status === "all" ? 0 : 1;
}

/** Status-only client filter for already-fetched queue rows. */
export function filterOpdQueueEncounters(
  encounters: OpdQueueEncounter[],
  filters: OpdQueueListFilterState,
): OpdQueueEncounter[] {
  if (filters.status === "all") {
    return encounters;
  }
  return encounters.filter((encounter) => encounter.status === filters.status);
}
