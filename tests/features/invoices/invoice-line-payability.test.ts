import { describe, expect, it } from "vitest";

import type { InvoiceLine } from "@/features/invoices/types/invoice.types";
import {
  getInvoiceClaimableLines,
  getInvoiceNonPayableLines,
  invoiceHasNonPayableLines,
  isInvoiceLineNonPayable,
} from "@/features/invoices/utils/invoice-line-payability";

function line(partial: Partial<InvoiceLine> & Pick<InvoiceLine, "id">): InvoiceLine {
  return {
    name: "Item",
    product_id: 1,
    product_name: null,
    quantity: "1",
    price_unit: "10",
    price_subtotal: "10",
    price_total: "10",
    is_payable: true,
    ...partial,
  };
}

describe("invoice-line-payability", () => {
  it("identifies non-payable invoice lines", () => {
    expect(isInvoiceLineNonPayable(line({ id: 1, is_payable: false }))).toBe(true);
    expect(isInvoiceLineNonPayable(line({ id: 2, is_payable: true }))).toBe(false);
  });

  it("splits claimable and non-payable lines", () => {
    const lines = [
      line({ id: 1, is_payable: true }),
      line({ id: 2, is_payable: false }),
    ];

    expect(getInvoiceClaimableLines(lines)).toHaveLength(1);
    expect(getInvoiceNonPayableLines(lines)).toHaveLength(1);
    expect(invoiceHasNonPayableLines(lines)).toBe(true);
    expect(invoiceHasNonPayableLines([line({ id: 3, is_payable: true })])).toBe(false);
  });
});
