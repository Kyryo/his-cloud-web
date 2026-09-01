import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ClaimAdvisoriesCard } from "@/features/claims/components/ClaimAdvisoriesPanel";
import {
  evaluateClaimAdvisories,
} from "@/features/claims/services/claims.service";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { BffError } from "@/lib/bff-client";

const toastMock = vi.fn();

vi.mock("@/features/claims/services/claims.service", () => ({
  fetchClaim: vi.fn(),
  evaluateClaimAdvisories: vi.fn(),
  createClaimAdvisoryOverride: vi.fn(),
  createClaimAdvisoryClearance: vi.fn(),
  applyClaimAdvisoryFinding: vi.fn(),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({
    toast: toastMock,
    dismiss: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
  toastMock.mockReset();
  vi.mocked(evaluateClaimAdvisories).mockReset();
});

function buildClaim(overrides: Partial<ClaimDetail> = {}): ClaimDetail {
  return {
    id: 99,
    uuid: "claim-99",
    tenant: 1,
    visit: 1,
    visit_uuid: "visit-1",
    invoice: 12,
    invoice_id: 12,
    payer_code: "MASM",
    status: "draft",
    vitals: {},
    membership_number: "M-1",
    practitioner_number: "P-1",
    service_provider_code: "SP-1",
    verification_token: "",
    claim_reference_number: null,
    external_claim_id: null,
    customer_name: "Jane Doe",
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
      public_id: "eval-1",
      claim: 99,
      status: "completed",
      selected_validation_codes: ["TEST_AI_REVIEW_TRIGGER"],
      deterministic_findings: [],
      ai_findings: [
        {
          code: "AI_NECESSITY",
          name: "Weak indication",
          severity: "warning",
          category: "medical_necessity",
          message: "Procedure is not supported by the recorded diagnosis.",
          recommended_action: "Add supporting clinical notes.",
        },
      ],
      deterministic_count: 0,
      ai_count: 1,
      evaluated_by: null,
      created_at: "2026-01-01T00:00:00Z",
    },
    ...overrides,
  };
}

describe("ClaimAdvisoriesCard IQ review", () => {
  it("renders IQ findings in the findings card without blocking submit", () => {
    render(<ClaimAdvisoriesCard claim={buildClaim()} />);

    expect(screen.queryByTestId("claim-ai-review-section")).not.toBeInTheDocument();
    expect(screen.queryByText("AI review")).not.toBeInTheDocument();
    expect(screen.getByTestId("claim-iq-badge")).toBeInTheDocument();
    expect(screen.getByText("IQ")).toBeInTheDocument();
    expect(screen.getByText("Weak indication")).toBeInTheDocument();
    expect(screen.getByTestId("claim-iq-findings-count")).toHaveTextContent("1 IQ");
    expect(
      screen.queryByTestId("claim-advisory-blocking-alert"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("No payer-rule findings"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("claim-advisory-fix-AI_NECESSITY"));
    expect(screen.getByTestId("claim-advisory-fix-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("claim-advisory-apply-tab")).toBeInTheDocument();
    expect(screen.getByTestId("claim-advisory-apply-unsupported")).toBeInTheDocument();
    expect(
      screen.queryByText("Add supporting clinical notes."),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("tabbed-dialog-tab-guidance"));
    expect(screen.getByText("Add supporting clinical notes.")).toBeInTheDocument();
    expect(screen.getAllByText("IQ").length).toBeGreaterThan(0);
  });

  it("keeps submit blocked only for deterministic rejection-risk findings", () => {
    render(
      <ClaimAdvisoriesCard
        claim={buildClaim({
          has_blocking_advisories: true,
          latest_advisor_evaluation: {
            id: 1,
            public_id: "eval-1",
            claim: 99,
            status: "completed",
            selected_validation_codes: [],
            deterministic_findings: [
              {
                code: "MISSING_TARIFF",
                name: "Missing tariff",
                severity: "rejection_risk",
                category: "coding",
                message: "Line is missing a tariff code.",
              },
            ],
            ai_findings: [
              {
                code: "AI_NECESSITY",
                name: "Weak indication",
                severity: "warning",
                category: "medical_necessity",
                message: "Procedure is not supported by the recorded diagnosis.",
              },
            ],
            deterministic_count: 1,
            ai_count: 1,
            evaluated_by: null,
            created_at: "2026-01-01T00:00:00Z",
          },
        })}
      />,
    );

    expect(screen.getByTestId("claim-advisory-blocking-alert")).toBeInTheDocument();
    expect(screen.queryByTestId("claim-ai-review-section")).not.toBeInTheDocument();
    expect(screen.getByText("Missing tariff")).toBeInTheDocument();
    expect(screen.getByText("Weak indication")).toBeInTheDocument();
    expect(screen.getByTestId("claim-rules-badge")).toBeInTheDocument();
    expect(screen.getByTestId("claim-iq-badge")).toBeInTheDocument();
  });

  it("hides IQ badges when there are no IQ findings", () => {
    render(
      <ClaimAdvisoriesCard
        claim={buildClaim({
          latest_advisor_evaluation: {
            id: 1,
            public_id: "eval-1",
            claim: 99,
            status: "completed",
            selected_validation_codes: [],
            deterministic_findings: [],
            ai_findings: [],
            deterministic_count: 0,
            ai_count: 0,
            evaluated_by: null,
            created_at: "2026-01-01T00:00:00Z",
          },
        })}
      />,
    );

    expect(screen.queryByTestId("claim-iq-badge")).not.toBeInTheDocument();
    expect(screen.queryByTestId("claim-iq-findings-count")).not.toBeInTheDocument();
    expect(
      screen.getByText("We did not find any advisory issues on this claim"),
    ).toBeInTheDocument();
  });

  it("shows pending IQ review without a blocking alert", () => {
    render(
      <ClaimAdvisoriesCard
        claim={buildClaim({
          latest_advisor_evaluation: {
            id: 1,
            public_id: "eval-1",
            claim: 99,
            status: "pending_ai",
            selected_validation_codes: ["TEST_AI_REVIEW_TRIGGER"],
            deterministic_findings: [],
            ai_findings: [],
            deterministic_count: 0,
            ai_count: 0,
            evaluated_by: null,
            created_at: "2026-01-01T00:00:00Z",
          },
        })}
      />,
    );

    expect(screen.getByTestId("claim-iq-review-pending")).toBeInTheDocument();
    expect(screen.getByText("IQ review is in progress.")).toBeInTheDocument();
    expect(
      screen.queryByTestId("claim-advisory-blocking-alert"),
    ).not.toBeInTheDocument();
  });

  it("shows a rate-limit toast when re-evaluate is throttled", async () => {
    vi.mocked(evaluateClaimAdvisories).mockRejectedValue(
      new BffError("Request was throttled.", 429),
    );

    render(
      <ClaimAdvisoriesCard
        claim={buildClaim({
          advisory_status: "completed",
        })}
      />,
    );

    fireEvent.click(screen.getByTestId("claim-evaluate-advisories-button"));

    await vi.waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "error",
          title: "IQ review is temporarily limited",
        }),
      );
    });
  });
});
