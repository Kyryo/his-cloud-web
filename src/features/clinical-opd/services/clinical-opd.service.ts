import { BFF_CLINICAL_OPD_ROUTES } from "@/constants/api";
import type {
  ClinicalRoleCapability,
  ClinicalTimelineEvent,
  ClinicalVisitHistory,
  EncounterClinicalNote,
  EncounterClinicalOrder,
  EncounterNursingNote,
  EncounterObservation,
  EncounterPhysicalExam,
  EncounterPrescription,
  MyClinicalCapabilities,
  ObservationDefinition,
  OpdQueueEncounter,
} from "@/features/clinical-opd/types/clinical-opd.types";
import { bffRequest } from "@/lib/bff-client";

type ListResponse<T> = {
  results: T[];
};

export async function fetchOpdQueue(params?: {
  status?: string;
  clinicUuid?: string;
  search?: string;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.clinicUuid) searchParams.set("clinic_uuid", params.clinicUuid);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  const response = await bffRequest<ListResponse<OpdQueueEncounter>>(
    `${BFF_CLINICAL_OPD_ROUTES.queue}${query ? `?${query}` : ""}`,
  );
  return response.results;
}

export async function fetchObservationDefinitions() {
  return bffRequest<ObservationDefinition[]>(
    BFF_CLINICAL_OPD_ROUTES.observationDefinitions,
  );
}

export async function fetchEncounterObservations(
  visitUuid: string,
  encounterUuid: string,
) {
  const response = await bffRequest<ListResponse<EncounterObservation>>(
    BFF_CLINICAL_OPD_ROUTES.encounterObservations(visitUuid, encounterUuid),
  );
  return response.results;
}

export async function createEncounterObservation(
  visitUuid: string,
  encounterUuid: string,
  payload: Record<string, unknown>,
) {
  return bffRequest<EncounterObservation>(
    BFF_CLINICAL_OPD_ROUTES.encounterObservations(visitUuid, encounterUuid),
    { method: "POST", body: payload },
  );
}

export async function fetchNursingNotes(visitUuid: string, encounterUuid: string) {
  const response = await bffRequest<ListResponse<EncounterNursingNote>>(
    BFF_CLINICAL_OPD_ROUTES.encounterNursingNotes(visitUuid, encounterUuid),
  );
  return response.results;
}

export async function createNursingNote(
  visitUuid: string,
  encounterUuid: string,
  payload: { body: string },
) {
  return bffRequest<EncounterNursingNote>(
    BFF_CLINICAL_OPD_ROUTES.encounterNursingNotes(visitUuid, encounterUuid),
    { method: "POST", body: payload },
  );
}

export async function fetchPhysicalExams(visitUuid: string, encounterUuid: string) {
  const response = await bffRequest<ListResponse<EncounterPhysicalExam>>(
    BFF_CLINICAL_OPD_ROUTES.encounterPhysicalExams(visitUuid, encounterUuid),
  );
  return response.results;
}

export async function createPhysicalExam(
  visitUuid: string,
  encounterUuid: string,
  payload: Record<string, unknown>,
) {
  return bffRequest<EncounterPhysicalExam>(
    BFF_CLINICAL_OPD_ROUTES.encounterPhysicalExams(visitUuid, encounterUuid),
    { method: "POST", body: payload },
  );
}

export async function updatePhysicalExam(
  visitUuid: string,
  encounterUuid: string,
  examUuid: string,
  payload: Record<string, unknown>,
) {
  return bffRequest<EncounterPhysicalExam>(
    BFF_CLINICAL_OPD_ROUTES.encounterPhysicalExam(
      visitUuid,
      encounterUuid,
      examUuid,
    ),
    { method: "PATCH", body: payload },
  );
}

export async function fetchClinicalNotes(visitUuid: string, encounterUuid: string) {
  const response = await bffRequest<ListResponse<EncounterClinicalNote>>(
    BFF_CLINICAL_OPD_ROUTES.encounterClinicalNotes(visitUuid, encounterUuid),
  );
  return response.results;
}

