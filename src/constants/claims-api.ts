/** Django DRF v1 e-claims endpoints (relative to HMIS_API_URL, server-only). */
export const CLAIMS_API_PATHS = {
  list: "/eclaims/",
  detail: (claimId: number | string) => `/eclaims/${claimId}/`,
  fromInvoice: (invoiceId: number | string) => `/eclaims/from-invoice/${invoiceId}/`,
  byInvoice: (invoiceId: number | string) => `/eclaims/by-invoice/${invoiceId}/`,
  verifyMember: "/eclaims/verify-member/",
  submit: (claimId: number | string) => `/eclaims/${claimId}/submit/`,
  practitionerMappings: "/eclaims/practitioner-mappings/",
  practitionerMappingDetail: (uuid: string) => `/eclaims/practitioner-mappings/${uuid}/`,
  practitionerMappingsUpsert: "/eclaims/practitioner-mappings/upsert/",
  masmIntegration: "/eclaims/integrations/payers/masm/",
} as const;
