import { describe, expect, it } from "vitest";

import type { SalesOrderLineDraft } from "@/features/sales-orders/types/sales-order-line-draft";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import {
  getLineSplitMismatch,
  getSalesOrderSplitMismatchKeys,
  hasSavedSplitMismatch,
} from "@/features/sales-orders/utils/sales-order-line-split-mismatch";

function buildCoPaymentDraft(
  overrides: Partial<SalesOrderLineDraft> = {},
): SalesOrderLineDraft {
  return {
    key: "line-1",
    id: 1,
    product_id: 10,
    productName: "Consultation",
    quantity: "1",
    price_unit: "100",
    originalPriceUnit: "100",
    client_due: "20",
    insurer_due: "80",
    isCoPayment: true,
    ...overrides,
  };
}

describe("sales-order-line-split-mismatch", () => {
  it("returns null for non co-payment lines", () => {
    const draft = buildCoPaymentDraft({ isCoPayment: false, price_unit: "120" });

    expect(getLineSplitMismatch(draft)).toBeNull();
  });

  it("returns null for new lines without a saved id", () => {
    const draft = buildCoPaymentDraft({ id: undefined, price_unit: "120" });

    expect(getLineSplitMismatch(draft)).toBeNull();
  });

  it("returns null when the unit price has not changed", () => {
    expect(getLineSplitMismatch(buildCoPaymentDraft())).toBeNull();
  });

  it("detects a mismatch after the unit price changes", () => {
    const mismatch = getLineSplitMismatch(
      buildCoPaymentDraft({ price_unit: "120" }),
    );

    expect(mismatch).toEqual({
      newTotal: 120,
      splitTotal: 100,
      delta: -20,
    });
  });

  it("returns null when adjusted values reconcile the new total", () => {
    const draft = buildCoPaymentDraft({
      price_unit: "120",
      adjustedClientDue: "40",
      adjustedInsurerDue: "80",
    });

    expect(getLineSplitMismatch(draft)).toBeNull();
  });

  it("treats values within rounding tolerance as reconciled", () => {
    const draft = buildCoPaymentDraft({
      price_unit: "120",
      adjustedClientDue: "40.005",
      adjustedInsurerDue: "79.995",
    });

    expect(getLineSplitMismatch(draft)).toBeNull();
  });

  it("collects mismatched line keys", () => {
    const keys = getSalesOrderSplitMismatchKeys([
      buildCoPaymentDraft({ key: "line-1", price_unit: "120" }),
      buildCoPaymentDraft({
        key: "line-2",
        price_unit: "120",
        adjustedClientDue: "40",
        adjustedInsurerDue: "80",
      }),
    ]);

    expect(keys).toEqual(new Set(["line-1"]));
  });

  it("detects saved split mismatches on orders", () => {
    const order = {
      lines: [
        {
          id: 1,
          name: "Consultation",
          product_id: 10,
          quantity: "1",
          price_unit: "120",
          price_total: "120",
          client_due: "20",
          insurer_due: "80",
          pricing_rule_snapshot: { rule_types: ["CO_PAYMENT"] },
        },
      ],
    } as SalesOrder;

    expect(hasSavedSplitMismatch(order)).toBe(true);
  });

  it("returns false when saved lines reconcile", () => {
    const order = {
      lines: [
        {
          id: 1,
          name: "Consultation",
          product_id: 10,
          quantity: "1",
          price_unit: "100",
          price_total: "100",
          client_due: "20",
          insurer_due: "80",
          pricing_rule_snapshot: { rule_types: ["CO_PAYMENT"] },
        },
      ],
    } as SalesOrder;

    expect(hasSavedSplitMismatch(order)).toBe(false);
  });
});
