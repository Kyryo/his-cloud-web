import { describe, expect, it } from "vitest";

import type {
  InternalOrder,
  InventoryMovement,
  PurchaseOrder,
  StockAdjustment,
} from "@/features/inventory/types/inventory.types";
import {
  summarizeInternalOrders,
  summarizeMovements,
  summarizePurchaseOrders,
  summarizeStockAdjustments,
} from "@/features/inventory/utils/inventory-document-insights";

function createPurchaseOrder(
  overrides: Partial<PurchaseOrder> = {},
): PurchaseOrder {
  return {
    id: 1,
    uuid: "po-1",
    tenant: 1,
    reference_number: "PO-001",
    vendor_name: "MedSupply",
    vendor_id: 9,
    lpo_number: null,
    grn_number: null,
    delivery_date: "2026-09-10",
    invoice_number: null,
    invoice_date: null,
    receiving_location: 2,
    status: "DRAFT",
    created_by: 1,
    received_by: null,
    received_at: null,
    confirmed_by: null,
    confirmed_at: null,
    notes: null,
    total_value: 100,
    lines: [],
    is_active: true,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
    ...overrides,
  };
}

function createInternalOrder(
  overrides: Partial<InternalOrder> = {},
): InternalOrder {
  return {
    id: 1,
    uuid: "io-1",
    tenant: 1,
    reference_number: "IO-001",
    source_location: 1,
    source_location_name: "Main store",
    destination_location: 2,
    destination_location_name: "Pharmacy",
    status: "DRAFT",
    created_by: 1,
    created_by_name: "Ada",
    requested_by: null,
    approved_by: null,
    dispatched_by: null,
    received_by: null,
    approved_at: null,
    dispatched_at: null,
    received_at: null,
    notes: null,
    lines: [],
    is_active: true,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
    ...overrides,
  };
}

function createAdjustment(
  overrides: Partial<StockAdjustment> = {},
): StockAdjustment {
  return {
    id: 1,
    uuid: "adj-1",
    tenant: 1,
    reference_number: "ADJ-001",
    location: 2,
    location_name: "Main store",
    adjustment_type: "QUANTITY",
    status: "DRAFT",
    reason: "Count",
    created_by: 1,
    created_by_name: "Ada",
    approved_by: null,
    applied_by: null,
    approved_at: null,
    applied_at: null,
    notes: null,
    lines: [],
    is_active: true,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
    ...overrides,
  };
}

function createMovement(
  overrides: Partial<InventoryMovement> = {},
): InventoryMovement {
  return {
    id: 1,
    uuid: "mv-1",
    tenant: 1,
    movement_type: "PURCHASE_RECEIPT",
    reference_model: "purchase_order",
    reference_id: "1",
    product_id: 10,
    product_name: "Paracetamol 500mg",
    batch: 3,
    batch_number: "B-1",
    from_location: null,
    from_location_name: null,
    to_location: 2,
    to_location_name: "Main store",
    quantity: 12,
    unit_cost: 2,
    total_cost: 24,
    notes: null,
    created_at: "2026-09-01T00:00:00Z",
    ...overrides,
  };
}

describe("inventory-document-insights", () => {
  it("summarizes purchase orders from the current page", () => {
    const cards = summarizePurchaseOrders(
      [
        createPurchaseOrder({ status: "DRAFT", total_value: 40 }),
        createPurchaseOrder({
          uuid: "po-2",
          status: "CONFIRMED",
          total_value: 60,
        }),
      ],
      8,
    );

    expect(cards[0]).toMatchObject({ label: "Orders", value: 8 });
    expect(cards[1]).toMatchObject({ label: "Draft", value: 1 });
    expect(cards[2]).toMatchObject({ label: "Confirmed", value: 1 });
    expect(cards[3]).toMatchObject({ label: "Page value", value: 100 });
  });

  it("summarizes internal-order statuses on the page", () => {
    const cards = summarizeInternalOrders(
      [
        createInternalOrder({ status: "DRAFT" }),
        createInternalOrder({ uuid: "io-2", status: "DISPATCHED" }),
        createInternalOrder({ uuid: "io-3", status: "RECEIVED" }),
      ],
      12,
    );

    expect(cards.map((card) => [card.label, card.value])).toEqual([
      ["Orders", 12],
      ["Draft", 1],
      ["Dispatched", 1],
      ["Received", 1],
    ]);
  });

  it("summarizes stock adjustments by status and type", () => {
    const cards = summarizeStockAdjustments(
      [
        createAdjustment({ status: "DRAFT", adjustment_type: "QUANTITY" }),
        createAdjustment({
          uuid: "adj-2",
          status: "APPLIED",
          adjustment_type: "COST",
        }),
      ],
      5,
    );

    expect(cards.map((card) => [card.label, card.value])).toEqual([
      ["Adjustments", 5],
      ["Draft", 1],
      ["Applied", 1],
      ["Quantity", 1],
    ]);
  });

  it("summarizes movement products, locations, and inbound counts", () => {
    const cards = summarizeMovements(
      [
        createMovement(),
        createMovement({
          uuid: "mv-2",
          product_id: 11,
          movement_type: "INTERNAL_ORDER_OUT",
          from_location_name: "Main store",
          to_location_name: "Pharmacy",
        }),
      ],
      20,
    );

    expect(cards.map((card) => [card.label, card.value])).toEqual([
      ["Movements", 20],
      ["Products", 2],
      ["Locations", 2],
      ["Inbound", 1],
    ]);
  });
});
