import type { ProductFormTab } from "@/features/inventory/components/forms/ProductFormFields";
import type { CreateInventoryProductFormValues } from "@/features/inventory/schemas/product.schema";

export const PRODUCT_FORM_TABS = [
  { id: "general", label: "General" },
  { id: "pricing", label: "Pricing" },
  { id: "classification", label: "Classification" },
  { id: "availability", label: "Availability" },
] as const satisfies ReadonlyArray<{ id: ProductFormTab; label: string }>;

const generalTabFields: Array<keyof CreateInventoryProductFormValues> = [
  "name",
  "default_code",
  "barcode",
  "product_type",
];

const pricingTabFields: Array<keyof CreateInventoryProductFormValues> = [
  "list_price",
  "standard_price",
];

const classificationTabFields: Array<keyof CreateInventoryProductFormValues> = [
  "is_drug",
  "is_sundry",
  "liquid_or_cream",
  "is_lab_test",
  "is_procedure",
  "procedure_scope",
];

export function getProductFormTabForField(
  field: keyof CreateInventoryProductFormValues,
): ProductFormTab {
  if (generalTabFields.includes(field)) {
    return "general";
  }
  if (pricingTabFields.includes(field)) {
    return "pricing";
  }
  if (classificationTabFields.includes(field)) {
    return "classification";
  }
  return "availability";
}
