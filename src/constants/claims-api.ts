/** Django DRF v1 e-claims endpoints (relative to HMIS_API_URL, server-only). */
export const CLAIMS_API_PATHS = {
  list: "/eclaims/",
  summaryStats: "/eclaims/summary-stats/",
  detail: (claimId: number | string) => `/eclaims/${claimId}/`,
  fromInvoice: (invoiceId: number | string) => `/eclaims/from-invoice/${invoiceId}/`,
  byInvoice: (invoiceId: number | string) => `/eclaims/by-invoice/${invoiceId}/`,
  verifyMember: "/eclaims/verify-member/",
  submit: (claimId: number | string) => `/eclaims/${claimId}/submit/`,
  changeStatus: (claimId: number | string) =>
    `/eclaims/${claimId}/change-status/`,
  checkPayerStatus: (claimId: number | string) =>
    `/eclaims/${claimId}/payer-status/check/`,
  diagnoses: (claimId: number | string) => `/eclaims/${claimId}/diagnoses/`,
  lineItemDental: (claimId: number | string, lineItemId: number | string) =>
    `/eclaims/${claimId}/line-items/${lineItemId}/dental/`,
  lineItemPaymentSplit: (claimId: number | string, lineItemId: number | string) =>
    `/eclaims/${claimId}/line-items/${lineItemId}/payment-split/`,
  advisorEvaluate: (claimId: number | string) =>
    `/eclaims/${claimId}/advisor/evaluate/`,
  advisorStatus: (claimId: number | string) =>
    `/eclaims/${claimId}/advisor/status/`,
  advisorEvaluations: (claimId: number | string) =>
    `/eclaims/${claimId}/advisor/evaluations/`,
  advisorOverride: (claimId: number | string) =>
    `/eclaims/${claimId}/advisor/override/`,
  advisorClearances: (claimId: number | string) =>
    `/eclaims/${claimId}/advisor/clearances/`,
  advisorFindingsApply: (claimId: number | string) =>
    `/eclaims/${claimId}/advisor/findings/apply/`,
  practitionerMappings: "/eclaims/practitioner-mappings/",
  practitionerMappingDetail: (uuid: string) => `/eclaims/practitioner-mappings/${uuid}/`,
  practitionerMappingsUpsert: "/eclaims/practitioner-mappings/upsert/",
  masmIntegration: "/eclaims/integrations/payers/masm/",
  clinicPayerIntegration: (payer: string, clinicId: number | string) =>
    `/eclaims/integrations/payers/${payer}/clinics/${clinicId}/`,
  clinicPortalCredentials: (payer: string, clinicId: number | string) =>
    `/eclaims/integrations/payers/${payer}/clinics/${clinicId}/portal-credentials/`,
  tariffCategories: "/claims-rules/tariff-categories/",
  validationPacks: "/claims-rules/packs/",
  pricelistConfig: (pricelistUuid: string) =>
    `/claims-rules/pricelist-configs/${pricelistUuid}/`,
  remittances: "/eclaims/remittances/",
  remittanceSummaryStats: "/eclaims/remittances/summary-stats/",
  remittanceDetail: (batchId: number | string) =>
    `/eclaims/remittances/${batchId}/`,
  remittanceRename: (batchId: number | string) =>
    `/eclaims/remittances/${batchId}/rename/`,
  remittanceRematch: (batchId: number | string) =>
    `/eclaims/remittances/${batchId}/rematch/`,
  remittanceRows: (batchId: number | string) =>
    `/eclaims/remittances/${batchId}/rows/`,
  remittanceRowsSummaryStats: (batchId: number | string) =>
    `/eclaims/remittances/${batchId}/rows/summary-stats/`,
  remittanceRowMatch: (batchId: number | string, rowId: number | string) =>
    `/eclaims/remittances/${batchId}/rows/${rowId}/match/`,
  remittanceRowApply: (batchId: number | string, rowId: number | string) =>
    `/eclaims/remittances/${batchId}/rows/${rowId}/apply/`,
  remittanceRowReject: (batchId: number | string, rowId: number | string) =>
    `/eclaims/remittances/${batchId}/rows/${rowId}/reject/`,
  remittanceRejections: "/eclaims/remittances/rejections/",
  remittanceRejectionsSummaryStats: "/eclaims/remittances/rejections/summary-stats/",
} as const;
