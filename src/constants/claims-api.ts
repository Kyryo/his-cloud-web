/** Django DRF v1 e-claims endpoints (relative to HMIS_API_URL, server-only). */
export const CLAIMS_API_PATHS = {
  list: "/eclaims/",
  detail: (claimId: number | string) => `/eclaims/${claimId}/`,
  fromInvoice: (invoiceId: number | string) => `/eclaims/from-invoice/${invoiceId}/`,
  byInvoice: (invoiceId: number | string) => `/eclaims/by-invoice/${invoiceId}/`,
  verifyMember: "/eclaims/verify-member/",
  submit: (claimId: number | string) => `/eclaims/${claimId}/submit/`,
  diagnoses: (claimId: number | string) => `/eclaims/${claimId}/diagnoses/`,
  lineItemDental: (claimId: number | string, lineItemId: number | string) =>
    `/eclaims/${claimId}/line-items/${lineItemId}/dental/`,
  advisorEvaluate: (claimId: number | string) =>
    `/eclaims/${claimId}/advisor/evaluate/`,
  advisorEvaluations: (claimId: number | string) =>
    `/eclaims/${claimId}/advisor/evaluations/`,
  advisorOverride: (claimId: number | string) =>
    `/eclaims/${claimId}/advisor/override/`,
  practitionerMappings: "/eclaims/practitioner-mappings/",
  practitionerMappingDetail: (uuid: string) => `/eclaims/practitioner-mappings/${uuid}/`,
  practitionerMappingsUpsert: "/eclaims/practitioner-mappings/upsert/",
  masmIntegration: "/eclaims/integrations/payers/masm/",
  clinicPayerIntegration: (payer: string, clinicId: number | string) =>
    `/eclaims/integrations/payers/${payer}/clinics/${clinicId}/`,
  clinicPortalCredentials: (payer: string, clinicId: number | string) =>
    `/eclaims/integrations/payers/${payer}/clinics/${clinicId}/portal-credentials/`,
  tariffCategories: "/claims-rules/tariff-categories/",
} as const;
