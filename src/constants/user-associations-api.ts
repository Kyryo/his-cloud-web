/** Django DRF v1 user association endpoints (relative to HMIS_API_URL, server-only). */
export const USER_ASSOCIATIONS_API_PATHS = {
  userClinics: "/user-clinics/",
  userClinicDetail: (id: number) => `/user-clinics/${id}/`,
  userClinicSetPrimary: (id: number) => `/user-clinics/${id}/set_primary/`,
  userLocations: "/user-locations/",
  userLocationDetail: (id: number) => `/user-locations/${id}/`,
  userLocationSetPrimary: (id: number) => `/user-locations/${id}/set_primary/`,
  userDepartments: (userId: number) => `/users/${userId}/departments/`,
  userDepartmentDetail: (userId: number, departmentUuid: string) =>
    `/users/${userId}/departments/${departmentUuid}/`,
} as const;
