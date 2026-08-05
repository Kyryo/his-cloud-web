import { describe, expect, it } from "vitest";

import type { ClaimDetail } from "@/features/claims/types/claims.types";
import {
  claimHasMissingDentalTeeth,
  getClaimRequirementCheckItems,
} from "@/features/invoices/utils/invoice-claim-readiness";

function line(overrides: Partial<ClaimDetail["claim_invoices"][0]["line_items"][0]> = {}) {
  return {
    id: 1,
    uuid: "li-1",
    tariff_code: "D0120",
    unit_price: "100",
    quantity: "1",
    date_created: "2026-01-01",
    sales_order_line: null,
    dental: [],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function dentalClaim(overrides: Partial<ClaimDetail> = {}): ClaimDetail {
  return {
    id: 1,
    uuid: "c-1",
    tenant: 1,
    visit: 1,
    visit_uuid: "v-1",
    invoice: 1,
    invoice_id: 1,
    payer_code: "MASM",
    status: "draft",
    vitals: {},
    membership_number: "M1",
    practitioner_number: "P1",
    service_provider_code: "SP1",
    verification_token: "",
    claim_reference_number: null,
    external_claim_id: null,
    diagnoses: [
      {
        id: 1,
        uuid: "d-1",
        code: "K02.1",
        standard: "ICD10",
        description: "Caries",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ],
    claim_invoices: [
      {
        id: 1,
        uuid: "ci-1",
        invoice_number: "INV1",
        invoice_date: "2026-01-01",
        amount: "100",
        currency: "MWK",
        source_invoice: 1,
        line_items: [line()],
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ],
    submitted_at: null,
    created_by: null,
    submitted_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    has_dental_encounter: true,
    ...overrides,
  };
}

describe("claim dental teeth requirement item", () => {
  it("does not include teeth check when claim is not dental", () => {
    const claim = dentalClaim({ has_dental_encounter: false });
    const items = getClaimRequirementCheckItems(null, claim);
    expect(items.some((item) => /tooth/i.test(item.label))).toBe(false);
    expect(claimHasMissingDentalTeeth(claim)).toBe(false);
  });

  it("lists unmet teeth as a non-blocking requirements-card item", () => {
    const claim = dentalClaim();
    const items = getClaimRequirementCheckItems(null, claim);
    const teeth = items.find((item) => /tooth/i.test(item.label));
    expect(teeth).toMatchObject({
      met: false,
      blocksProgress: false,
    });
    expect(teeth?.hint).toMatch(/Odontogram/i);
    const blockingUnmet = items.filter(
      (item) => item.blocksProgress !== false && !item.met,
    );
    expect(blockingUnmet).toHaveLength(0);
  });

  it("marks teeth met when every dental line has teeth", () => {
    const claim = dentalClaim({
      claim_invoices: [
        {
          id: 1,
          uuid: "ci-1",
          invoice_number: "INV1",
          invoice_date: "2026-01-01",
          amount: "100",
          currency: "MWK",
          source_invoice: 1,
          line_items: [line({ dental: [{ id: 1, tooth_number: 16 }] })],
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ],
    });
    const teeth = getClaimRequirementCheckItems(null, claim).find((item) =>
      /tooth/i.test(item.label),
    );
    expect(teeth?.met).toBe(true);
    expect(claimHasMissingDentalTeeth(claim)).toBe(false);
  });
});
