/** Django DRF v1 clinical OPD endpoints (relative to HMIS_API_URL, server-only). */
export const CLINICAL_OPD_API_PATHS = {
  queue: "/clinical/opd/queue/",
  observationDefinitions: "/clinical/observation-definitions/",
  roleCapabilities: "/clinical/role-capabilities/",
  myCapabilities: "/clinical/my-capabilities/",
  encounterObservations: (visitUuid: string, encounterUuid: string) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/observations/`,
  encounterNursingNotes: (visitUuid: string, encounterUuid: string) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/nursing-notes/`,
  encounterPhysicalExams: (visitUuid: string, encounterUuid: string) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/physical-exams/`,
  encounterPhysicalExam: (
    visitUuid: string,
    encounterUuid: string,
    examUuid: string,
  ) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/physical-exams/${examUuid}/`,
  encounterClinicalNotes: (visitUuid: string, encounterUuid: string) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/clinical-notes/`,
  encounterPrescriptions: (visitUuid: string, encounterUuid: string) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/prescriptions/`,
  finalizePrescription: (
    visitUuid: string,
    encounterUuid: string,
    prescriptionUuid: string,
  ) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/prescriptions/${prescriptionUuid}/finalize/`,
  cancelPrescription: (
    visitUuid: string,
    encounterUuid: string,
    prescriptionUuid: string,
  ) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/prescriptions/${prescriptionUuid}/cancel/`,
  encounterOrders: (visitUuid: string, encounterUuid: string) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/orders/`,
  cancelOrder: (
    visitUuid: string,
    encounterUuid: string,
    orderUuid: string,
  ) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/orders/${orderUuid}/cancel/`,
  encounterTimeline: (visitUuid: string, encounterUuid: string) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/timeline/`,
  encounterHistorySummary: (visitUuid: string, encounterUuid: string) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/history-summary/`,
  encounterClinicalHistory: (visitUuid: string, encounterUuid: string) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/clinical-history/`,
} as const;
