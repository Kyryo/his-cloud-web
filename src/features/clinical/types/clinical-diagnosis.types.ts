export type EncounterDiagnosis = {
  uuid: string;
  encounter_uuid: string;
  visit_uuid: string;
  code: string;
  standard: string;
  description: string;
  status: string;
  source: string;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type DiagnosisCatalogItem = {
  code: string;
  description: string;
  standard?: string;
};

export type CreateEncounterDiagnosisPayload = {
  code: string;
  description?: string;
  standard?: string;
  status?: string;
  source?: string;
  is_primary?: boolean;
};

export type UpdateEncounterDiagnosisPayload = {
  code?: string;
  description?: string;
  standard?: string;
  status?: string;
  source?: string;
  is_primary?: boolean;
};

export type DiagnosisCatalogSearchResponse = {
  results: DiagnosisCatalogItem[];
};

export type EncounterDiagnosisListResponse = {
  results: EncounterDiagnosis[];
};
