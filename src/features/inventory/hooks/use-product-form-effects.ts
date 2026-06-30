import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { CreateInventoryProductFormValues } from "@/features/inventory/schemas/product.schema";

export function useProductFormEffects(
  form: UseFormReturn<CreateInventoryProductFormValues>,
  options: {
    productType: CreateInventoryProductFormValues["product_type"];
    isDrug: boolean;
    isSundry: boolean;
    isLabTest: boolean;
    isProcedure: boolean;
  },
) {
  const { productType, isDrug, isSundry, isLabTest, isProcedure } = options;

  useEffect(() => {
    if (productType === "product") {
      return;
    }

    if (form.getValues("is_drug")) {
      form.setValue("is_drug", false);
    }
    if (form.getValues("is_sundry")) {
      form.setValue("is_sundry", false);
    }
    form.setValue("liquid_or_cream", false);
  }, [form, productType]);

  useEffect(() => {
    if (productType === "service") {
      return;
    }

    if (form.getValues("is_procedure")) {
      form.setValue("is_procedure", false);
      form.setValue("procedure_scope", "");
    }
    if (form.getValues("is_lab_test")) {
      form.setValue("is_lab_test", false);
    }
  }, [form, productType]);

  useEffect(() => {
    if (isDrug) {
      form.setValue("is_sundry", false);
    }
  }, [form, isDrug]);

  useEffect(() => {
    if (!isSundry) {
      return;
    }

    form.setValue("is_drug", false);
    form.setValue("liquid_or_cream", false);
  }, [form, isSundry]);

  useEffect(() => {
    if (!isDrug) {
      form.setValue("liquid_or_cream", false);
    }
  }, [form, isDrug]);

  useEffect(() => {
    if (isProcedure) {
      form.setValue("is_lab_test", false);
    }
  }, [form, isProcedure]);

  useEffect(() => {
    if (isLabTest) {
      form.setValue("is_procedure", false);
      form.setValue("procedure_scope", "");
    }
  }, [form, isLabTest]);

  useEffect(() => {
    if (!isProcedure) {
      form.setValue("procedure_scope", "");
    }
  }, [form, isProcedure]);
}
