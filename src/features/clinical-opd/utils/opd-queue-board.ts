import type {
  OpdQueueEncounter,
  OpdQueueStage,
} from "@/features/clinical-opd/types/clinical-opd.types";
import {
  OPD_QUEUE_STAGE_LABELS,
  resolveOpdQueueStage,
} from "@/features/clinical-opd/utils/opd-queue-stage";
import type { VisitEncounterAction } from "@/features/visits/services/visits.service";

export const OPD_BOARD_STAGES: OpdQueueStage[] = [
  "registered",
  "triaged",
  "with_clinician",
  "completed",
  "cancelled",
];

/** Forward-only clinical flow. Cancelled sits beside it, not behind it. */
const OPD_BOARD_FLOW: OpdQueueStage[] = [
  "registered",
  "triaged",
  "with_clinician",
  "completed",
];

export function isEarlierOpdBoardStage(
  from: OpdQueueStage,
  to: OpdQueueStage,
): boolean {
  const fromIndex = OPD_BOARD_FLOW.indexOf(from);
  const toIndex = OPD_BOARD_FLOW.indexOf(to);
  return fromIndex >= 0 && toIndex >= 0 && toIndex < fromIndex;
}

export type OpdBoardColumn = {
  stage: OpdQueueStage;
  label: string;
  encounters: OpdQueueEncounter[];
};

export type OpdBoardMove =
  | { kind: "ready" }
  | { kind: "encounter"; action: VisitEncounterAction };

const BOARD_MOVES: Record<
  OpdQueueStage,
  Partial<Record<OpdQueueStage, OpdBoardMove>>
> = {
  registered: {
    triaged: { kind: "ready" },
    with_clinician: { kind: "encounter", action: "start" },
    completed: { kind: "encounter", action: "complete" },
    cancelled: { kind: "encounter", action: "cancel" },
  },
  triaged: {
    with_clinician: { kind: "encounter", action: "start" },
    completed: { kind: "encounter", action: "complete" },
    cancelled: { kind: "encounter", action: "cancel" },
  },
  with_clinician: {
    completed: { kind: "encounter", action: "complete" },
    cancelled: { kind: "encounter", action: "cancel" },
  },
  completed: {},
  cancelled: {},
};

export function getOpdBoardMove(
  from: OpdQueueStage,
  to: OpdQueueStage,
): OpdBoardMove | null {
  if (from === to || isEarlierOpdBoardStage(from, to)) {
    return null;
  }
  return BOARD_MOVES[from][to] ?? null;
}

export function canDropOnOpdBoardColumn(
  from: OpdQueueStage,
  to: OpdQueueStage,
): boolean {
  return from === to || getOpdBoardMove(from, to) !== null;
}

export function groupOpdQueueForBoard(
  encounters: OpdQueueEncounter[],
): OpdBoardColumn[] {
  const grouped = new Map<OpdQueueStage, OpdQueueEncounter[]>(
    OPD_BOARD_STAGES.map((stage) => [stage, []]),
  );

  for (const encounter of encounters) {
    grouped.get(resolveOpdQueueStage(encounter))?.push(encounter);
  }

  return OPD_BOARD_STAGES.map((stage) => ({
    stage,
    label: OPD_QUEUE_STAGE_LABELS[stage],
    encounters: grouped.get(stage) ?? [],
  }));
}

export function withOpdQueueStage(
  encounter: OpdQueueEncounter,
  stage: OpdQueueStage,
): OpdQueueEncounter {
  const now = new Date().toISOString();

  if (stage === "triaged") {
    return {
      ...encounter,
      queue_stage: "triaged",
      status: "waiting",
      triaged_at: encounter.triaged_at ?? now,
    };
  }

  if (stage === "with_clinician") {
    return {
      ...encounter,
      queue_stage: "with_clinician",
      status: "in_progress",
      started_at: encounter.started_at ?? now,
    };
  }

  if (stage === "completed") {
    return { ...encounter, queue_stage: "completed", status: "completed" };
  }

  if (stage === "cancelled") {
    return { ...encounter, queue_stage: "cancelled", status: "cancelled" };
  }

  return { ...encounter, queue_stage: "registered", status: "waiting" };
}

export function opdQueueBoardSignature(encounters: OpdQueueEncounter[]): string {
  return encounters
    .map(
      (encounter) =>
        `${encounter.encounter_uuid}:${resolveOpdQueueStage(encounter)}:${encounter.status}:${encounter.triaged_at ?? ""}:${encounter.started_at ?? ""}`,
    )
    .join("|");
}
