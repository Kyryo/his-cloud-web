/** Django DRF v1 appointment endpoints (relative to HMIS_API_URL, server-only). */
export const APPOINTMENTS_API_PATHS = {
  list: "/appointments/",
  detail: (uuid: string) => `/appointments/${uuid}/`,
  confirm: (uuid: string) => `/appointments/${uuid}/confirm/`,
  cancel: (uuid: string) => `/appointments/${uuid}/cancel/`,
  noShow: (uuid: string) => `/appointments/${uuid}/no-show/`,
  start: (uuid: string) => `/appointments/${uuid}/start/`,
} as const;
