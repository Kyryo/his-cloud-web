import { z } from "zod";

import type { CreateInventoryProductPayload } from "@/features/inventory/services/inventory.service";
import type {
  InventoryProduct,
  InventoryProductMeta,
} from "@/features/inventory/types/inventory.types";

export const INVENTORY_PRODUCT_TYPE_OPTIONS = [
  { value: "product", label: "Storable product" },
  { value: "consu", label: "Consumable" },
  { value: "service", label: "Service" },
] as const;

export const INVENTORY_PROCEDURE_SCOPE_OPTIONS = [
  { value: "dental_only", label: "Dental only" },
  { value: "opd_only", label: "OPD only" },
  { value: "ipd_only", label: "IPD only" },
  { value: "physio_only", label: "Physio only" },
  { value: "clinic_wide", label: "Clinic-wide" },
] as const;

export type InventoryProductType =
  (typeof INVENTORY_PRODUCT_TYPE_OPTIONS)[number]["value"];

export type InventoryProcedureScope =
  (typeof INVENTORY_PROCEDURE_SCOPE_OPTIONS)[number]["value"];

const optionalPriceField = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || !Number.isNaN(Number(value)),
    "Enter a valid number",
  )
  .refine(
    (value) => value === "" || Number(value) >= 0,
    "Must be 0 or greater",
  );

/** Odoo returns `false` for empty char fields — normalize before string validation. */
const optionalTextField = z.preprocess(
  (value) => (value === false || value === null || value === undefined ? "" : value),
  z.string().trim(),
);

export const createInventoryProductGeneralSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  default_code: optionalTextField,
  barcode: optionalTextField,
  product_type: z.enum(["product", "consu", "service"]),
});

export const createInventoryProductPricingSchema = z.object({
  list_price: optionalPriceField,
  standard_price: optionalPriceField,
});

export const createInventoryProductClassificationSchema = z.object({
  is_drug: z.boolean(),
  liquid_or_cream: z.boolean(),
  is_procedure: z.boolean(),
  procedure_scope: z.enum([
    "",
    "dental_only",
    "opd_only",
    "ipd_only",
    "physio_only",
    "clinic_wide",
  ]),
});

export const createInventoryProductAvailabilitySchema = z.object({
  sale_ok: z.boolean(),
  purchase_ok: z.boolean(),
  active: z.boolean(),
});

export const createInventoryProductSchema = createInventoryProductGeneralSchema
  .merge(createInventoryProductPricingSchema)
  .merge(createInventoryProductClassificationSchema)
  .merge(createInventoryProductAvailabilitySchema)
  .superRefine((values, context) => {
    if (values.liquid_or_cream && !values.is_drug) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Only drug products can be liquid or cream.",
        path: ["liquid_or_cream"],
      });
    }

    if (values.is_procedure && values.product_type !== "service") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Only service products can be procedures.",
        path: ["is_procedure"],
      });
    }

    if (values.is_procedure && !values.procedure_scope) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select exactly one procedure scope.",
        path: ["procedure_scope"],
      });
    }

    if (!values.is_procedure && values.procedure_scope) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Procedure scope can only be set for procedures.",
        path: ["procedure_scope"],
      });
    }
  });

export type CreateInventoryProductGeneralFormValues = z.infer<
  typeof createInventoryProductGeneralSchema
>;

export type CreateInventoryProductPricingFormValues = z.infer<
  typeof createInventoryProductPricingSchema
>;

export type CreateInventoryProductClassificationFormValues = z.infer<
  typeof createInventoryProductClassificationSchema
>;

export type CreateInventoryProductAvailabilityFormValues = z.infer<
  typeof createInventoryProductAvailabilitySchema
>;

export type CreateInventoryProductFormValues = z.infer<
  typeof createInventoryProductSchema
>;

