import { describe, expect, it } from "vitest";

import {
  clinicalOrderSchema,
  encounterBillingModeSchema,
  nursingNoteSchema,
  prescriptionSchema,
} from "@/features/clinical-opd/schemas/clinical-opd.schema";
import {
  formatBillingModeLabel,
  getOrderItemTypesForCapabilities,
} from "@/features/clinical-opd/utils/clinical-order-item-types";

describe("clinical-opd schemas", () => {
  it("requires nursing note body", () => {
    const result = nursingNoteSchema.safeParse({ body: "" });
    expect(result.success).toBe(false);
  });

  it("accepts valid nursing note body", () => {
    const result = nursingNoteSchema.safeParse({ body: "Patient stable." });
    expect(result.success).toBe(true);
  });

  it("requires product_uuid and dual quantities on clinical orders", () => {
    const missingProduct = clinicalOrderSchema.safeParse({
      item_type: "LABORATORY",
      clinical_quantity: 1,
      clinical_uom: "Test",
      charge_quantity: 1,
    });
    expect(missingProduct.success).toBe(false);

    const missingClinicalQty = clinicalOrderSchema.safeParse({
      item_type: "LABORATORY",
      product_uuid: "11111111-1111-1111-1111-111111111111",
      clinical_uom: "Test",
      charge_quantity: 1,
    });
    expect(missingClinicalQty.success).toBe(false);

    const valid = clinicalOrderSchema.safeParse({
      item_type: "LABORATORY",
      product_uuid: "11111111-1111-1111-1111-111111111111",
      clinical_quantity: 1,
      clinical_uom: "Test",
      charge_quantity: 1,
    });
    expect(valid.success).toBe(true);
  });

  it("requires dual quantity fields on prescriptions", () => {
    const missingCharge = prescriptionSchema.safeParse({
      product_uuid: "11111111-1111-1111-1111-111111111111",
      clinical_quantity: 250,
      clinical_uom: "mL",
    });
    expect(missingCharge.success).toBe(false);

    const valid = prescriptionSchema.safeParse({
      product_uuid: "11111111-1111-1111-1111-111111111111",
      clinical_quantity: 250,
      clinical_uom: "mL",
      charge_quantity: 1,
    });
    expect(valid.success).toBe(true);
  });
});

describe("clinical order item type capabilities", () => {
  it("filters item types by capability", () => {
    const options = getOrderItemTypesForCapabilities([
      "order_laboratory",
      "order_procedure",
    ]);
    expect(options.map((option) => option.value)).toEqual([
      "LABORATORY",
      "PROCEDURE",
    ]);
  });
});

describe("encounter billing mode", () => {
  it("accepts shared and separate billing modes", () => {
    expect(
      encounterBillingModeSchema.safeParse({ billing_mode: "shared_visit" })
        .success,
    ).toBe(true);
    expect(
      encounterBillingModeSchema.safeParse({
        billing_mode: "separate_department",
      }).success,
    ).toBe(true);
    expect(
      encounterBillingModeSchema.safeParse({ billing_mode: "invalid" }).success,
    ).toBe(false);
  });

  it("formats billing mode labels", () => {
    expect(formatBillingModeLabel("shared_visit")).toBe(
      "One bill for this visit",
    );
    expect(formatBillingModeLabel("separate_department")).toBe(
      "Separate bill for this department",
    );
  });
});
