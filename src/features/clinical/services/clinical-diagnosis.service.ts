import { BFF_CLINICAL_DIAGNOSIS_ROUTES } from "@/constants/api";
import type {
  CreateEncounterDiagnosisPayload,
  DiagnosisCatalogSearchResponse,
  EncounterDiagnosis,
  EncounterDiagnosisListResponse,
  UpdateEncounterDiagnosisPayload,
} from "@/features/clinical/types/clinical-diagnosis.types";
import { bffRequest } from "@/lib/bff-client";

export async function fetchEncounterDiagnoses(
  visitUuid: string,
  encounterUuid: string,
): Promise<EncounterDiagnosis[]> {
  const data = await bffRequest<EncounterDiagnosisListResponse>(
    BFF_CLINICAL_DIAGNOSIS_ROUTES.encounterDiagnoses(visitUuid, encounterUuid),
  );
  return data.results;
}

export async function createEncounterDiagnosis(
  visitUuid: string,
  encounterUuid: string,
  payload: CreateEncounterDiagnosisPayload,
): Promise<EncounterDiagnosis> {
  const data = await bffRequest<{ diagnosis: EncounterDiagnosis }>(
    BFF_CLINICAL_DIAGNOSIS_ROUTES.encounterDiagnoses(visitUuid, encounterUuid),
    {
      method: "POST",
      body: {
        ...payload,
        source_platform: payload.source_platform ?? "CLINICAL",
      },
    },
  );
  return data.diagnosis;
}

export async function updateEncounterDiagnosis(
  diagnosisUuid: string,
  payload: UpdateEncounterDiagnosisPayload,
): Promise<EncounterDiagnosis> {
  const data = await bffRequest<{ diagnosis: EncounterDiagnosis }>(
    BFF_CLINICAL_DIAGNOSIS_ROUTES.diagnosisDetail(diagnosisUuid),
    {
      method: "PATCH",
      body: payload,
    },
  );
  return data.diagnosis;
}

export async function deleteEncounterDiagnosis(diagnosisUuid: string): Promise<void> {
  await bffRequest<void>(BFF_CLINICAL_DIAGNOSIS_ROUTES.diagnosisDetail(diagnosisUuid), {
    method: "DELETE",
  });
}

export async function searchDiagnosisCatalog(
  query: string,
  standard = "ICD10",
): Promise<DiagnosisCatalogSearchResponse> {
  const params = new URLSearchParams({ q: query });
  if (standard) {
    params.set("standard", standard);
  }

  return bffRequest<DiagnosisCatalogSearchResponse>(
    `${BFF_CLINICAL_DIAGNOSIS_ROUTES.diagnosisCatalogSearch}?${params.toString()}`,
  );
}
