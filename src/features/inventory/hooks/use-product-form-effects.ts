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
    isRadiology: boolean;
    isProcedure: boolean;
  },
) {
  const { productType, isDrug, isSundry, isLabTest, isRadiology, isProcedure } =
    options;

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
    if (form.getValues("is_radiology")) {
      form.setValue("is_radiology", false);
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
      form.setValue("is_radiology", false);
    }
  }, [form, isProcedure]);

  useEffect(() => {
    if (isLabTest) {
      form.setValue("is_procedure", false);
      form.setValue("is_radiology", false);
      form.setValue("procedure_scope", "");
    }
  }, [form, isLabTest]);

  useEffect(() => {
    if (isRadiology) {
      form.setValue("is_procedure", false);
      form.setValue("is_lab_test", false);
      form.setValue("procedure_scope", "");
    }
  }, [form, isRadiology]);

  useEffect(() => {
    if (productType !== "service") {
      return;
    }
    if (form.getValues("purchase_ok")) {
      form.setValue("purchase_ok", false);
    }
  }, [form, productType]);

  useEffect(() => {
    if (!isProcedure) {
      form.setValue("procedure_scope", "");
    }
  }, [form, isProcedure]);
}
