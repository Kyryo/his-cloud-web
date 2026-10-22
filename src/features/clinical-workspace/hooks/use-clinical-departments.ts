import { useQuery } from "@tanstack/react-query";

import type { ClinicalSpecialtyCode } from "@/features/clinical-workspace/constants/clinical-specialties";
import {
  fetchClinicalSpecialties,
  fetchDepartmentQueue,
  fetchMemberDepartments,
  fetchSpecialtyQueue,
  type DepartmentQueueFilters,
  type SpecialtyQueueFilters,
} from "@/features/clinical-workspace/services/clinical-workspace.service";

/** Root key of every department-queue query, for invalidation. */
export const CLINICAL_QUEUE_QUERY_ROOT = "clinical-department-queue";

export function useClinicalSpecialties() {
  return useQuery({
    queryKey: ["clinical-specialties"],
    queryFn: fetchClinicalSpecialties,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMemberDepartments(specialty: ClinicalSpecialtyCode) {
  return useQuery({
    queryKey: ["clinical-member-departments", specialty],
    queryFn: () => fetchMemberDepartments(specialty),
  });
}

export function useSpecialtyQueue(
  specialty: ClinicalSpecialtyCode,
  filters: SpecialtyQueueFilters = {},
  enabled = true,
) {
  return useQuery({
    queryKey: [
      CLINICAL_QUEUE_QUERY_ROOT,
      specialty,
      filters.departmentUuid ?? "all",
      filters.search ?? "",
      filters.queueStage ?? "all",
      filters.status ?? "all",
    ],
    queryFn: () => fetchSpecialtyQueue(specialty, filters),
    enabled,
  });
}

export function useDepartmentQueue(
  departmentUuid: string | null,
  filters: DepartmentQueueFilters = {},
) {
  return useQuery({
    queryKey: [
      CLINICAL_QUEUE_QUERY_ROOT,
      departmentUuid,
      filters.search ?? "",
      filters.queueStage ?? "all",
      filters.status ?? "all",
    ],
    queryFn: () => fetchDepartmentQueue(departmentUuid ?? "", filters),
    enabled: Boolean(departmentUuid),
  });
}
