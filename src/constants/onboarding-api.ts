/** Django DRF v1 onboarding endpoints (relative to HMIS_API_URL, server-only). */
export const ONBOARDING_API_PATHS = {
  progress: "/onboarding/",
  dismiss: "/onboarding/dismiss/",
  modules: "/onboarding/modules/",
} as const;
