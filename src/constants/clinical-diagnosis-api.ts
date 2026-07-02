/** Django DRF v1 clinical diagnosis endpoints (relative to HMIS_API_URL, server-only). */
export const CLINICAL_DIAGNOSIS_API_PATHS = {
  encounterDiagnoses: (visitUuid: string, encounterUuid: string) =>
    `/clinical/visits/${visitUuid}/encounters/${encounterUuid}/diagnoses/`,
  diagnosisDetail: (diagnosisUuid: string) => `/clinical/diagnoses/${diagnosisUuid}/`,
  diagnosisCatalogSearch: "/clinical/diagnosis-catalog/search/",
} as const;
