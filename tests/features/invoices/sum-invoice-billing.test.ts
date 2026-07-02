import { describe, expect, it } from "vitest";

import type { Invoice } from "@/features/invoices/types/invoice.types";
import {
  formatInvoiceInsurerDueLabel,
  hasInvoiceBalance,
  hasInvoicePaymentSplit,
  sumInvoiceClientDue,
  sumInvoiceExcess,
  sumInvoiceInsurerDue,
} from "@/features/invoices/utils/sum-invoice-billing";

function buildInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 1,
    name: "INV001",
    state: "posted",
    customer_id: 1,
    customer_uuid: null,
    customer_name: "Jane Doe",
    amount_untaxed: "100",
    amount_tax: "10",
    amount_total: "110",
    amount_paid: "0",
    amount_residual: "110",
    invoice_date: "2026-01-01",
    lines: [],
    ...overrides,
  };
}

describe("sum-invoice-billing", () => {
  it("sums insurer, client, and excess across invoice lines", () => {
    const invoice = buildInvoice({
      lines: [
        {
          id: 1,
          name: "Consultation",
          product_id: 1,
          product_name: "Consultation",
          quantity: "1",
          price_unit: "100",
          price_subtotal: "100",
          price_total: "100",
          is_payable: true,
          insurer_due: "80",
          client_due: "20",
          has_excess: true,
          excess_amount: "5",
        },
        {
          id: 2,
          name: "Bandage",
          product_id: 2,
          product_name: "Bandage",
          quantity: "2",
          price_unit: "25",
          price_subtotal: "50",
          price_total: "50",
          is_payable: true,
          insurer_due: "50",
          client_due: "10",
          has_excess: false,
          excess_amount: "0",
        },
      ],
    });

    expect(sumInvoiceInsurerDue(invoice)).toBe(130);
    expect(sumInvoiceClientDue(invoice)).toBe(30);
    expect(sumInvoiceExcess(invoice)).toBe(5);
    expect(hasInvoicePaymentSplit(invoice)).toBe(true);
  });

  it("formats insurer due label from payer and scheme", () => {
    expect(
      formatInvoiceInsurerDueLabel(
        buildInvoice({
          insurance_company: "MASM",
          insurance_scheme_name: "Executive",
        }),
      ),
    ).toBe("MASM due");

    expect(
      formatInvoiceInsurerDueLabel(
        buildInvoice({
          insurance_scheme_name: "Executive",
        }),
      ),
    ).toBe("Executive due");
  });

  it("detects positive invoice balance", () => {
    expect(hasInvoiceBalance(buildInvoice({ amount_residual: "25.00" }))).toBe(true);
    expect(hasInvoiceBalance(buildInvoice({ amount_residual: "0" }))).toBe(false);
  });
});
