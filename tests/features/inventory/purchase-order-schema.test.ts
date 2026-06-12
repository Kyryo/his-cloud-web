import { describe, expect, it } from "vitest";

import {
  countPurchaseOrderStepErrors,
  createPurchaseOrderDefaultValues,
  purchaseOrderDetailsStepFields,
  purchaseOrderReferencesStepFields,
  resolvePurchaseOrderErrorStep,
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

describe("resolvePurchaseOrderErrorStep", () => {
  it("lands on details when details fields have errors", () => {
    expect(
      resolvePurchaseOrderErrorStep({
        vendor_name: { message: "Required" },
        lpo_number: { message: "Invalid" },
      }),
    ).toBe("details");
  });

  it("lands on references when only reference fields have errors", () => {
    expect(
      resolvePurchaseOrderErrorStep({
        lpo_number: { message: "Invalid" },
      }),
    ).toBe("references");
  });

  it("counts step errors separately", () => {
    expect(
      countPurchaseOrderStepErrors(
        { vendor_name: { message: "Required" } },
        purchaseOrderDetailsStepFields,
      ),
    ).toBe(1);
    expect(
      countPurchaseOrderStepErrors(
        { notes: { message: "Too long" } },
        purchaseOrderReferencesStepFields,
      ),
    ).toBe(1);
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
