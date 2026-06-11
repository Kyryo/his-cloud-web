import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { CreateInventoryProductFormValues } from "@/features/inventory/schemas/product.schema";

export function useProductFormEffects(
  form: UseFormReturn<CreateInventoryProductFormValues>,
  options: {
    productType: CreateInventoryProductFormValues["product_type"];
    isDrug: boolean;
    isProcedure: boolean;
  },
) {
  const { productType, isDrug, isProcedure } = options;

  useEffect(() => {
    if (productType !== "service" && isProcedure) {
      form.setValue("is_procedure", false);
      form.setValue("procedure_scope", "");
    }
  }, [form, isProcedure, productType]);

  useEffect(() => {
    if (!isDrug) {
      form.setValue("liquid_or_cream", false);
    }
  }, [form, isDrug]);

  useEffect(() => {
    if (!isProcedure) {
      form.setValue("procedure_scope", "");
    }
  }, [form, isProcedure]);
}
