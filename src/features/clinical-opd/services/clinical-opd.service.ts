import { BFF_CLINICAL_OPD_ROUTES } from "@/constants/api";
import type {
  ChiefComplaint,
  ChiefComplaintSuggestion,
  ClinicalAllergy,
  ClinicalRoleCapability,
  ClinicalTimelineEvent,
  ClinicalVisitHistory,
  CurrentMedication,
  EncounterClinicalNote,
  EncounterClinicalOrder,
  EncounterDisposition,
  EncounterHistorySummary,
  EncounterLabResult,
  EncounterNursingNote,
  EncounterObservation,
  EncounterPhysicalExam,
  EncounterPrescription,
  HistoryOfPresentIllness,
  MyClinicalCapabilities,
  ObservationDefinition,
  OpdChartSummary,
  OpdQueueEncounter,
  ProblemListItem,
} from "@/features/clinical-opd/types/clinical-opd.types";
import { BffError, bffRequest } from "@/lib/bff-client";

type ListResponse<T> = {
  results: T[];
};

export async function fetchOpdQueue(params?: {
  queueStage?: string;
  status?: string;
  clinicUuid?: string;
  search?: string;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.queueStage) searchParams.set("queue_stage", params.queueStage);
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

export async function updateEncounterObservation(
  visitUuid: string,
  encounterUuid: string,
  observationUuid: string,
  payload: Record<string, unknown>,
) {
  return bffRequest<EncounterObservation>(
    BFF_CLINICAL_OPD_ROUTES.encounterObservation(
      visitUuid,
      encounterUuid,
      observationUuid,
    ),
    { method: "PATCH", body: payload },
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

export async function deletePhysicalExam(
  visitUuid: string,
  encounterUuid: string,
  examUuid: string,
) {
  return bffRequest<void>(
    BFF_CLINICAL_OPD_ROUTES.encounterPhysicalExam(
      visitUuid,
      encounterUuid,
      examUuid,
    ),
    { method: "DELETE" },
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

export async function fetchEncounterLabResults(
  visitUuid: string,
  encounterUuid: string,
) {
  const response = await bffRequest<ListResponse<EncounterLabResult>>(
    BFF_CLINICAL_OPD_ROUTES.encounterLabResults(visitUuid, encounterUuid),
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

export async function fetchEncounterChartSummary(
  visitUuid: string,
  encounterUuid: string,
) {
  return bffRequest<OpdChartSummary>(
    BFF_CLINICAL_OPD_ROUTES.encounterChartSummary(visitUuid, encounterUuid),
  );
}

export async function fetchEncounterHistorySummary(
  visitUuid: string,
  encounterUuid: string,
) {
  return bffRequest<EncounterHistorySummary>(
    BFF_CLINICAL_OPD_ROUTES.encounterHistorySummary(visitUuid, encounterUuid),
  );
}

export async function amendNursingNote(
  visitUuid: string,
  encounterUuid: string,
  noteUuid: string,
  payload: { body: string; amendment_reason: string },
) {
  return bffRequest<EncounterNursingNote>(
    BFF_CLINICAL_OPD_ROUTES.amendNursingNote(visitUuid, encounterUuid, noteUuid),
    { method: "POST", body: payload },
  );
}

export async function amendClinicalNote(
  visitUuid: string,
  encounterUuid: string,
  noteUuid: string,
  payload: { body: string; amendment_reason: string },
) {
  return bffRequest<EncounterClinicalNote>(
    BFF_CLINICAL_OPD_ROUTES.amendClinicalNote(
      visitUuid,
      encounterUuid,
      noteUuid,
    ),
    { method: "POST", body: payload },
  );
}

export async function fetchEncounterAllergies(
  visitUuid: string,
  encounterUuid: string,
) {
  const response = await bffRequest<ListResponse<ClinicalAllergy>>(
    BFF_CLINICAL_OPD_ROUTES.encounterAllergies(visitUuid, encounterUuid),
  );
  return response.results;
}

export async function createEncounterAllergy(
  visitUuid: string,
  encounterUuid: string,
  payload: Record<string, unknown>,
) {
  return bffRequest<ClinicalAllergy>(
    BFF_CLINICAL_OPD_ROUTES.encounterAllergies(visitUuid, encounterUuid),
    { method: "POST", body: payload },
  );
}

export async function updateEncounterAllergy(
  visitUuid: string,
  encounterUuid: string,
  allergyUuid: string,
  payload: Record<string, unknown>,
) {
  return bffRequest<ClinicalAllergy>(
    BFF_CLINICAL_OPD_ROUTES.encounterAllergy(
      visitUuid,
      encounterUuid,
      allergyUuid,
    ),
    { method: "PATCH", body: payload },
  );
}

export async function fetchChiefComplaints(
  visitUuid: string,
  encounterUuid: string,
) {
  const response = await bffRequest<ListResponse<ChiefComplaint>>(
    BFF_CLINICAL_OPD_ROUTES.encounterChiefComplaints(visitUuid, encounterUuid),
  );
  return response.results;
}

export async function createChiefComplaint(
  visitUuid: string,
  encounterUuid: string,
  payload: { text: string },
) {
  return bffRequest<ChiefComplaint>(
    BFF_CLINICAL_OPD_ROUTES.encounterChiefComplaints(visitUuid, encounterUuid),
    { method: "POST", body: payload },
  );
}

export async function updateChiefComplaint(
  visitUuid: string,
  encounterUuid: string,
  complaintUuid: string,
  payload: { text: string },
) {
  return bffRequest<ChiefComplaint>(
    BFF_CLINICAL_OPD_ROUTES.encounterChiefComplaint(
      visitUuid,
      encounterUuid,
      complaintUuid,
    ),
    { method: "PATCH", body: payload },
  );
}

export async function deleteChiefComplaint(
  visitUuid: string,
  encounterUuid: string,
  complaintUuid: string,
) {
  return bffRequest<void>(
    BFF_CLINICAL_OPD_ROUTES.encounterChiefComplaint(
      visitUuid,
      encounterUuid,
      complaintUuid,
    ),
    { method: "DELETE" },
  );
}

export async function fetchChiefComplaintSuggestions(
  visitUuid: string,
  encounterUuid: string,
) {
  return bffRequest<ChiefComplaintSuggestion[]>(
    BFF_CLINICAL_OPD_ROUTES.encounterChiefComplaintSuggestions(
      visitUuid,
      encounterUuid,
    ),
  );
}

export async function fetchChiefComplaintHpi(
  visitUuid: string,
  encounterUuid: string,
  complaintUuid: string,
) {
  return bffRequest<HistoryOfPresentIllness>(
    BFF_CLINICAL_OPD_ROUTES.encounterChiefComplaintHpi(
      visitUuid,
      encounterUuid,
      complaintUuid,
    ),
  );
}

export async function createChiefComplaintHpi(
  visitUuid: string,
  encounterUuid: string,
  complaintUuid: string,
  payload: { body: string },
) {
  return bffRequest<HistoryOfPresentIllness>(
    BFF_CLINICAL_OPD_ROUTES.encounterChiefComplaintHpi(
      visitUuid,
      encounterUuid,
      complaintUuid,
    ),
    { method: "POST", body: payload },
  );
}

export async function updateChiefComplaintHpi(
  visitUuid: string,
  encounterUuid: string,
  complaintUuid: string,
  payload: { body: string },
) {
  return bffRequest<HistoryOfPresentIllness>(
    BFF_CLINICAL_OPD_ROUTES.encounterChiefComplaintHpi(
      visitUuid,
      encounterUuid,
      complaintUuid,
    ),
    { method: "PATCH", body: payload },
  );
}

export async function deleteChiefComplaintHpi(
  visitUuid: string,
  encounterUuid: string,
  complaintUuid: string,
) {
  return bffRequest<void>(
    BFF_CLINICAL_OPD_ROUTES.encounterChiefComplaintHpi(
      visitUuid,
      encounterUuid,
      complaintUuid,
    ),
    { method: "DELETE" },
  );
}

export async function fetchProblemList(
  visitUuid: string,
  encounterUuid: string,
) {
  const response = await bffRequest<ListResponse<ProblemListItem>>(
    BFF_CLINICAL_OPD_ROUTES.encounterProblemList(visitUuid, encounterUuid),
  );
  return response.results;
}

export async function createProblemListItem(
  visitUuid: string,
  encounterUuid: string,
  payload: Record<string, unknown>,
) {
  return bffRequest<ProblemListItem>(
    BFF_CLINICAL_OPD_ROUTES.encounterProblemList(visitUuid, encounterUuid),
    { method: "POST", body: payload },
  );
}

export async function updateProblemListItem(
  visitUuid: string,
  encounterUuid: string,
  problemUuid: string,
  payload: Record<string, unknown>,
) {
  return bffRequest<ProblemListItem>(
    BFF_CLINICAL_OPD_ROUTES.encounterProblem(
      visitUuid,
      encounterUuid,
      problemUuid,
    ),
    { method: "PATCH", body: payload },
  );
}

export async function fetchCurrentMedications(
  visitUuid: string,
  encounterUuid: string,
) {
  const response = await bffRequest<ListResponse<CurrentMedication>>(
    BFF_CLINICAL_OPD_ROUTES.encounterCurrentMedications(
      visitUuid,
      encounterUuid,
    ),
  );
  return response.results;
}

export async function createCurrentMedication(
  visitUuid: string,
  encounterUuid: string,
  payload: Record<string, unknown>,
) {
  return bffRequest<CurrentMedication>(
    BFF_CLINICAL_OPD_ROUTES.encounterCurrentMedications(
      visitUuid,
      encounterUuid,
    ),
    { method: "POST", body: payload },
  );
}

export async function updateCurrentMedication(
  visitUuid: string,
  encounterUuid: string,
  medicationUuid: string,
  payload: Record<string, unknown>,
) {
  return bffRequest<CurrentMedication>(
    BFF_CLINICAL_OPD_ROUTES.encounterCurrentMedication(
      visitUuid,
      encounterUuid,
      medicationUuid,
    ),
    { method: "PATCH", body: payload },
  );
}

export async function fetchEncounterDisposition(
  visitUuid: string,
  encounterUuid: string,
) {
  try {
    return await bffRequest<EncounterDisposition>(
      BFF_CLINICAL_OPD_ROUTES.encounterDisposition(visitUuid, encounterUuid),
    );
  } catch (error) {
    if (error instanceof BffError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function upsertEncounterDisposition(
  visitUuid: string,
  encounterUuid: string,
  payload: Record<string, unknown>,
) {
  return bffRequest<EncounterDisposition>(
    BFF_CLINICAL_OPD_ROUTES.encounterDisposition(visitUuid, encounterUuid),
    { method: "PUT", body: payload },
  );
}
