import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ClaimAdvisoryFindingsCard } from "@/features/claims/components/ClaimAdvisoryFindingsCard";
import type {
  AdvisorFinding,
  ClaimAdvisoryClearance,
  ClaimDetail,
} from "@/features/claims/types/claims.types";

const {
  toast,
  applyClaimAdvisoryFinding,
  createClaimAdvisoryClearance,
  fetchClaim,
} = vi.hoisted(() => ({
  toast: vi.fn(),
  applyClaimAdvisoryFinding: vi.fn(),
  createClaimAdvisoryClearance: vi.fn(),
  fetchClaim: vi.fn(),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({
    toast,
    dismiss: vi.fn(),
  }),
}));

vi.mock("@/features/claims/services/claims.service", () => ({
  applyClaimAdvisoryFinding: (...args: unknown[]) =>
    applyClaimAdvisoryFinding(...args),
  createClaimAdvisoryClearance: (...args: unknown[]) =>
    createClaimAdvisoryClearance(...args),
  fetchClaim: (...args: unknown[]) => fetchClaim(...args),
}));

afterEach(() => {
  cleanup();
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
    has_blocking_advisories: true,
    has_advisory_override: false,
    advisory_clearances: [],
    ...overrides,
  };
}

const missingTariffFinding: AdvisorFinding = {
  code: "GLOBAL_MISSING_TARIFF_FOR_CODED_LINE",
  name: "Missing tariff",
  severity: "rejection_risk",
  category: "coding",
  message: "Line is missing a tariff code.",
  source: "rules",
  recommended_action: "Sync the scheme tariff onto the billed line.",
};

const filingWindowFinding: AdvisorFinding = {
  code: "MASM_VIP_2026_FILING_90_DAYS",
  name: "Filing window",
  severity: "rejection_risk",
  category: "policy",
  message: "This claim is outside the filing window.",
  source: "rules",
  recommended_action: "Submit within 90 days or record a clearance.",
};

const iqDiagnosisFinding: AdvisorFinding = {
  code: "AI_DIAGNOSIS",
  name: "Add a supporting diagnosis",
  severity: "warning",
  category: "documentation",
  message: "Replace free-text diagnosis with an ICD-10 code.",
  source: "iq",
  recommended_action: "Search the catalog and add J06.9.",
  remediation: {
    resolved: true,
    resolution: "model",
    targets: [
      {
        object: "claim_diagnosis",
        action: "add",
        codes: ["J06.9"],
        fields: ["code", "description"],
      },
    ],
  },
};

const iqQuantityFinding: AdvisorFinding = {
  code: "AI_UNITS",
  name: "Correct medication units",
  severity: "warning",
  category: "coding",
  message:
    "Correct the units on medication line 12345 to the quantity actually dispensed, recompute the line charge and claim total, then resubmit for review.",
  source: "iq",
  recommended_action: "Update the billed order line quantity.",
  remediation: {
    resolved: true,
    resolution: "model",
    targets: [
      {
        object: "claim_line",
        action: "update",
        ids: ["line-uuid-12345"],
        codes: ["12345"],
        fields: ["quantity"],
        line_labels: { "line-uuid-12345": "12345" },
      },
    ],
  },
};

