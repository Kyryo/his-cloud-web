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
  createInventoryProductDefaultValues,
  createInventoryProductSchema,
  toCreateInventoryProductPayload,
  type CreateInventoryProductFormValues,
} from "@/features/inventory/schemas/product.schema";
import { createInventoryProduct } from "@/features/inventory/services/inventory.service";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import {
  getProductFormTabForField,
  PRODUCT_FORM_TABS,
} from "@/features/inventory/utils/product-form-tabs";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

type CreateProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (product: InventoryProduct) => void;
};

export function CreateProductDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateProductDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ProductFormTab>("general");

  const form = useForm<CreateInventoryProductFormValues>({
    resolver: zodResolver(createInventoryProductSchema),
    defaultValues: createInventoryProductDefaultValues,
  });

  const productType = form.watch("product_type");
  const isDrug = form.watch("is_drug");
  const isSundry = form.watch("is_sundry");
  const isLabTest = form.watch("is_lab_test");
  const isProcedure = form.watch("is_procedure");

  useProductFormEffects(form, {
    productType,
    isDrug,
    isSundry,
    isLabTest,
    isProcedure,
  });

  useEffect(() => {
    if (!open) {
      setActiveTab("general");
      form.reset(createInventoryProductDefaultValues);
    }
  }, [form, open]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const createdProduct = await createInventoryProduct(
        toCreateInventoryProductPayload(values),
      );
      toast({
        variant: "success",
        title: "Product created",
        description: `${createdProduct.display_name || createdProduct.name} was added to ERP.`,
      });
      onCreated(createdProduct);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        const errorFields = Object.keys(
          fieldErrors,
        ) as Array<keyof CreateInventoryProductFormValues>;

        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in createInventoryProductDefaultValues) {
            form.setError(field as keyof CreateInventoryProductFormValues, {
              message,
            });
          }
        }

        const firstField = errorFields.find(
          (field) => field in createInventoryProductDefaultValues,
        );
        if (firstField) {
          setActiveTab(getProductFormTabForField(firstField));
        }

        toast({
          variant: "error",
          title: "Could not create product",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not create product",
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
      title="New product"
      description="Create a product in ERP. It will be available for stock, orders, and dispensing."
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
      data-testid="create-product-dialog"
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
            form="create-product-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Creating...
              </>
            ) : (
              "Create product"
            )}
          </PrimaryButton>
        </>
      }
    >
      <Form {...form}>
        <form
          id="create-product-form"
          className="space-y-4"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <ProductFormFields
            form={form}
            activeTab={activeTab}
            productType={productType}
            isDrug={isDrug}
            isProcedure={isProcedure}
            testIdPrefix="create-product"
          />
        </form>
      </Form>
    </TabbedDialog>
  );
}
