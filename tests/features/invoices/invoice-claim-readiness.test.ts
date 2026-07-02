import { describe, expect, it } from "vitest";

import type { Invoice } from "@/features/invoices/types/invoice.types";
import {
  getInvoiceClaimReadinessItems,
  hasInvoiceClaimReadinessIssues,
} from "@/features/invoices/utils/invoice-claim-readiness";

function buildInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 1,
    name: "INV001",
    state: "posted",
    customer_id: 1,
    customer_uuid: null,
    customer_name: "Jane Doe",
    amount_untaxed: "100",
    amount_tax: "0",
    amount_total: "100",
    invoice_date: "2026-01-01",
    ...overrides,
  };
}

describe("invoice-claim-readiness", () => {
  it("flags missing readiness items", () => {
    const items = getInvoiceClaimReadinessItems(
      buildInvoice({
        state: "draft",
        has_diagnosis: false,
        has_practitioner_mapping: false,
        can_initiate_claim: false,
      }),
    );

    expect(items.filter((item) => !item.met)).toHaveLength(4);
    expect(
      hasInvoiceClaimReadinessIssues(
        buildInvoice({
          state: "draft",
          has_diagnosis: false,
        }),
      ),
    ).toBe(true);
  });

  it("treats an existing claim status as satisfying masm readiness", () => {
    const items = getInvoiceClaimReadinessItems(
      buildInvoice({
        has_diagnosis: true,
        has_practitioner_mapping: true,
        can_initiate_claim: false,
        claim_status: "draft",
      }),
    );

    expect(items.find((item) => item.label.includes("MASM"))?.met).toBe(true);
  });
});
