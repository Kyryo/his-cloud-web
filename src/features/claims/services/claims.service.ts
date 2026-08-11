import { BFF_CLAIMS_ROUTES } from "@/constants/api";
import type {
  AdvisorEvaluation,
  ClaimAdvisoryOverride,
  ClaimDetail,
  ClaimListFilters,
  ClaimListResponse,
  CreateClaimFromInvoicePayload,
  EClaimPractitionerMapping,
  EClaimPractitionerMappingListResponse,
  MasmPayerIntegration,
  MasmPortalCredential,
  UpdateClaimPayload,
  UpdateMasmPayerIntegrationPayload,
  UpdateMasmPortalCredentialPayload,
  UpsertEClaimPractitionerMappingPayload,
  VerifyMemberPayload,
  VerifyMemberResponse,
  TariffCategoryListFilters,
  TariffCategoryListResponse,
} from "@/features/claims/types/claims.types";
import { BffError, bffRequest } from "@/lib/bff-client";
import { coerceToOptionalString } from "@/lib/coerce-string";

function buildClaimsQuery(filters: ClaimListFilters = {}): string {
  const params = new URLSearchParams();

  if (filters.page) {
    params.set("page", String(filters.page));
  }
  if (filters.pageSize) {
    params.set("page_size", String(filters.pageSize));
  }
  if (filters.status) {
    params.set("status", filters.status);
  }
  const search = filters.search?.trim() || filters.membershipNumber?.trim();
  if (search) {
    params.set("search", search);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

function buildTariffCategoryQuery(filters: TariffCategoryListFilters = {}): string {
  const params = new URLSearchParams();

  if (filters.page) {
    params.set("page", String(filters.page));
  }
  if (filters.pageSize) {
    params.set("page_size", String(filters.pageSize));
  }
  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchClaims(
  filters: ClaimListFilters = {},
): Promise<ClaimListResponse> {
  return bffRequest<ClaimListResponse>(
    `${BFF_CLAIMS_ROUTES.list}${buildClaimsQuery(filters)}`,
  );
}

export async function fetchClaim(claimId: number | string): Promise<ClaimDetail> {
  return bffRequest<ClaimDetail>(BFF_CLAIMS_ROUTES.detail(claimId));
}

export async function fetchClaimByInvoice(
  invoiceId: number | string,
): Promise<ClaimDetail | null> {
  const data = await bffRequest<{ claim: ClaimDetail | null }>(
    BFF_CLAIMS_ROUTES.byInvoice(invoiceId),
  );
  return data.claim;
}

export async function createClaimFromInvoice(
  invoiceId: number | string,
  payload: CreateClaimFromInvoicePayload = {},
): Promise<ClaimDetail> {
  return bffRequest<ClaimDetail>(BFF_CLAIMS_ROUTES.fromInvoice(invoiceId), {
    method: "POST",
    body: payload,
  });
}

export async function updateClaim(
  claimId: number | string,
  payload: UpdateClaimPayload,
): Promise<ClaimDetail> {
  return bffRequest<ClaimDetail>(BFF_CLAIMS_ROUTES.detail(claimId), {
    method: "PATCH",
    body: payload,
  });
}

export async function deleteClaim(claimId: number | string): Promise<void> {
  await bffRequest<void>(BFF_CLAIMS_ROUTES.detail(claimId), {
    method: "DELETE",
  });
}

export async function verifyClaimMember(
  payload: VerifyMemberPayload,
): Promise<VerifyMemberResponse> {
  return bffRequest<VerifyMemberResponse>(BFF_CLAIMS_ROUTES.verifyMember, {
    method: "POST",
    body: payload,
  });
}

export async function submitClaim(claimId: number | string): Promise<ClaimDetail> {
  return bffRequest<ClaimDetail>(BFF_CLAIMS_ROUTES.submit(claimId), {
    method: "POST",
  });
}

export type CheckPayerStatusResult = {
  claim: ClaimDetail;
  action: string;
  message: string;
};

export async function checkClaimPayerStatus(
  claimId: number | string,
): Promise<CheckPayerStatusResult> {
  return bffRequest<CheckPayerStatusResult>(
    BFF_CLAIMS_ROUTES.checkPayerStatus(claimId),
    {
      method: "POST",
    },
  );
}

export async function addClaimDiagnosis(
  claimId: number | string,
  payload: {
    code: string;
    description: string;
    standard?: string;
  },
): Promise<ClaimDetail> {
  return bffRequest<ClaimDetail>(BFF_CLAIMS_ROUTES.diagnoses(claimId), {
    method: "POST",
    body: payload,
  });
}

export async function setClaimLineDentalTeeth(
  claimId: number | string,
  lineItemId: number | string,
  toothNumbers: number[],
): Promise<ClaimDetail> {
  return bffRequest<ClaimDetail>(
    BFF_CLAIMS_ROUTES.lineItemDental(claimId, lineItemId),
    {
      method: "PUT",
      body: { tooth_numbers: toothNumbers },
    },
  );
}

export async function updateClaimLinePaymentSplit(
  claimId: number | string,
  lineItemId: number | string,
  payload: { client_due: string; insurer_due: string },
): Promise<ClaimDetail> {
  return bffRequest<ClaimDetail>(
    BFF_CLAIMS_ROUTES.lineItemPaymentSplit(claimId, lineItemId),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export async function evaluateClaimAdvisories(
  claimId: number | string,
): Promise<AdvisorEvaluation> {
  return bffRequest(BFF_CLAIMS_ROUTES.advisorEvaluate(claimId), {
    method: "POST",
  });
}

export async function fetchClaimAdvisorEvaluations(
  claimId: number | string,
): Promise<AdvisorEvaluation[]> {
  return bffRequest(BFF_CLAIMS_ROUTES.advisorEvaluations(claimId));
}

export async function fetchTariffCategories(
  filters: TariffCategoryListFilters = {},
): Promise<TariffCategoryListResponse> {
  return bffRequest(
    `${BFF_CLAIMS_ROUTES.tariffCategories}${buildTariffCategoryQuery(filters)}`,
  );
}

export async function createClaimAdvisoryOverride(
  claimId: number | string,
  note: string,
): Promise<ClaimAdvisoryOverride> {
  return bffRequest(BFF_CLAIMS_ROUTES.advisorOverride(claimId), {
    method: "POST",
    body: { note },
  });
}

export async function fetchMasemPayerIntegration(
  clinicId: number,
): Promise<MasmPayerIntegration> {
  const data = await bffRequest<{ integration: MasmPayerIntegration }>(
    BFF_CLAIMS_ROUTES.clinicPayerIntegration(clinicId),
  );
  return data.integration;
}

export async function updateMasemPayerIntegration(
  clinicId: number,
  payload: UpdateMasmPayerIntegrationPayload,
): Promise<MasmPayerIntegration> {
  const data = await bffRequest<{ integration: MasmPayerIntegration }>(
    BFF_CLAIMS_ROUTES.clinicPayerIntegration(clinicId),
    {
      method: "PATCH",
      body: payload,
    },
  );
  return data.integration;
}

export async function fetchMasmPortalCredential(
  clinicId: number,
): Promise<MasmPortalCredential> {
  const data = await bffRequest<{ credential: MasmPortalCredential }>(
    BFF_CLAIMS_ROUTES.clinicPortalCredentials(clinicId),
  );
  return data.credential;
}

export async function updateMasmPortalCredential(
  clinicId: number,
  payload: UpdateMasmPortalCredentialPayload,
): Promise<MasmPortalCredential> {
  const data = await bffRequest<{ credential: MasmPortalCredential }>(
    BFF_CLAIMS_ROUTES.clinicPortalCredentials(clinicId),
    {
      method: "PATCH",
      body: payload,
    },
  );
  return data.credential;
}

export async function fetchEClaimPractitionerMappings(options?: {
  clinicId?: number;
  mappingType?: string;
  active?: boolean;
}): Promise<EClaimPractitionerMappingListResponse> {
  const params = new URLSearchParams();
  if (options?.clinicId) {
    params.set("clinic_id", String(options.clinicId));
  }
  if (options?.mappingType) {
    params.set("mapping_type", options.mappingType);
  }
  if (options?.active) {
    params.set("active", "true");
  }

  const query = params.toString();
  const path = query
    ? `${BFF_CLAIMS_ROUTES.practitionerMappings}?${query}`
    : BFF_CLAIMS_ROUTES.practitionerMappings;

  return bffRequest<EClaimPractitionerMappingListResponse>(path);
}

export async function upsertEClaimPractitionerMapping(
  payload: UpsertEClaimPractitionerMappingPayload,
): Promise<EClaimPractitionerMapping> {
  const data = await bffRequest<{ mapping: EClaimPractitionerMapping }>(
    BFF_CLAIMS_ROUTES.practitionerMappingsUpsert,
    {
      method: "POST",
      body: payload,
    },
  );
  return data.mapping;
}

export function extractVerificationToken(
  member: Record<string, unknown>,
): string | null {
  const token =
    member.verificationToken ??
    member.verification_token ??
    member.VerificationToken;
  return typeof token === "string" && token.trim() ? token.trim() : null;
}

export function isClaimNotFoundError(error: unknown): boolean {
  return error instanceof BffError && error.status === 404;
}

export function isInsuranceInvoice(invoice: {
  insurance_scheme_id?: number | null;
  insurance_scheme_name?: string | null;
  insurance_company?: string | null;
  insurance_number?: string | number | null;
}): boolean {
  return Boolean(
    invoice.insurance_scheme_id
      || coerceToOptionalString(invoice.insurance_scheme_name)
      || coerceToOptionalString(invoice.insurance_company)
      || coerceToOptionalString(invoice.insurance_number),
  );
}