export const createInventoryProductDefaultValues: CreateInventoryProductFormValues =
  {
    name: "",
    default_code: "",
    barcode: "",
    product_type: "product",
    list_price: "",
    standard_price: "",
    is_drug: false,
    liquid_or_cream: false,
    is_procedure: false,
    procedure_scope: "",
    sale_ok: true,
    purchase_ok: true,
    active: true,
  };

function parseOptionalPrice(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  return Number(trimmed);
}

function procedureScopeToFlags(scope: CreateInventoryProductFormValues["procedure_scope"]) {
  return {
    dental_only_procedure: scope === "dental_only",
    opd_only_procedure: scope === "opd_only",
    ipd_only_procedure: scope === "ipd_only",
    physio_only_procedure: scope === "physio_only",
    clinic_wide_procedure: scope === "clinic_wide",
  };
}

export function toCreateInventoryProductPayload(
  values: CreateInventoryProductFormValues,
) {
  const payload: CreateInventoryProductPayload = {
    name: values.name.trim(),
    product_type: values.product_type,
    sale_ok: values.sale_ok,
    purchase_ok: values.purchase_ok,
    active: values.active,
    is_drug: values.is_drug,
    liquid_or_cream: values.liquid_or_cream,
    is_procedure: values.is_procedure,
    ...procedureScopeToFlags(values.procedure_scope),
  };

  const defaultCode = values.default_code.trim();
  if (defaultCode) {
    payload.default_code = defaultCode;
  }

  const barcode = values.barcode.trim();
  if (barcode) {
    payload.barcode = barcode;
  }

  const listPrice = parseOptionalPrice(values.list_price);
  if (listPrice !== undefined) {
    payload.list_price = listPrice;
  }

  const standardPrice = parseOptionalPrice(values.standard_price);
  if (standardPrice !== undefined) {
    payload.standard_price = standardPrice;
  }

  return payload;
}

export function toUpdateInventoryProductPayload(
  values: CreateInventoryProductFormValues,
) {
  return {
    ...toCreateInventoryProductPayload(values),
    default_code: values.default_code.trim(),
    barcode: values.barcode.trim(),
  };
}

function normalizeProductType(
  productType: InventoryProduct["product_type"],
): CreateInventoryProductFormValues["product_type"] {
  if (productType === "consu" || productType === "service") {
    return productType;
  }
  return "product";
}

function formatPriceField(
  value: InventoryProduct["list_price"],
): CreateInventoryProductFormValues["list_price"] {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  return String(value);
}

function formatOptionalTextField(
  value: string | false | null | undefined,
): string {
  if (value === false || value === null || value === undefined) {
    return "";
  }
  return String(value);
}

export function procedureScopeFromMeta(
  meta: InventoryProductMeta,
): CreateInventoryProductFormValues["procedure_scope"] {
  if (meta.clinic_wide_procedure) {
    return "clinic_wide";
  }
  if (meta.dental_only_procedure) {
    return "dental_only";
  }
  if (meta.opd_only_procedure) {
    return "opd_only";
  }
  if (meta.ipd_only_procedure) {
    return "ipd_only";
  }
  if (meta.physio_only_procedure) {
    return "physio_only";
  }
  return "";
}

export function toInventoryProductFormValues(
  product: InventoryProduct,
): CreateInventoryProductFormValues {
  const meta = product.x_meta ?? {};

  return {
    name: product.display_name || product.name || "",
    default_code: formatOptionalTextField(product.default_code),
    barcode: formatOptionalTextField(product.barcode),
    product_type: normalizeProductType(product.product_type),
    list_price: formatPriceField(product.list_price),
    standard_price: formatPriceField(product.standard_price),
    is_drug: Boolean(meta.is_drug),
    liquid_or_cream: Boolean(meta.liquid_or_cream),
    is_procedure: Boolean(meta.is_procedure),
    procedure_scope: procedureScopeFromMeta(meta),
    sale_ok: product.sale_ok ?? true,
    purchase_ok: product.purchase_ok ?? true,
    active: product.active,
  };
}
