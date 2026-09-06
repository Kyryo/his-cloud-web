import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ClaimSummaryPanel } from "@/features/claims/components/detail/ClaimSummaryPanel";
import type { ClaimDetail } from "@/features/claims/types/claims.types";

vi.mock("@/features/invoices/services/invoices.service", () => ({
  fetchInvoice: vi.fn().mockResolvedValue({
    id: 81,
    uuid: "inv-81",
    amount_total: "10000",
    amount_paid: "2500",
    amount_residual: "7500",
    insurance_company: "MASM",
    lines: [
      {
        id: 1,
        insurer_due: "8000",
        client_due: "2000",
      },
    ],
  }),
}));

const claim = {
  id: 17,
  uuid: "claim-17",
  status: "submitted",
  payer_code: "MASM",
  membership_number: "MEM-4411",
  practitioner_number: "PR-22",
  service_provider_code: "SP-9",
  customer_name: "Ada Lovelace",
  customer_uuid: "cust-12",
  invoice_uuid: "inv-81",
  invoice_name: "INV/2026/0001",
  visit_uuid: "visit-3",
  created_at: "2026-08-01T10:00:00Z",
  submitted_at: "2026-08-02T10:00:00Z",
  claim_invoices: [
    {
      id: 1,
      amount: "10000",
      line_items: [
        {
          id: 11,
          payer_due: "8000",
          client_due: "2000",
          total: "10000",
          unit_price: "10000",
          quantity: "1",
        },
      ],
    },
  ],
} as ClaimDetail;

afterEach(() => {
  cleanup();
});

describe("ClaimSummaryPanel", () => {
  it("shows totals as stacked fields without card chrome", () => {
    const { container } = render(<ClaimSummaryPanel claim={claim} />);

    const totals = screen.getByTestId("claim-summary-totals");
    expect(totals).toHaveTextContent("Total");
    expect(totals).toHaveTextContent("10,000.00 MWK");
    expect(totals).toHaveTextContent("Paid");
    expect(totals).toHaveTextContent("Balance");
    expect(container.querySelector(".rounded-xl.border")).toBeNull();
  });

  it("shows billing split and coverage details", () => {
    render(<ClaimSummaryPanel claim={claim} />);

    expect(screen.getByText("MASM due")).toBeInTheDocument();
    expect(screen.getByText("Client due")).toBeInTheDocument();
    expect(screen.getByText("MASM")).toBeInTheDocument();
    expect(screen.getByText("MEM-4411")).toBeInTheDocument();
    expect(screen.getByText("PR-22")).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("INV/2026/0001")).toBeInTheDocument();
  });
});
