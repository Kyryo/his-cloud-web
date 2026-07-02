import { describe, expect, it } from "vitest";

import { collectInvoicePaymentRules } from "@/features/invoices/utils/collect-invoice-payment-rules";
import type { InvoiceLine } from "@/features/invoices/types/invoice.types";

function createLine(
  overrides: Partial<InvoiceLine> = {},
): InvoiceLine {
  return {
    id: 1,
    name: "Consultation",
    product_id: 10,
    product_name: "Consultation",
    quantity: "1",
    price_unit: "10000",
    price_subtotal: "10000",
    price_total: "10000",
    is_payable: true,
    ...overrides,
  };
}

describe("collectInvoicePaymentRules", () => {
  it("returns unique payment rules from line snapshots", () => {
    const rules = collectInvoicePaymentRules([
      createLine({
        id: 1,
        pricing_rule_snapshot: {
          rule_uuid: "rule-1",
          rule_name: "MASM Co-pay",
          rule_types: ["CO_PAYMENT"],
        },
      }),
      createLine({
        id: 2,
        pricing_rule_snapshot: {
          rule_uuid: "rule-1",
          rule_name: "MASM Co-pay",
          rule_types: ["CO_PAYMENT"],
        },
      }),
      createLine({
        id: 3,
        pricing_rule_snapshot: {
          rule_uuid: "rule-2",
          rule_name: "Excess rule",
          rule_types: ["EXCESS"],
        },
      }),
    ]);

    expect(rules).toHaveLength(2);
    expect(rules[0]?.ruleName).toBe("MASM Co-pay");
    expect(rules[0]?.ruleTypesLabel).toBe("Co-payment");
    expect(rules[1]?.ruleName).toBe("Excess rule");
    expect(rules[1]?.ruleTypesLabel).toBe("Excess");
  });

  it("returns an empty list when no snapshots include rule names", () => {
    expect(collectInvoicePaymentRules([createLine()])).toEqual([]);
    expect(collectInvoicePaymentRules(undefined)).toEqual([]);
  });
});
