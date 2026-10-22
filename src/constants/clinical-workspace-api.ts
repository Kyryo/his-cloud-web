/** Django DRF v1 specialty and department-queue endpoints (server-only). */
export const CLINICAL_WORKSPACE_API_PATHS = {
  specialties: "/clinical/specialties/",
  specialtyQueue: (specialtyCode: string) =>
    `/clinical/specialties/${specialtyCode}/queue/`,
  memberDepartments: "/clinical/departments/",
  departmentQueue: (departmentUuid: string) =>
    `/clinical/departments/${departmentUuid}/queue/`,
} as const;

/** Browser-facing BFF specialty and department-queue routes (same origin). */
export const BFF_CLINICAL_WORKSPACE_ROUTES = {
  specialties: "/api/clinical/specialties",
  specialtyQueue: (specialtyCode: string) =>
    `/api/clinical/specialties/${specialtyCode}/queue`,
  memberDepartments: "/api/clinical/my-departments",
  departmentQueue: (departmentUuid: string) =>
    `/api/clinical/my-departments/${departmentUuid}/queue`,
} as const;