export async function createClinicalNote(
  visitUuid: string,
  encounterUuid: string,
  payload: { body: string },
) {
  return bffRequest<EncounterClinicalNote>(
    BFF_CLINICAL_OPD_ROUTES.encounterClinicalNotes(visitUuid, encounterUuid),
    { method: "POST", body: payload },
  );
}

export async function fetchPrescriptions(visitUuid: string, encounterUuid: string) {
  const response = await bffRequest<ListResponse<EncounterPrescription>>(
    BFF_CLINICAL_OPD_ROUTES.encounterPrescriptions(visitUuid, encounterUuid),
  );
  return response.results;
}

export async function createPrescription(
  visitUuid: string,
  encounterUuid: string,
  payload: Record<string, unknown>,
) {
  return bffRequest<EncounterPrescription>(
    BFF_CLINICAL_OPD_ROUTES.encounterPrescriptions(visitUuid, encounterUuid),
    { method: "POST", body: payload },
  );
}

export async function finalizePrescription(
  visitUuid: string,
  encounterUuid: string,
  prescriptionUuid: string,
) {
  return bffRequest<EncounterPrescription>(
    BFF_CLINICAL_OPD_ROUTES.finalizePrescription(
      visitUuid,
      encounterUuid,
      prescriptionUuid,
    ),
    { method: "POST", body: {} },
  );
}

export async function cancelPrescription(
  visitUuid: string,
  encounterUuid: string,
  prescriptionUuid: string,
) {
  return bffRequest<EncounterPrescription>(
    BFF_CLINICAL_OPD_ROUTES.cancelPrescription(
      visitUuid,
      encounterUuid,
      prescriptionUuid,
    ),
    { method: "POST", body: {} },
  );
}

export async function fetchOrders(visitUuid: string, encounterUuid: string) {
  const response = await bffRequest<ListResponse<EncounterClinicalOrder>>(
    BFF_CLINICAL_OPD_ROUTES.encounterOrders(visitUuid, encounterUuid),
  );
  return response.results;
}

export async function createOrder(
  visitUuid: string,
  encounterUuid: string,
  payload: Record<string, unknown>,
) {
  return bffRequest<EncounterClinicalOrder>(
    BFF_CLINICAL_OPD_ROUTES.encounterOrders(visitUuid, encounterUuid),
    { method: "POST", body: payload },
  );
}

export async function cancelOrder(
  visitUuid: string,
  encounterUuid: string,
  orderUuid: string,
) {
  return bffRequest<EncounterClinicalOrder>(
    BFF_CLINICAL_OPD_ROUTES.cancelOrder(visitUuid, encounterUuid, orderUuid),
    { method: "POST", body: {} },
  );
}

export async function fetchEncounterTimeline(
  visitUuid: string,
  encounterUuid: string,
) {
  return bffRequest<ClinicalTimelineEvent[]>(
    BFF_CLINICAL_OPD_ROUTES.encounterTimeline(visitUuid, encounterUuid),
  );
}

export async function fetchEncounterClinicalHistory(
  visitUuid: string,
  encounterUuid: string,
  historyEncounterUuid?: string | null,
) {
  const query = historyEncounterUuid
    ? `?history_encounter_uuid=${encodeURIComponent(historyEncounterUuid)}`
    : "";
  return bffRequest<ClinicalVisitHistory>(
    `${BFF_CLINICAL_OPD_ROUTES.encounterClinicalHistory(visitUuid, encounterUuid)}${query}`,
  );
}

export async function fetchRoleCapabilities() {
  return bffRequest<ClinicalRoleCapability[]>(
    BFF_CLINICAL_OPD_ROUTES.roleCapabilities,
  );
}

export async function fetchMyClinicalCapabilities() {
  return bffRequest<MyClinicalCapabilities>(
    BFF_CLINICAL_OPD_ROUTES.myCapabilities,
  );
}

export async function updateRoleCapabilities(
  payload: Array<{ user_role: string; capability: string; enabled: boolean }>,
) {
  return bffRequest<ClinicalRoleCapability[]>(
    BFF_CLINICAL_OPD_ROUTES.roleCapabilities,
    { method: "PATCH", body: payload },
  );
}
