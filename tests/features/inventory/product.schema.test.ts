import { describe, expect, it } from "vitest";

import {
  createInventoryProductSchema,
  toCreateInventoryProductPayload,
  toInventoryProductFormValues,
  toUpdateInventoryProductPayload,
} from "@/features/inventory/schemas/product.schema";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";

describe("product.schema", () => {
  it("requires a product name", () => {
    const result = createInventoryProductSchema.safeParse({
      name: "",
      default_code: "",
      barcode: "",
      product_type: "product",
      list_price: "",
      standard_price: "",
      is_drug: false,
      is_sundry: false,
      liquid_or_cream: false,
      is_lab_test: false,
      is_procedure: false,
      procedure_scope: "",
      sale_ok: true,
      purchase_ok: true,
      active: true,
    });

    expect(result.success).toBe(false);
  });

  it("rejects liquid or cream without drug flag", () => {
    const result = createInventoryProductSchema.safeParse({
      name: "Test",
      default_code: "",
      barcode: "",
      product_type: "product",
      list_price: "",
      standard_price: "",
      is_drug: false,
      liquid_or_cream: true,
      is_procedure: false,
      procedure_scope: "",
      sale_ok: true,
      purchase_ok: true,
      active: true,
    });

    expect(result.success).toBe(false);
  });

  it("requires procedure scope when marked as procedure", () => {
    const result = createInventoryProductSchema.safeParse({
      name: "Consultation",
      default_code: "",
      barcode: "",
      product_type: "service",
      list_price: "",
      standard_price: "",
      is_drug: false,
      is_sundry: false,
      liquid_or_cream: false,
      is_procedure: true,
      procedure_scope: "",
      sale_ok: true,
      purchase_ok: true,
      active: true,
    });

    expect(result.success).toBe(false);
  });

  it("maps form values to API payload", () => {
    const payload = toCreateInventoryProductPayload({
      name: " Ibuprofen ",
      default_code: " IBU ",
      barcode: "",
      product_type: "product",
      list_price: "10.5",
      standard_price: "",
      is_drug: true,
      is_sundry: false,
      liquid_or_cream: false,
      is_lab_test: false,
      is_procedure: false,
      procedure_scope: "",
      sale_ok: true,
      purchase_ok: false,
      active: true,
    });

    expect(payload).toEqual({
      name: "Ibuprofen",
      default_code: "IBU",
      list_price: 10.5,
      product_type: "product",
      is_drug: true,
      is_sundry: false,
      liquid_or_cream: false,
      is_lab_test: false,
      is_procedure: false,
      dental_only_procedure: false,
      opd_only_procedure: false,
      ipd_only_procedure: false,
      physio_only_procedure: false,
      clinic_wide_procedure: false,
      sale_ok: true,
      purchase_ok: false,
      active: true,
    });
  });

  it("sends empty optional text fields on update payload", () => {
    const payload = toUpdateInventoryProductPayload({
      name: "Paracetamol",
      default_code: "",
      barcode: "",
      product_type: "product",
      list_price: "",
      standard_price: "",
      is_drug: false,
      is_sundry: false,
      liquid_or_cream: false,
      is_lab_test: false,
      is_procedure: false,
      procedure_scope: "",
      sale_ok: true,
      purchase_ok: true,
      active: true,
    });

    expect(payload.default_code).toBe("");
    expect(payload.barcode).toBe("");
    expect(payload).not.toHaveProperty("list_price");
  });

  it("maps procedure scope to flags", () => {
    const payload = toCreateInventoryProductPayload({
      name: "Dental cleaning",
      default_code: "",
      barcode: "",
      product_type: "service",
      list_price: "",
      standard_price: "",
      is_drug: false,
      is_sundry: false,
      liquid_or_cream: false,
      is_lab_test: false,
      is_procedure: true,
      procedure_scope: "dental_only",
      sale_ok: true,
      purchase_ok: false,
      active: true,
    });

    expect(payload.dental_only_procedure).toBe(true);
    expect(payload.opd_only_procedure).toBe(false);
    expect(payload.is_procedure).toBe(true);
    expect(payload.is_lab_test).toBe(false);
  });

  it("accepts empty optional text fields on update", () => {
    const result = createInventoryProductSchema.safeParse({
      name: "Paracetamol",
      default_code: "",
      barcode: "",
      product_type: "product",
      list_price: "",
      standard_price: "",
      is_drug: false,
      is_sundry: false,
      liquid_or_cream: false,
      is_lab_test: false,
      is_procedure: false,
      procedure_scope: "",
      sale_ok: true,
      purchase_ok: true,
      active: true,
    });

    expect(result.success).toBe(true);
  });

  it("normalizes null optional fields", () => {
    const result = createInventoryProductSchema.safeParse({
      name: "Paracetamol",
      default_code: null,
      barcode: null,
      product_type: "product",
      list_price: "",
      standard_price: "",
      is_drug: false,
      is_sundry: false,
      liquid_or_cream: false,
      is_lab_test: false,
      is_procedure: false,
      procedure_scope: "",
      sale_ok: true,
      purchase_ok: true,
      active: true,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.default_code).toBe("");
      expect(result.data.barcode).toBe("");
    }
  });

  it("rejects drug flag on non-storable products", () => {
    const result = createInventoryProductSchema.safeParse({
      name: "Consultation",
      default_code: "",
      barcode: "",
      product_type: "service",
      list_price: "",
      standard_price: "",
      is_drug: true,
      is_sundry: false,
      liquid_or_cream: false,
      is_lab_test: false,
      is_procedure: false,
      procedure_scope: "",
      sale_ok: true,
      purchase_ok: true,
      active: true,
    });

    expect(result.success).toBe(false);
  });

  it("rejects drug and sundry together", () => {
    const result = createInventoryProductSchema.safeParse({
      name: "Bandage",
      default_code: "",
      barcode: "",
      product_type: "product",
      list_price: "",
      standard_price: "",
      is_drug: true,
      is_sundry: true,
      liquid_or_cream: false,
      is_lab_test: false,
      is_procedure: false,
      procedure_scope: "",
      sale_ok: true,
      purchase_ok: true,
      active: true,
    });

    expect(result.success).toBe(false);
  });

  it("rejects sundry flag on non-storable products", () => {
    const result = createInventoryProductSchema.safeParse({
      name: "Consultation",
      default_code: "",
      barcode: "",
      product_type: "service",
      list_price: "",
      standard_price: "",
      is_drug: false,
      is_sundry: true,
      liquid_or_cream: false,
      is_lab_test: false,
      is_procedure: false,
      procedure_scope: "",
      sale_ok: true,
      purchase_ok: true,
      active: true,
    });

    expect(result.success).toBe(false);
  });

  it("rejects procedure and lab test together", () => {
    const result = createInventoryProductSchema.safeParse({
      name: "CBC",
      default_code: "",
      barcode: "",
      product_type: "service",
      list_price: "",
      standard_price: "",
      is_drug: false,
      is_sundry: false,
      liquid_or_cream: false,
      is_lab_test: true,
      is_procedure: true,
      procedure_scope: "opd_only",
      sale_ok: true,
      purchase_ok: true,
      active: true,
    });

    expect(result.success).toBe(false);
  });

  it("rejects lab test flag on non-service products", () => {
    const result = createInventoryProductSchema.safeParse({
      name: "Paracetamol",
      default_code: "",
      barcode: "",
      product_type: "product",
      list_price: "",
      standard_price: "",
      is_drug: false,
      is_sundry: false,
      liquid_or_cream: false,
      is_lab_test: true,
      is_procedure: false,
      procedure_scope: "",
      sale_ok: true,
      purchase_ok: true,
      active: true,
    });

    expect(result.success).toBe(false);
  });

  it("maps API product to update form values", () => {
    const product: InventoryProduct = {
      uuid: "22222222-2222-2222-2222-222222222222",
      name: "Consultation",
      display_name: "Consultation",
      default_code: "CONS",
      barcode: null,
      list_price: 50,
      standard_price: 20,
      uom_name: "Unit",
      is_active: true,
      product_type: "service",
      product_type_label: "service",
      sale_ok: true,
      purchase_ok: false,
      metadata: {
        is_procedure: true,
        opd_only_procedure: true,
      },
    };

    expect(
      toInventoryProductFormValues({
        ...product,
        default_code: null,
        barcode: null,
      }),
    ).toMatchObject({
      default_code: "",
      barcode: "",
    });

    expect(toInventoryProductFormValues(product)).toMatchObject({
      name: "Consultation",
      default_code: "CONS",
      product_type: "service",
      list_price: "50",
      standard_price: "20",
      is_procedure: true,
      procedure_scope: "opd_only",
      purchase_ok: false,
    });
  });
});
