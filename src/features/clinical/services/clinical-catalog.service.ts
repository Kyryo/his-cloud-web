import { BFF_CLINICAL_ROUTES } from "@/constants/api";
import type {
  ClinicalClinic,
  ClinicalDepartment,
  ClinicalLocation,
} from "@/features/clinical/types/clinical-catalog.types";
import type { OrganizationListResponse } from "@/features/settings/types/settings.types";
import { bffRequest } from "@/lib/bff-client";

export async function fetchClinicalClinics(): Promise<ClinicalClinic[]> {
  const response = await bffRequest<OrganizationListResponse<ClinicalClinic>>(
    `${BFF_CLINICAL_ROUTES.clinics}?page_size=100&ordering=name`,
  );

  return response.results;
}

export async function fetchClinicalDepartments(
  clinicId?: number,
): Promise<ClinicalDepartment[]> {
  const params = new URLSearchParams({
    page_size: "100",
    ordering: "name",
    is_active: "true",
  });

  if (clinicId) {
    params.set("clinic", String(clinicId));
  }

  const response = await bffRequest<OrganizationListResponse<ClinicalDepartment>>(
    `${BFF_CLINICAL_ROUTES.departments}?${params.toString()}`,
  );

  return response.results;
}

export async function fetchClinicalLocations(
  clinicId?: number,
): Promise<ClinicalLocation[]> {
  const params = new URLSearchParams({
    page_size: "100",
    ordering: "name",
    is_active: "true",
  });

  if (clinicId) {
    params.set("clinic", String(clinicId));
  }

  const response = await bffRequest<OrganizationListResponse<ClinicalLocation>>(
    `${BFF_CLINICAL_ROUTES.locations}?${params.toString()}`,
  );

  return response.results;
}
