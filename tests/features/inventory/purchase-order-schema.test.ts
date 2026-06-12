import { describe, expect, it } from "vitest";

import {
  createPurchaseOrderDefaultValues,
  toCreatePurchaseOrderPayload,
} from "@/features/inventory/schemas/purchase-order.schema";

describe("createPurchaseOrderDefaultValues", () => {
  it("returns empty form defaults", () => {
    expect(createPurchaseOrderDefaultValues()).toEqual({
      vendor_name: "",
      receiving_location: 0,
      lpo_number: "",
      grn_number: "",
      delivery_date: "",
      invoice_number: "",
      invoice_date: "",
      notes: "",
    });
  });
});

describe("toCreatePurchaseOrderPayload", () => {
  it("maps form values to create payload with empty lines", () => {
    expect(
      toCreatePurchaseOrderPayload({
        vendor_name: " Acme ",
        receiving_location: 3,
        lpo_number: " LPO-1 ",
        grn_number: "",
        delivery_date: "2026-06-01",
        invoice_number: "",
        invoice_date: "",
        notes: " Rush ",
      }),
    ).toEqual({
      vendor_name: "Acme",
      receiving_location: 3,
      lpo_number: "LPO-1",
      grn_number: null,
      delivery_date: "2026-06-01",
      invoice_number: null,
      invoice_date: null,
      notes: "Rush",
      lines: [],
    });
  });
});
