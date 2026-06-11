"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import { Form } from "@/components/ui/form";
import {
  ProductFormFields,
  type ProductFormTab,
} from "@/features/inventory/components/forms/ProductFormFields";
import { useProductFormEffects } from "@/features/inventory/hooks/use-product-form-effects";
import {
  createInventoryProductSchema,
  toInventoryProductFormValues,
  toUpdateInventoryProductPayload,
  type CreateInventoryProductFormValues,
} from "@/features/inventory/schemas/product.schema";
import { updateInventoryProduct } from "@/features/inventory/services/inventory.service";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import {
  getProductFormTabForField,
  PRODUCT_FORM_TABS,
} from "@/features/inventory/utils/product-form-tabs";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

type UpdateProductDialogProps = {
  product: InventoryProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (product: InventoryProduct) => void;
};

export function UpdateProductDialog({
  product,
  open,
  onOpenChange,
  onUpdated,
}: UpdateProductDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ProductFormTab>("general");

  const form = useForm<CreateInventoryProductFormValues>({
    resolver: zodResolver(createInventoryProductSchema),
    defaultValues: toInventoryProductFormValues(product),
  });

  const productType = form.watch("product_type");
  const isDrug = form.watch("is_drug");
  const isProcedure = form.watch("is_procedure");

  useProductFormEffects(form, { productType, isDrug, isProcedure });

  useEffect(() => {
    if (open) {
      setActiveTab("general");
      form.reset(toInventoryProductFormValues(product));
    }
  }, [form, open, product]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const updatedProduct = await updateInventoryProduct(
        product.id,
        toUpdateInventoryProductPayload(values),
      );
      toast({
        variant: "success",
        title: "Product updated",
        description: `${updatedProduct.display_name || updatedProduct.name} was saved.`,
      });
      onUpdated(updatedProduct);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        const errorFields = Object.keys(
          fieldErrors,
        ) as Array<keyof CreateInventoryProductFormValues>;

        for (const [field, message] of Object.entries(fieldErrors)) {
          form.setError(field as keyof CreateInventoryProductFormValues, {
            message,
          });
        }

        const firstField = errorFields[0];
        if (firstField) {
          setActiveTab(getProductFormTabForField(firstField));
        }

        toast({
          variant: "error",
          title: "Could not update product",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not update product",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <TabbedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Update product"
      description={`Edit details for ${product.display_name || product.name}.`}
      tabs={[...PRODUCT_FORM_TABS]}
      activeTab={activeTab}
      onTabChange={(tabId) => {
        if (
          tabId === "general" ||
          tabId === "pricing" ||
          tabId === "classification" ||
          tabId === "availability"
        ) {
          setActiveTab(tabId);
        }
      }}
      className={appFont.className}
      data-testid="update-product-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            form="update-product-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </PrimaryButton>
        </>
      }
    >
      <Form {...form}>
        <form
          id="update-product-form"
          className="space-y-4"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <ProductFormFields
            form={form}
            activeTab={activeTab}
            productType={productType}
            isDrug={isDrug}
            isProcedure={isProcedure}
            testIdPrefix="update-product"
          />
        </form>
      </Form>
    </TabbedDialog>
  );
}
