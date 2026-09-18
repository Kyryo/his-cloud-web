import type {
  OpdQueueEncounter,
  OpdQueueStage,
} from "@/features/clinical-opd/types/clinical-opd.types";

export const OPD_QUEUE_STAGE_LABELS: Record<OpdQueueStage, string> = {
  registered: "Registered",
  triaged: "Ready",
  with_clinician: "With clinician",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const OPD_QUEUE_LIVE_STAGES: OpdQueueStage[] = [
  "registered",
  "triaged",
  "with_clinician",
];

export const OPD_QUEUE_CLOSED_STAGES: OpdQueueStage[] = [
  "completed",
  "cancelled",
];

export function formatOpdQueueStage(stage: string | null | undefined) {
  if (!stage) {
    return "Registered";
  }
  if (stage in OPD_QUEUE_STAGE_LABELS) {
    return OPD_QUEUE_STAGE_LABELS[stage as OpdQueueStage];
  }
  return stage.replaceAll("_", " ");
}

export function resolveOpdQueueStage(
  encounter: Pick<
    OpdQueueEncounter,
    "queue_stage" | "status" | "triaged_at"
  >,
): OpdQueueStage {
  const stage = encounter.queue_stage;
  if (
    stage === "registered" ||
    stage === "triaged" ||
    stage === "with_clinician" ||
    stage === "completed" ||
    stage === "cancelled"
  ) {
    return stage;
  }

  if (encounter.status === "cancelled") {
    return "cancelled";
  }
  if (encounter.status === "completed") {
    return "completed";
  }
  if (encounter.status === "in_progress") {
    return "with_clinician";
  }
  if (encounter.triaged_at) {
    return "triaged";
  }
  return "registered";
}

export function formatWaitingMinutes(minutes: number | null | undefined) {
  if (typeof minutes !== "number" || Number.isNaN(minutes)) {
    return "—";
  }
  if (minutes < 1) {
    return "<1 min";
  }
  return `${minutes} min`;
}

export function formatQueueVitalsSnapshot(
  vitals: OpdQueueEncounter["latest_vitals"],
) {
  if (!vitals?.length) {
    return "—";
  }

  return vitals
    .slice(0, 3)
    .map((vital) => {
      const value = vital.text_value || vital.numeric_value || "—";
      return vital.unit ? `${value} ${vital.unit}` : value;
    })
    .join(" · ");
}

export function formatAllergySeverity(
  severity: string | null | undefined,
  count?: number | null,
) {
  if (!count && !severity) {
    return "None";
  }

  const label = severity
    ? severity.replaceAll("_", " ")
    : `${count} on file`;
  if (count && count > 1) {
    return `${label} · ${count}`;
  }
  return label;
}
