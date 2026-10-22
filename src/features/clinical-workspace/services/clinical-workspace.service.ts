import { BFF_CLINICAL_WORKSPACE_ROUTES } from "@/constants/clinical-workspace-api";
import type { OpdQueueEncounter } from "@/features/clinical-opd/types/clinical-opd.types";
import type { ClinicalSpecialtyCode } from "@/features/clinical-workspace/constants/clinical-specialties";
import type {
  ClinicalMemberDepartment,
  ClinicalSpecialtyCatalog,
} from "@/features/clinical-workspace/types/clinical-workspace.types";
import { bffRequest } from "@/lib/bff-client";

type ListResponse<T> = {
  results: T[];
};

export type DepartmentQueueFilters = {
  search?: string;
  queueStage?: string;
  status?: string;
  limit?: number;
};

export type SpecialtyQueueFilters = DepartmentQueueFilters & {
  departmentUuid?: string | null;
};

function queueQuery(filters: SpecialtyQueueFilters): string {
  const searchParams = new URLSearchParams();
  if (filters.departmentUuid) {
    searchParams.set("department_uuid", filters.departmentUuid);
  }
  if (filters.search) searchParams.set("search", filters.search);
  if (filters.queueStage) searchParams.set("queue_stage", filters.queueStage);
  if (filters.status) searchParams.set("status", filters.status);
  if (filters.limit) searchParams.set("limit", String(filters.limit));
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

/** Queue across the user's departments of a specialty, or one of them. */
export async function fetchSpecialtyQueue(
  specialty: ClinicalSpecialtyCode,
  filters: SpecialtyQueueFilters = {},
) {
  const response = await bffRequest<ListResponse<OpdQueueEncounter>>(
    `${BFF_CLINICAL_WORKSPACE_ROUTES.specialtyQueue(specialty)}${queueQuery(filters)}`,
  );
  return response.results;
}

export async function fetchClinicalSpecialties() {
  return bffRequest<ClinicalSpecialtyCatalog>(
    BFF_CLINICAL_WORKSPACE_ROUTES.specialties,
  );
}

export async function fetchMemberDepartments(specialty?: ClinicalSpecialtyCode) {
  const query = specialty ? `?specialty=${encodeURIComponent(specialty)}` : "";
  const response = await bffRequest<ListResponse<ClinicalMemberDepartment>>(
    `${BFF_CLINICAL_WORKSPACE_ROUTES.memberDepartments}${query}`,
  );
  return response.results;
}

export async function fetchDepartmentQueue(
  departmentUuid: string,
  filters: DepartmentQueueFilters = {},
) {
  const response = await bffRequest<ListResponse<OpdQueueEncounter>>(
    `${BFF_CLINICAL_WORKSPACE_ROUTES.departmentQueue(departmentUuid)}${queueQuery(filters)}`,
  );
  return response.results;
}
