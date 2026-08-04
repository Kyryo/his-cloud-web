import { describe, expect, it } from "vitest";

import type { Invoice } from "@/features/invoices/types/invoice.types";
import {
  getClaimRequirementCheckItems,
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

    expect(items.filter((item) => !item.met)).toHaveLength(7);
    expect(
      hasInvoiceClaimReadinessIssues(
        buildInvoice({
          state: "draft",
          has_diagnosis: false,
        }),
      ),
    ).toBe(true);
  });

  it("treats an existing claim status as satisfying payer readiness", () => {
    const items = getInvoiceClaimReadinessItems(
      buildInvoice({
        has_diagnosis: true,
        has_practitioner_mapping: true,
        can_initiate_claim: false,
        claim_status: "draft",
        claim_payer_code: "MASM",
      }),
    );

    expect(
      items.find((item) => item.label.includes("connection is configured"))?.met,
    ).toBe(true);
  });

  it("checks tariff codes, diagnosis, and membership for requirements", () => {
    const unmet = getClaimRequirementCheckItems(
      buildInvoice({
        has_diagnosis: false,
        insurance_number: null,
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
            tariff_code: null,
          },
        ],
      }),
    );

    expect(unmet.map((item) => item.label)).toEqual([
      "All line items have tariff codes",
      "At least one diagnosis is recorded",
      "Membership number is recorded",
    ]);
    expect(unmet.every((item) => !item.met)).toBe(true);

    const met = getClaimRequirementCheckItems(
      buildInvoice({
        has_diagnosis: true,
        insurance_number: "M-1",
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
            tariff_code: "T-1",
          },
        ],
      }),
    );
    expect(met.every((item) => item.met)).toBe(true);
  });
});
