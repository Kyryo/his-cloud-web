import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_CLAIMS_ROUTES } from "@/constants/api";
import {
  createClaimFromInvoice,
  extractVerificationToken,
  fetchClaimByInvoice,
  fetchMasemPayerIntegration,
  isInsuranceInvoice,
  submitClaim,
  updateMasemPayerIntegration,
  verifyClaimMember,
} from "@/features/claims/services/claims.service";
import { BffError, bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
  BffError: class BffError extends Error {
    status: number;
    errors?: Record<string, string[]>;

    constructor(message: string, status = 500, errors?: Record<string, string[]>) {
      super(message);
      this.status = status;
      this.errors = errors;
    }
  },
}));

describe("claims.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches claim by invoice from wrapped BFF response", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      claim: { id: 12, status: "draft" },
    });

    const claim = await fetchClaimByInvoice(44);

    expect(bffRequest).toHaveBeenCalledWith(BFF_CLAIMS_ROUTES.byInvoice(44));
    expect(claim?.id).toBe(12);
  });

  it("returns null when by-invoice response has no claim", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({ claim: null });

    const claim = await fetchClaimByInvoice(44);

    expect(claim).toBeNull();
  });

  it("creates claim from invoice", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({ id: 15, status: "draft" });

    const claim = await createClaimFromInvoice(9, {
      verification_token: "token-1",
      payer_code: "MASM",
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_CLAIMS_ROUTES.fromInvoice(9), {
      method: "POST",
      body: {
        verification_token: "token-1",
        payer_code: "MASM",
      },
    });
    expect(claim.id).toBe(15);
  });

  it("verifies member through BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      token: "verify-token",
      member: { membershipNumber: "M-1" },
    });

    const response = await verifyClaimMember({
      membership_number: "M-1",
      service_provider_code: "SP-1",
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_CLAIMS_ROUTES.verifyMember, {
      method: "POST",
      body: {
        membership_number: "M-1",
        service_provider_code: "SP-1",
      },
    });
    expect(response.token).toBe("verify-token");
  });

  it("submits claim", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({ id: 15, status: "submitted" });

    const claim = await submitClaim(15);

    expect(bffRequest).toHaveBeenCalledWith(BFF_CLAIMS_ROUTES.submit(15), {
      method: "POST",
    });
    expect(claim.status).toBe("submitted");
  });

  it("loads and updates MASM integration via wrapped responses", async () => {
    vi.mocked(bffRequest)
      .mockResolvedValueOnce({
        integration: { uuid: "int-1", payer_code: "MASM", is_enabled: true },
      })
      .mockResolvedValueOnce({
        integration: { uuid: "int-1", payer_code: "MASM", is_enabled: false },
      });

    const integration = await fetchMasemPayerIntegration();
    const updated = await updateMasemPayerIntegration({ is_enabled: false });

    expect(bffRequest).toHaveBeenNthCalledWith(1, BFF_CLAIMS_ROUTES.masmIntegration);
    expect(bffRequest).toHaveBeenNthCalledWith(2, BFF_CLAIMS_ROUTES.masmIntegration, {
      method: "PATCH",
      body: { is_enabled: false },
    });
    expect(integration.is_enabled).toBe(true);
    expect(updated.is_enabled).toBe(false);
  });

  it("extracts verification token from member payload variants", () => {
    expect(
      extractVerificationToken({
        verificationToken: "token-a",
      }),
    ).toBe("token-a");
    expect(
      extractVerificationToken({
        verification_token: "token-b",
      }),
    ).toBe("token-b");
    expect(extractVerificationToken({})).toBeNull();
  });

  it("detects insurance invoices", () => {
    expect(
      isInsuranceInvoice({
        insurance_scheme_id: 3,
        insurance_number: null,
      }),
    ).toBe(true);
    expect(
      isInsuranceInvoice({
        insurance_scheme_id: null,
        insurance_number: "M123",
      }),
    ).toBe(true);
    expect(
      isInsuranceInvoice({
        insurance_scheme_id: null,
        insurance_number: 3456789,
      }),
    ).toBe(true);
    expect(
      isInsuranceInvoice({
        insurance_scheme_id: null,
        insurance_company: "MASM",
      }),
    ).toBe(true);
    expect(
      isInsuranceInvoice({
        insurance_scheme_id: null,
        insurance_scheme_name: "VIP",
      }),
    ).toBe(true);
    expect(
      isInsuranceInvoice({
        insurance_scheme_id: null,
        insurance_number: "  ",
      }),
    ).toBe(false);
  });

  it("identifies claim not found errors", async () => {
    vi.mocked(bffRequest).mockRejectedValueOnce(new BffError("Not found", 404));

    await expect(fetchClaimByInvoice(1)).rejects.toMatchObject({ status: 404 });
  });
});
