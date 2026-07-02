import { describe, expect, it } from "vitest";

import { formatInvoiceStateLabel } from "@/features/invoices/utils/invoice-status";

describe("formatInvoiceStateLabel", () => {
  it("maps posted state to Invoiced", () => {
    expect(formatInvoiceStateLabel("posted")).toBe("Invoiced");
  });

  it("title-cases other states", () => {
    expect(formatInvoiceStateLabel("draft")).toBe("Draft");
    expect(formatInvoiceStateLabel("cancel")).toBe("Cancel");
  });
});
