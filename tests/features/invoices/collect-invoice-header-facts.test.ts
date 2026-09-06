import { describe, expect, it } from "vitest";

import type { Invoice } from "@/features/invoices/types/invoice.types";
import { collectInvoiceHeaderFacts } from "@/features/invoices/utils/collect-invoice-header-facts";

describe("collectInvoiceHeaderFacts", () => {
  it("includes payer, membership, and pricelist", () => {
    const facts = collectInvoiceHeaderFacts({
      insurance_company: "MASM",
      insurance_scheme_name: "Executive",
      insurance_number: "MEM-4411",
      pricelist_name: "MASM Outpatient",
      lines: [],
    } as Invoice);

    expect(facts).toEqual(
      expect.arrayContaining([
        { key: "payer", label: "Payer", value: "MASM - Executive" },
        { key: "membership", label: "Membership", value: "MEM-4411" },
        { key: "pricelist", label: "Pricelist", value: "MASM Outpatient" },
        { key: "rules", label: "Rules", value: "List price" },
      ]),
    );
  });
});
