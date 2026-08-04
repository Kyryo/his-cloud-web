import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InvoiceClaimsTab } from "@/features/invoices/components/detail/InvoiceClaimsTab";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import type { Invoice } from "@/features/invoices/types/invoice.types";

const fetchClaimByInvoice = vi.fn();
const fetchClaim = vi.fn();
const createClaimFromInvoice = vi.fn();
const evaluateClaimAdvisories = vi.fn();
const submitClaim = vi.fn();
const createClaimAdvisoryOverride = vi.fn();

vi.mock("@/features/claims/services/claims.service", () => ({
  fetchClaimByInvoice: (...args: unknown[]) => fetchClaimByInvoice(...args),
  fetchClaim: (...args: unknown[]) => fetchClaim(...args),
  createClaimFromInvoice: (...args: unknown[]) => createClaimFromInvoice(...args),
  evaluateClaimAdvisories: (...args: unknown[]) => evaluateClaimAdvisories(...args),
  submitClaim: (...args: unknown[]) => submitClaim(...args),
  createClaimAdvisoryOverride: (...args: unknown[]) =>
    createClaimAdvisoryOverride(...args),
  isInsuranceInvoice: () => true,
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({
    toast: vi.fn(),
    dismiss: vi.fn(),
  }),
}));

function buildInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 12,
    name: "INV012",
    state: "posted",
    customer_id: 1,
    customer_uuid: null,
    customer_name: "Jane Doe",
    amount_untaxed: "100",
    amount_tax: "0",
    amount_total: "100",
    invoice_date: "2026-01-01",
    visit_uuid: "visit-1",
    has_diagnosis: true,
    has_practitioner_mapping: true,
    can_initiate_claim: true,
    claim_payer_code: "MASM",
    insurance_number: "3456789-0-1",
    lines: [
      {
        id: 1,
        name: "Consult",
        product_id: 1,
        product_name: "Consult",
        quantity: "1",
        price_unit: "100",
        price_subtotal: "100",
        price_total: "100",
        is_payable: true,
        tariff_code: "TARIFF-1",
      },
    ],
    ...overrides,
  };
}

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
      ai_findings: [],
      deterministic_count: 1,
      ai_count: 0,
      evaluated_by: null,
      created_at: "2026-01-01T00:00:00Z",
    },
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
});

describe("InvoiceClaimsTab advisories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the claim workflow with readiness checks before a claim exists", async () => {
    fetchClaimByInvoice.mockResolvedValue(null);

    render(<InvoiceClaimsTab invoice={buildInvoice()} isActive />);

    await waitFor(() => {
      expect(screen.getByTestId("claim-workflow-card")).toBeInTheDocument();
    });
    expect(screen.getByText(/All 3 checks passed/i)).toBeInTheDocument();
    expect(screen.getByText("All line items have tariff codes")).toBeInTheDocument();
    expect(screen.getByTestId("invoice-create-claim-button")).toBeEnabled();
    expect(screen.queryByTestId("claim-edit-draft-button")).not.toBeInTheDocument();
    expect(screen.queryByTestId("claim-advisories-panel")).not.toBeInTheDocument();
  });

  it("shows advisory findings and gates submit after claim creation", async () => {
    const onIndicator = vi.fn();
    fetchClaimByInvoice.mockResolvedValue(buildClaim());

    render(
      <InvoiceClaimsTab
        invoice={buildInvoice({ claim_status: "draft" })}
        isActive
        onClaimIndicatorChange={onIndicator}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("claim-advisories-panel")).toBeInTheDocument();
    });

    expect(screen.getByTestId("workflow-stage-advisory")).toBeInTheDocument();
    expect(screen.getByText("Advisory")).toBeInTheDocument();
    expect(screen.getByTestId("claim-advisory-blocking-alert")).toBeInTheDocument();
    expect(screen.getByTestId("claim-evaluate-advisories-button")).toHaveTextContent(
      "Re-evaluate",
    );
    expect(screen.getAllByText(/1 rejection-risk/i).length).toBeGreaterThan(0);
    expect(screen.getByTestId("claim-record-override-button")).toBeInTheDocument();
    expect(screen.getByTestId("claim-edit-draft-button")).toBeInTheDocument();
    expect(screen.queryByText("Membership number")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("invoice-submit-claim-button"),
    ).not.toBeInTheDocument();
    expect(onIndicator).toHaveBeenCalledWith(true);
  });

  it("enables submit when blocking advisories are overridden", async () => {
    fetchClaimByInvoice.mockResolvedValue(
      buildClaim({
        has_blocking_advisories: false,
        has_advisory_override: true,
      }),
    );

    render(
      <InvoiceClaimsTab
        invoice={buildInvoice({ claim_status: "draft" })}
        isActive
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("invoice-submit-claim-button")).toBeEnabled();
    });
    expect(screen.queryByTestId("claim-record-override-button")).not.toBeInTheDocument();
  });
});
