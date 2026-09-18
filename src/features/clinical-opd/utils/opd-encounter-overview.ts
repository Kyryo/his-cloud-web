import type { EncounterDiagnosis } from "@/features/clinical/types/clinical-diagnosis.types";
import type {
  ClinicalTimelineEvent,
  EncounterClinicalNote,
  EncounterClinicalOrder,
  EncounterNursingNote,
  EncounterObservation,
  EncounterPhysicalExam,
  EncounterPrescription,
} from "@/features/clinical-opd/types/clinical-opd.types";
import {
  hasClinicalCapability,
  opdEncounterTabHref,
  type OpdEncounterTabId,
} from "@/features/clinical-opd/utils/opd-encounter-tabs";

export const OPD_OVERVIEW_RECENT_ACTIVITY_LIMIT = 5;

export type OpdOverviewWorkItem = {
  key: OpdEncounterTabId;
  label: string;
  count: number;
};

export type OpdOverviewContinueAction = {
  key: string;
  label: string;
  hint: string;
  href: string;
};

type BuildOverviewWorkItemsInput = {
  observations?: EncounterObservation[];
  diagnoses?: EncounterDiagnosis[];
  orders?: EncounterClinicalOrder[];
  prescriptions?: EncounterPrescription[];
  nursingNotes?: EncounterNursingNote[];
  clinicalNotes?: EncounterClinicalNote[];
  physicalExams?: EncounterPhysicalExam[];
  visibleTabIds: OpdEncounterTabId[];
};

type BuildOverviewContinueActionsInput = {
  visitUuid: string;
  encounterUuid: string;
  visibleTabIds: OpdEncounterTabId[];
  capabilities: string[];
  userRole?: string | null;
};

function isActiveOrder(order: EncounterClinicalOrder) {
  return order.status !== "CANCELLED" && order.is_active !== false;
}

function isActivePrescription(prescription: EncounterPrescription) {
  return prescription.status !== "cancelled";
}

function isActiveDiagnosis(diagnosis: EncounterDiagnosis) {
  return diagnosis.is_active !== false && diagnosis.status !== "cancelled";
}

export function countOpdOverviewNotes(
  nursingNotes?: EncounterNursingNote[],
  clinicalNotes?: EncounterClinicalNote[],
  physicalExams?: EncounterPhysicalExam[],
) {
  return (
    (nursingNotes?.length ?? 0) +
    (clinicalNotes?.length ?? 0) +
    (physicalExams?.length ?? 0)
  );
}

export function buildOpdOverviewWorkItems({
  observations,
  diagnoses,
  orders,
  prescriptions,
  nursingNotes,
  clinicalNotes,
  physicalExams,
  visibleTabIds,
}: BuildOverviewWorkItemsInput): OpdOverviewWorkItem[] {
  const visible = new Set(visibleTabIds);
  const items: OpdOverviewWorkItem[] = [];

  if (visible.has("vital-signs")) {
    items.push({
      key: "vital-signs",
      label: "Vitals",
      count: observations?.length ?? 0,
    });
  }
  if (visible.has("diagnoses")) {
    items.push({
      key: "diagnoses",
      label: "Diagnoses",
      count: (diagnoses ?? []).filter(isActiveDiagnosis).length,
    });
  }
  if (visible.has("orders")) {
    items.push({
      key: "orders",
      label: "Orders",
      count: (orders ?? []).filter(isActiveOrder).length,
    });
  }
  if (visible.has("medications")) {
    items.push({
      key: "medications",
      label: "Medications",
      count: (prescriptions ?? []).filter(isActivePrescription).length,
    });
  }
  if (visible.has("physical-examination") || visible.has("activity")) {
    items.push({
      key: visible.has("physical-examination")
        ? "physical-examination"
        : "activity",
      label: "Notes",
      count: countOpdOverviewNotes(nursingNotes, clinicalNotes, physicalExams),
    });
  }

  return items;
}

export function buildOpdOverviewContinueActions({
  visitUuid,
  encounterUuid,
  visibleTabIds,
  capabilities,
  userRole,
}: BuildOverviewContinueActionsInput): OpdOverviewContinueAction[] {
  const visible = new Set(visibleTabIds);
  const href = (tab: OpdEncounterTabId) =>
    opdEncounterTabHref(visitUuid, encounterUuid, tab);
  const actions: OpdOverviewContinueAction[] = [];

  if (
    visible.has("vital-signs") &&
    (userRole === "nurse" || hasClinicalCapability(capabilities, "record_vitals"))
  ) {
    actions.push({
      key: "vitals",
      label: "Record vitals",
      hint: "Weight, temperature, pulse, and blood pressure",
      href: href("vital-signs"),
    });
  }

  if (
    visible.has("complaint") &&
    (userRole === "physician" ||
      hasClinicalCapability(capabilities, "record_chief_complaint"))
  ) {
    actions.push({
      key: "complaint",
      label: "Record complaint",
      hint: "Chief complaint and HPI",
      href: href("complaint"),
    });
  }

  if (
    visible.has("physical-examination") &&
    (userRole === "physician" ||
      hasClinicalCapability(capabilities, "record_physical_exam"))
  ) {
    actions.push({
      key: "exam",
      label: "Write examination",
      hint: "Document findings for this visit",
      href: href("physical-examination"),
    });
  }

  if (
    visible.has("diagnoses") &&
    hasClinicalCapability(capabilities, "manage_diagnoses")
  ) {
    actions.push({
      key: "diagnoses",
      label: "Add diagnosis",
      hint: "Record the working diagnosis",
      href: href("diagnoses"),
    });
  }

  if (visible.has("orders")) {
    actions.push({
      key: "orders",
      label: "Place an order",
      hint: "Labs, imaging, procedures, or sundries",
      href: href("orders"),
    });
  }

  if (
    visible.has("medications") &&
    hasClinicalCapability(capabilities, "prescribe")
  ) {
    actions.push({
      key: "medications",
      label: "Prescribe",
      hint: "Draft or finalize a prescription",
      href: href("medications"),
    });
  }

  return actions.slice(0, 4);
}

export function selectRecentOpdTimelineEvents(
  events: ClinicalTimelineEvent[] | undefined,
  limit = OPD_OVERVIEW_RECENT_ACTIVITY_LIMIT,
) {
  return (events ?? [])
    .toSorted(
      (left, right) =>
        new Date(right.occurred_at).getTime() -
        new Date(left.occurred_at).getTime(),
    )
    .slice(0, limit);
}
