import type { VisitEncounter } from "@/features/visits/types/visit.types";

export const OPEN_ENCOUNTER_STATUSES = new Set(["waiting", "in_progress"]);

export type EncounterCloseAction = "complete" | "cancel";

export function isOpenEncounter(encounter: Pick<VisitEncounter, "status">): boolean {
  return OPEN_ENCOUNTER_STATUSES.has(encounter.status);
}

export function getOpenEncounters(encounters: VisitEncounter[] | undefined): VisitEncounter[] {
  return (encounters ?? []).filter(isOpenEncounter);
}

/** Mirrors backend VisitEncounterResolutionService.has_recorded_progress. */
export function encounterHasRecordedProgress(
  encounter: Pick<
    VisitEncounter,
    "status" | "started_at" | "notes" | "clinician"
  >,
): boolean {
  if (encounter.status === "in_progress") {
    return true;
  }
  if (encounter.started_at) {
    return true;
  }
  if (encounter.notes?.trim()) {
    return true;
  }
  if (encounter.clinician != null) {
    return true;
  }
  return false;
}

export function predictEncounterCloseAction(
  encounter: Pick<
    VisitEncounter,
    "status" | "started_at" | "notes" | "clinician"
  >,
): EncounterCloseAction {
  return encounterHasRecordedProgress(encounter) ? "complete" : "cancel";
}

export function formatEncounterCloseActionLabel(action: EncounterCloseAction): string {
  return action === "complete" ? "completed" : "cancelled";
}