function billedLineClaim(overrides: Partial<ClaimDetail> = {}): ClaimDetail {
  return buildClaim({
    has_blocking_advisories: false,
    claim_invoices: [
      {
        id: 1,
        uuid: "ci-1",
        invoice_number: "INV-APY",
        invoice_date: "2026-01-01",
        amount: "500.00",
        currency: "MWK",
        source_invoice: 12,
        line_items: [
          {
            id: 11,
            uuid: "line-uuid-12345",
            tariff_code: "12345",
            description: "Paracetamol 500mg",
            unit_price: "50.00",
            quantity: "10",
            date_created: "2026-01-01",
            sales_order_line: 7,
            created_at: "2026-01-01T00:00:00Z",
            updated_at: "2026-01-01T00:00:00Z",
          },
        ],
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ],
    ...overrides,
  });
}

const iqCoverageFinding: AdvisorFinding = {
  code: "AI_COVERAGE",
  name: "Dental implant exclusion",
  severity: "warning",
  category: "exclusion",
  message: "Dental implants are not covered on this scheme.",
  source: "iq",
  recommended_action: "Review the handbook section.",
  remediation: {
    resolved: true,
    resolution: "heuristic",
    targets: [
      {
        object: "coverage_policy",
        action: "review",
        codes: ["dentistry"],
      },
    ],
  },
};

function FindingsHarness({
  findings,
  initialClaim,
}: {
  findings: AdvisorFinding[];
  initialClaim: ClaimDetail;
}) {
  const [claim, setClaim] = useState(initialClaim);
  return (
    <ClaimAdvisoryFindingsCard
      findings={findings}
      claim={claim}
      onClaimUpdated={setClaim}
    />
  );
}

describe("advisory Fix and Clear dialogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens Fix on the Apply tab with How to resolve second", () => {
    render(
      <ClaimAdvisoryFindingsCard
        findings={[missingTariffFinding]}
        claim={buildClaim()}
      />,
    );

    fireEvent.click(
      screen.getByTestId("claim-advisory-fix-GLOBAL_MISSING_TARIFF_FOR_CODED_LINE"),
    );

    expect(screen.getByTestId("claim-advisory-fix-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("tabbed-dialog-tab-apply")).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByTestId("tabbed-dialog-tab-guidance")).toHaveTextContent(
      "How to resolve",
    );
    expect(screen.getByTestId("claim-advisory-apply-tab")).toBeInTheDocument();
    expect(
      screen.queryByText("Sync the scheme tariff onto the billed line."),
    ).not.toBeInTheDocument();
  });

  it("collapses long finding messages with a show more toggle", () => {
    const longFinding: AdvisorFinding = {
      ...iqQuantityFinding,
      message:
        "Medication line 12345 is billed at 10,000 units for a single OPD visit. " +
        "At 200 per unit this produces a line total of 2,000,000. " +
        "A typical outpatient antipyretic course is on the order of 5-30 tablets. " +
        "10,000 units on one line is not clinically plausible and is highly likely " +
        "to be denied by the payer as overbilling. dispensed_units is 0, so no " +
        "recorded dispensing supports the billed quantity.",
    };

    render(
      <ClaimAdvisoryFindingsCard
        findings={[longFinding]}
        claim={billedLineClaim()}
      />,
    );

    fireEvent.click(screen.getByTestId("claim-advisory-fix-AI_UNITS"));
    expect(screen.getByTestId("claim-advisory-fix-description-toggle")).toHaveTextContent(
      "Show more",
    );
    fireEvent.click(screen.getByTestId("claim-advisory-fix-description-toggle"));
    expect(screen.getByTestId("claim-advisory-fix-description-toggle")).toHaveTextContent(
      "Show less",
    );
  });

  it("submits Apply and closes the dialog", async () => {
    applyClaimAdvisoryFinding.mockResolvedValue(buildClaim({ has_blocking_advisories: false }));

    render(
      <ClaimAdvisoryFindingsCard
        findings={[missingTariffFinding]}
        claim={buildClaim()}
      />,
    );

    fireEvent.click(
      screen.getByTestId("claim-advisory-fix-GLOBAL_MISSING_TARIFF_FOR_CODED_LINE"),
    );
    fireEvent.click(screen.getByTestId("claim-advisory-apply-submit"));

    await waitFor(() => {
      expect(applyClaimAdvisoryFinding).toHaveBeenCalledWith(
        99,
        expect.objectContaining({
          code: "GLOBAL_MISSING_TARIFF_FOR_CODED_LINE",
          source: "rules",
        }),
      );
    });
    await waitFor(() => {
      expect(
        screen.queryByTestId("claim-advisory-fix-dialog"),
      ).not.toBeInTheDocument();
    });
  });

  it("shows the unsupported Apply fallback and disables the primary action", () => {
    render(
      <ClaimAdvisoryFindingsCard
        findings={[filingWindowFinding]}
        claim={buildClaim()}
      />,
    );

    fireEvent.click(
      screen.getByTestId("claim-advisory-fix-MASM_VIP_2026_FILING_90_DAYS"),
    );

    expect(screen.getByTestId("claim-advisory-apply-unsupported")).toBeInTheDocument();
    expect(screen.getByTestId("claim-advisory-apply-submit")).toBeDisabled();
  });

  it("shows a diagnosis Apply form for IQ claim_diagnosis targets", () => {
    render(
      <ClaimAdvisoryFindingsCard
        findings={[iqDiagnosisFinding]}
        claim={buildClaim({ has_blocking_advisories: false })}
      />,
    );

    expect(screen.getByTestId("claim-advisory-needs-update")).toHaveTextContent(
      "Diagnosis",
    );
    fireEvent.click(screen.getByTestId("claim-advisory-fix-AI_DIAGNOSIS"));
    expect(screen.getByTestId("advisory-apply-diagnosis-search")).toBeInTheDocument();
    expect(
      screen.queryByTestId("claim-advisory-apply-unsupported"),
    ).not.toBeInTheDocument();
  });

  it("opens billed order lines for IQ quantity findings", () => {
    render(
      <ClaimAdvisoryFindingsCard
        findings={[iqQuantityFinding]}
        claim={billedLineClaim()}
      />,
    );

    fireEvent.click(screen.getByTestId("claim-advisory-fix-AI_UNITS"));
    expect(screen.getByTestId("advisory-apply-order-lines")).toBeInTheDocument();
    expect(screen.getByText("Paracetamol 500mg")).toBeInTheDocument();
    expect(screen.getByText("12345")).toBeInTheDocument();
    expect(screen.getByTestId("advisory-quantity-line-uuid-12345")).toHaveValue("10");
    expect(screen.getByText(/Updates order, invoice, and claim totals/i)).toBeInTheDocument();
  });

  it("treats IQ quantity notes with empty line fields as quantity Apply", () => {
    const finding: AdvisorFinding = {
      code: "IMPLAUSIBLE_MEDICATION_QUANTITY",
      name: "Implausible billed quantity",
      severity: "warning",
      category: "claim_quality",
      message:
        "Medication line 12345 (Paracetamol 500mg) is billed at 10,000 units.",
      source: "iq",
      recommended_action: "Correct the billed units.",
      remediation: {
        resolved: true,
        resolution: "model",
        targets: [
          {
            object: "claim_line",
            action: "update",
            ids: ["line-uuid-12345"],
            codes: ["12345"],
            fields: [],
            line_labels: { "line-uuid-12345": "Paracetamol 500mg" },
          },
          {
            object: "claim_line",
            action: "update",
            ids: ["line-uuid-12345"],
            codes: ["12345"],
            fields: [],
            line_labels: { "line-uuid-12345": "Paracetamol 500mg" },
          },
        ],
      },
    };

    render(
      <ClaimAdvisoryFindingsCard
        findings={[finding]}
        claim={billedLineClaim()}
      />,
    );

    expect(screen.getByTestId("claim-advisory-needs-update")).toHaveTextContent(
      "Needs update: Line Paracetamol 500mg",
    );
    expect(
      screen.getByTestId("claim-advisory-needs-update"),
    ).not.toHaveTextContent("Line Paracetamol 500mg, Line Paracetamol 500mg");
    fireEvent.click(
      screen.getByTestId("claim-advisory-fix-IMPLAUSIBLE_MEDICATION_QUANTITY"),
    );
    expect(screen.getByTestId("advisory-apply-order-lines")).toBeInTheDocument();
    expect(
      screen.queryByTestId("claim-advisory-apply-needs-update"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/sync the scheme tariff code/i),
    ).not.toBeInTheDocument();
  });

  it("shows the fallback for IQ coverage-only targets", () => {
    render(
      <ClaimAdvisoryFindingsCard
        findings={[iqCoverageFinding]}
        claim={buildClaim({ has_blocking_advisories: false })}
      />,
    );

    fireEvent.click(screen.getByTestId("claim-advisory-fix-AI_COVERAGE"));
    expect(screen.getByTestId("claim-advisory-apply-unsupported")).toBeInTheDocument();
    expect(
      screen.queryByTestId("advisory-apply-diagnosis-search"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("claim-advisory-apply-submit")).toBeDisabled();
  });

  it("requires a Clear reason before submitting", () => {
    render(
      <ClaimAdvisoryFindingsCard
        findings={[missingTariffFinding]}
        claim={buildClaim()}
      />,
    );

    fireEvent.click(
      screen.getByTestId("claim-advisory-clear-GLOBAL_MISSING_TARIFF_FOR_CODED_LINE"),
    );
    fireEvent.click(screen.getByTestId("claim-advisory-clear-submit"));

    expect(createClaimAdvisoryClearance).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "error", title: "Reason required" }),
    );
    expect(screen.getByTestId("claim-advisory-clear-dialog")).toBeInTheDocument();
  });

  it("moves a cleared finding into the Cleared group", async () => {
    const clearance: ClaimAdvisoryClearance = {
      id: 1,
      uuid: "clear-1",
      claim: 99,
      finding_code: "GLOBAL_MISSING_TARIFF_FOR_CODED_LINE",
      finding_source: "rules",
      finding_name: "Missing tariff",
      severity: "rejection_risk",
      reason: "Tariff is billed under an agreed exception.",
      created_by: 7,
      created_at: "2026-01-02T10:00:00Z",
    };
    createClaimAdvisoryClearance.mockResolvedValue(clearance);
    fetchClaim.mockResolvedValue(
      buildClaim({
        has_blocking_advisories: false,
        advisory_clearances: [clearance],
      }),
    );

    render(
      <FindingsHarness
        findings={[missingTariffFinding]}
        initialClaim={buildClaim()}
      />,
    );

    fireEvent.click(
      screen.getByTestId("claim-advisory-clear-GLOBAL_MISSING_TARIFF_FOR_CODED_LINE"),
    );
    fireEvent.change(screen.getByTestId("claim-advisory-clear-reason"), {
      target: { value: "Tariff is billed under an agreed exception." },
    });
    fireEvent.click(screen.getByTestId("claim-advisory-clear-submit"));

    await waitFor(() => {
      expect(createClaimAdvisoryClearance).toHaveBeenCalledWith(99, {
        code: "GLOBAL_MISSING_TARIFF_FOR_CODED_LINE",
        source: "rules",
        reason: "Tariff is billed under an agreed exception.",
      });
    });

    await waitFor(() => {
      expect(
        screen.queryByTestId(
          "claim-advisory-finding-GLOBAL_MISSING_TARIFF_FOR_CODED_LINE",
        ),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("claim-advisory-cleared-group")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("claim-advisory-cleared-toggle"));
    expect(
      screen.getByTestId("claim-advisory-cleared-GLOBAL_MISSING_TARIFF_FOR_CODED_LINE"),
    ).toHaveTextContent("Tariff is billed under an agreed exception.");
  });

  it("hides Fix and Clear when the claim is not a draft", () => {
    render(
      <ClaimAdvisoryFindingsCard
        findings={[missingTariffFinding]}
        claim={buildClaim({ status: "submitted" })}
      />,
    );

    expect(
      screen.queryByTestId(
        "claim-advisory-fix-GLOBAL_MISSING_TARIFF_FOR_CODED_LINE",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(
        "claim-advisory-clear-GLOBAL_MISSING_TARIFF_FOR_CODED_LINE",
      ),
    ).not.toBeInTheDocument();
  });
});
