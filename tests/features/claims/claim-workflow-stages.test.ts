import { describe, expect, it } from "vitest";

import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { getClaimWorkflowStageStates } from "@/features/claims/utils/claim-workflow-stages";
import type { InvoiceClaimReadinessItem } from "@/features/invoices/utils/invoice-claim-readiness";

function requirements(allMet: boolean): InvoiceClaimReadinessItem[] {
  return [
    { label: "All line items have tariff codes", met: allMet },
    { label: "At least one diagnosis is recorded", met: allMet },
    { label: "Membership number is recorded", met: allMet },
  ];
}

function draftClaim(overrides: Partial<ClaimDetail> = {}): ClaimDetail {
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
    customer_name: "Jane",
    submitted_at: null,
    created_by: null,
    submitted_by: null,
    diagnoses: [],
    claim_invoices: [],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    has_blocking_advisories: false,
    has_advisory_override: false,
    latest_advisor_evaluation: {
      id: 1,
      public_id: "e1",
      claim: 1,
      status: "completed",
      selected_validation_codes: [],
      deterministic_findings: [],
      ai_findings: [],
      deterministic_count: 0,
      ai_count: 0,
      evaluated_by: null,
      created_at: "2026-01-01T00:00:00Z",
    },
    ...overrides,
  };
}

describe("getClaimWorkflowStageStates", () => {
  it("blocks requirements when checks remain and no claim exists", () => {
    const stages = getClaimWorkflowStageStates(requirements(false), null);
    expect(stages[0]).toMatchObject({
      id: "requirements",
      status: "blocked",
    });
    expect(stages[1].status).toBe("pending");
    expect(stages[2].status).toBe("pending");
  });

  it("marks requirements current when ready to create a claim", () => {
    const stages = getClaimWorkflowStageStates(requirements(true), null);
    expect(stages[0]).toMatchObject({
      id: "requirements",
      status: "current",
    });
    expect(stages[0].summary).toMatch(/All 3 checks passed/i);
  });

  it("marks advisory blocked when rejection-risk findings remain", () => {
    const stages = getClaimWorkflowStageStates(
      requirements(true),
      draftClaim({
        has_blocking_advisories: true,
        latest_advisor_evaluation: {
          id: 1,
          public_id: "e1",
          claim: 1,
          status: "completed",
          selected_validation_codes: [],
          deterministic_findings: [
            {
              code: "X",
              name: "Missing tariff",
              severity: "rejection_risk",
              category: "coding",
              message: "Missing",
            },
          ],
          ai_findings: [],
          deterministic_count: 1,
          ai_count: 0,
          evaluated_by: null,
          created_at: "2026-01-01T00:00:00Z",
        },
      }),
    );
    expect(stages[0].status).toBe("completed");
    expect(stages[1].status).toBe("blocked");
    expect(stages[2].status).toBe("pending");
  });

  it("marks queue current when draft claim is submit-ready", () => {
    const stages = getClaimWorkflowStageStates(requirements(true), draftClaim());
    expect(stages[1].status).toBe("completed");
    expect(stages[2]).toMatchObject({
      id: "queue",
      status: "current",
    });
    expect(stages[3]).toMatchObject({
      id: "payer",
      status: "pending",
    });
  });

  it("marks payer response current after submission while awaiting", () => {
    const stages = getClaimWorkflowStageStates(
      requirements(true),
      draftClaim({
        status: "submitted",
        payer_status: "awaiting_payer",
      }),
    );
    expect(stages[2]).toMatchObject({ id: "queue", status: "completed" });
    expect(stages[3]).toMatchObject({
      id: "payer",
      status: "current",
      summary: "Awaiting a response from MASM",
    });
  });

  it("marks payer response failed when auto-close needs attention", () => {
    const stages = getClaimWorkflowStageStates(
      requirements(true),
      draftClaim({
        status: "submitted",
        payer_status: "failed",
      }),
    );
    expect(stages[3]).toMatchObject({
      id: "payer",
      status: "failed",
      summary: "MASM response needs attention",
    });
  });
});
