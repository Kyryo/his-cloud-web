/** Django DRF v1 clinical OPD endpoints (relative to HMIS_API_URL, server-only). */
export const CLINICAL_OPD_API_PATHS = {
  queue: "/clinical/opd/queue/",
  observationDefinitions: "/clinical/observation-definitions/",
  roleCapabilities: "/clinical/role-capabilities/",
  myCapabilities: "/clinical/my-capabilities/",
  encounterObservations: (visitUuid: string, encounterUuid: string) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/observations/`,
  encounterObservation: (
    visitUuid: string,
    encounterUuid: string,
    observationUuid: string,
  ) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/observations/${observationUuid}/`,
  encounterNursingNotes: (visitUuid: string, encounterUuid: string) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/nursing-notes/`,
  amendNursingNote: (
    visitUuid: string,
    encounterUuid: string,
    noteUuid: string,
  ) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/nursing-notes/${noteUuid}/amend/`,
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
  amendClinicalNote: (
    visitUuid: string,
    encounterUuid: string,
    noteUuid: string,
  ) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/clinical-notes/${noteUuid}/amend/`,
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
  encounterLabResults: (visitUuid: string, encounterUuid: string) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/lab-results/`,
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
  encounterChartSummary: (visitUuid: string, encounterUuid: string) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/chart-summary/`,
  encounterAllergies: (visitUuid: string, encounterUuid: string) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/allergies/`,
  encounterAllergy: (
    visitUuid: string,
    encounterUuid: string,
    allergyUuid: string,
  ) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/allergies/${allergyUuid}/`,
  encounterChiefComplaints: (visitUuid: string, encounterUuid: string) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/chief-complaints/`,
  encounterChiefComplaintSuggestions: (
    visitUuid: string,
    encounterUuid: string,
  ) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/chief-complaints/suggestions/`,
  encounterChiefComplaintHistory: (visitUuid: string, encounterUuid: string) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/chief-complaints/history/`,
  encounterChiefComplaint: (
    visitUuid: string,
    encounterUuid: string,
    complaintUuid: string,
  ) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/chief-complaints/${complaintUuid}/`,
  encounterChiefComplaintHpi: (
    visitUuid: string,
    encounterUuid: string,
    complaintUuid: string,
  ) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/chief-complaints/${complaintUuid}/hpi/`,
  encounterHpiHistory: (visitUuid: string, encounterUuid: string) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/hpi/history/`,
  encounterProblemList: (visitUuid: string, encounterUuid: string) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/problem-list/`,
  encounterProblem: (
    visitUuid: string,
    encounterUuid: string,
    problemUuid: string,
  ) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/problem-list/${problemUuid}/`,
  encounterCurrentMedications: (visitUuid: string, encounterUuid: string) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/current-medications/`,
  encounterCurrentMedication: (
    visitUuid: string,
    encounterUuid: string,
    medicationUuid: string,
  ) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/current-medications/${medicationUuid}/`,
  encounterDisposition: (visitUuid: string, encounterUuid: string) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/disposition/`,
} as const;
