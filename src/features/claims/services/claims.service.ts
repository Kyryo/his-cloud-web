import { BFF_CLAIMS_ROUTES } from "@/constants/api";
import type {
  ClaimDetail,
  ClaimListFilters,
  ClaimListResponse,
  CreateClaimFromInvoicePayload,
  EClaimPractitionerMapping,
  EClaimPractitionerMappingListResponse,
  MasmPayerIntegration,
  UpdateClaimPayload,
  UpdateMasmPayerIntegrationPayload,
  UpsertEClaimPractitionerMappingPayload,
  VerifyMemberPayload,
  VerifyMemberResponse,
} from "@/features/claims/types/claims.types";
import { BffError, bffRequest } from "@/lib/bff-client";

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
  if (filters.membershipNumber) {
    params.set("membership_number", filters.membershipNumber);
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

export async function fetchMasemPayerIntegration(): Promise<MasmPayerIntegration> {
  const data = await bffRequest<{ integration: MasmPayerIntegration }>(
    BFF_CLAIMS_ROUTES.masmIntegration,
  );
  return data.integration;
}

export async function updateMasemPayerIntegration(
  payload: UpdateMasmPayerIntegrationPayload,
): Promise<MasmPayerIntegration> {
  const data = await bffRequest<{ integration: MasmPayerIntegration }>(
    BFF_CLAIMS_ROUTES.masmIntegration,
    {
      method: "PATCH",
      body: payload,
    },
  );
  return data.integration;
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

import { coerceToOptionalString } from "@/lib/coerce-string";

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
