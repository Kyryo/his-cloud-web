/** Django DRF v1 tenant email configuration endpoints (relative to HMIS_API_URL, server-only). */
export const EMAIL_CONFIGURATION_API_PATHS = {
  list: "/tenant-email-configurations/",
  detail: (id: number | string) => `/tenant-email-configurations/${id}/`,
  appointmentEmails: (id: number | string) =>
    `/tenant-email-configurations/${id}/appointment-emails/`,
} as const;
