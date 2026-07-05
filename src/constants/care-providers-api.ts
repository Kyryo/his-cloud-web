/** Server-only Django DRF paths for care providers. */
export const CARE_PROVIDERS_API_PATHS = {
  list: "/care-providers/",
  detail: (uuid: string) => `/care-providers/${uuid}/`,
} as const;
