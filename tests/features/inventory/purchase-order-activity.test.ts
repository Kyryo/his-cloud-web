import { describe, expect, it } from "vitest";

import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";
import { buildPurchaseOrderActivityItems } from "@/features/inventory/utils/purchase-order-activity";

function createOrder(overrides: Partial<PurchaseOrder> = {}): PurchaseOrder {
  return {
    id: 1,
    uuid: "po-1",
    tenant: 1,
    reference_number: "PO-001",
    vendor_name: "Acme Supplies",
    vendor_id: null,
    lpo_number: null,
    grn_number: null,
    delivery_date: null,
    invoice_number: null,
    invoice_date: null,
    receiving_location: 1,
    status: "DRAFT",
    created_by: null,
    received_by: null,
    received_at: null,
    confirmed_by: null,
    confirmed_at: null,
    notes: null,
    total_value: "0",
    lines: [],
    is_active: true,
    created_at: "2026-01-01T10:00:00Z",
    updated_at: "2026-01-01T10:00:00Z",
    ...overrides,
  };
}

describe("buildPurchaseOrderActivityItems", () => {
  it("includes created and submitted events for submitted orders", () => {
    const items = buildPurchaseOrderActivityItems(
      createOrder({
        status: "SUBMITTED",
        updated_at: "2026-01-02T10:00:00Z",
      }),
    );

    expect(items.some((item) => item.title === "Purchase order created")).toBe(true);
    expect(items.some((item) => item.title === "Submitted for review")).toBe(true);
  });

  it("includes confirmed and notes events when present", () => {
    const items = buildPurchaseOrderActivityItems(
      createOrder({
        status: "CONFIRMED",
        confirmed_at: "2026-01-03T10:00:00Z",
        notes: "Handle with care",
        updated_at: "2026-01-03T11:00:00Z",
      }),
    );

    expect(items.some((item) => item.title === "Purchase order confirmed")).toBe(true);
    expect(items.some((item) => item.title === "Notes updated")).toBe(true);
  });
});
