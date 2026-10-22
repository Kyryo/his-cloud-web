import { BFF_CLINICAL_DENTAL_ROUTES as ROUTES } from "@/constants/clinical-dental-api";
import type {
  DentalChart,
  DentalChartFinding,
  DentalFindingPayload,
  DentalFindingUpdatePayload,
  DentalHistoryEncounter,
  DentalHistorySections,
  DentalPerformPayload,
  DentalPlanItemPayload,
  DentalPlanItemUpdatePayload,
  DentalPlanUpdatePayload,
  DentalProcedure,
  DentalProcedurePayload,
  DentalProcedureUpdatePayload,
  DentalToothHistory,
  DentalTreatmentPlan,
  DentalTreatmentPlanItem,
  DentalTreatmentPlanPayload,
} from "@/features/clinical-dental/types/clinical-dental.types";
import { bffRequest } from "@/lib/bff-client";

export function fetchDentalChart(visitUuid: string, encounterUuid: string) {
  return bffRequest<DentalChart>(ROUTES.chart(visitUuid, encounterUuid));
}

export function createDentalFinding(
  visitUuid: string,
  encounterUuid: string,
  payload: DentalFindingPayload,
) {
  return bffRequest<DentalChartFinding>(
    ROUTES.chartFindings(visitUuid, encounterUuid),
    { method: "POST", body: payload },
  );
}

export function updateDentalFinding(
  visitUuid: string,
  encounterUuid: string,
  findingUuid: string,
  payload: DentalFindingUpdatePayload,
) {
  return bffRequest<DentalChartFinding>(
    ROUTES.chartFinding(visitUuid, encounterUuid, findingUuid),
    { method: "PATCH", body: payload },
  );
}

export async function deleteDentalFinding(
  visitUuid: string,
  encounterUuid: string,
  findingUuid: string,
) {
  await bffRequest<void>(ROUTES.chartFinding(visitUuid, encounterUuid, findingUuid), {
    method: "DELETE",
  });
}

export function fetchDentalToothHistory(
  visitUuid: string,
  encounterUuid: string,
  toothNumber: number,
) {
  return bffRequest<DentalToothHistory>(
    ROUTES.toothHistory(visitUuid, encounterUuid, toothNumber),
  );
}

export function fetchDentalProcedures(visitUuid: string, encounterUuid: string) {
  return bffRequest<DentalProcedure[]>(ROUTES.procedures(visitUuid, encounterUuid));
}

export function performDentalProcedure(
  visitUuid: string,
  encounterUuid: string,
  payload: DentalProcedurePayload,
) {
  return bffRequest<DentalProcedure>(ROUTES.procedures(visitUuid, encounterUuid), {
    method: "POST",
    body: payload,
  });
}

export function updateDentalProcedure(
  visitUuid: string,
  encounterUuid: string,
  procedureUuid: string,
  payload: DentalProcedureUpdatePayload,
) {
  return bffRequest<DentalProcedure>(
    ROUTES.procedure(visitUuid, encounterUuid, procedureUuid),
    { method: "PATCH", body: payload },
  );
}

export async function deleteDentalProcedure(
  visitUuid: string,
  encounterUuid: string,
  procedureUuid: string,
) {
  await bffRequest<void>(
    ROUTES.procedure(visitUuid, encounterUuid, procedureUuid),
    { method: "DELETE" },
  );
}

export function fetchDentalTreatmentPlans(visitUuid: string, encounterUuid: string) {
  return bffRequest<DentalTreatmentPlan[]>(
    ROUTES.treatmentPlans(visitUuid, encounterUuid),
  );
}

export function createDentalTreatmentPlan(
  visitUuid: string,
  encounterUuid: string,
  payload: DentalTreatmentPlanPayload,
) {
  return bffRequest<DentalTreatmentPlan>(
    ROUTES.treatmentPlans(visitUuid, encounterUuid),
    { method: "POST", body: payload },
  );
}

export function updateDentalTreatmentPlan(
  visitUuid: string,
  encounterUuid: string,
  planUuid: string,
  payload: DentalPlanUpdatePayload,
) {
  return bffRequest<DentalTreatmentPlan>(
    ROUTES.treatmentPlan(visitUuid, encounterUuid, planUuid),
    { method: "PATCH", body: payload },
  );
}

export function addDentalPlanItem(
  visitUuid: string,
  encounterUuid: string,
  planUuid: string,
  payload: DentalPlanItemPayload,
) {
  return bffRequest<DentalTreatmentPlanItem>(
    ROUTES.treatmentPlanItems(visitUuid, encounterUuid, planUuid),
    { method: "POST", body: payload },
  );
}

export function updateDentalPlanItem(
  visitUuid: string,
  encounterUuid: string,
  itemUuid: string,
  payload: DentalPlanItemUpdatePayload,
) {
  return bffRequest<DentalTreatmentPlanItem>(
    ROUTES.treatmentPlanItem(visitUuid, encounterUuid, itemUuid),
    { method: "PATCH", body: payload },
  );
}

export function performDentalPlanItem(
  visitUuid: string,
  encounterUuid: string,
  itemUuid: string,
  payload: DentalPerformPayload,
) {
  return bffRequest<DentalProcedure>(
    ROUTES.performPlanItem(visitUuid, encounterUuid, itemUuid),
    { method: "POST", body: payload },
  );
}

export function fetchDentalHistory(visitUuid: string, encounterUuid: string) {
  return bffRequest<DentalHistoryEncounter[]>(
    ROUTES.dentalHistory(visitUuid, encounterUuid),
  );
}

export function fetchDentalHistorySections(
  visitUuid: string,
  encounterUuid: string,
  historyEncounterUuid: string | null,
) {
  const query = historyEncounterUuid
    ? `?history_encounter_uuid=${encodeURIComponent(historyEncounterUuid)}`
    : "";
  return bffRequest<DentalHistorySections>(
    `${ROUTES.historySections(visitUuid, encounterUuid)}${query}`,
  );
}
