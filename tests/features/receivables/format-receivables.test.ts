import { describe, expect, it } from "vitest";

import type { ReceivablesDebtor } from "@/features/receivables/types/receivables.types";
import {
  formatReceivablesAgingLabel,
  formatReceivablesDaysOutstanding,
  formatReceivablesIdentifier,
  getReceivablesDueSource,
} from "@/features/receivables/utils/format-receivables";

function debtor(
  overrides: Partial<ReceivablesDebtor> = {},
): ReceivablesDebtor {
  return {
    customer_uuid: "cust-1",
    customer_identifier: "CLINIC-000101",
    customer_name: "Ada Lovelace",
    opening_balance: "0.00",
    total_invoiced: "0.00",
    total_paid: "0.00",
    total_due: "0.00",
    ...overrides,
  };
}

describe("format receivables", () => {
  it("shortens clinic-prefixed identifiers", () => {
    expect(
      formatReceivablesIdentifier("DRANTHONYS_DENTAL_CLINIC-000101"),
    ).toBe("000101");
    expect(formatReceivablesIdentifier("")).toBe("No ID");
  });

  it("labels aging buckets and days outstanding", () => {
    expect(formatReceivablesAgingLabel("31-60")).toBe("31–60 days");
    expect(formatReceivablesDaysOutstanding(0)).toBe("0 days");
    expect(formatReceivablesDaysOutstanding(1)).toBe("1 day");
  });

  it("describes how a debtor balance was formed", () => {
    expect(
      getReceivablesDueSource(debtor({ opening_balance: "100.00" })),
    ).toBe("Opening balance");
    expect(
      getReceivablesDueSource(debtor({ total_invoiced: "80.00" })),
    ).toBe("Invoices");
    expect(
      getReceivablesDueSource(
        debtor({ opening_balance: "100.00", total_invoiced: "20.00" }),
      ),
    ).toBe("Opening + invoices");
  });
});
