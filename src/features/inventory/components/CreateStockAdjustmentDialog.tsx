"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Form } from "@/components/ui/form";
import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import { InventoryNoLocationsAlert } from "@/features/inventory/components/InventoryNoLocationsAlert";
import { StockAdjustmentFormContent } from "@/features/inventory/components/StockAdjustmentFormContent";
import {
  createStockAdjustmentDefaultValues,
  createStockAdjustmentSchema,
  toCreateStockAdjustmentPayload,
  type CreateStockAdjustmentFormValues,
} from "@/features/inventory/schemas/stock-adjustment.schema";
import { createStockAdjustment } from "@/features/inventory/services/stock-adjustments.service";
import type { StockAdjustment } from "@/features/inventory/types/inventory.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

type CreateStockAdjustmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (adjustment: StockAdjustment) => void;
};

const DETAILS_TAB = "details";

export function CreateStockAdjustmentDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateStockAdjustmentDialogProps) {
  const { toast } = useToast();

  const form = useForm<CreateStockAdjustmentFormValues>({
    resolver: zodResolver(createStockAdjustmentSchema),
    defaultValues: createStockAdjustmentDefaultValues(),
  });

  useEffect(() => {
    if (open) {
      form.reset(createStockAdjustmentDefaultValues());
    }
  }, [form, open]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const adjustment = await createStockAdjustment(toCreateStockAdjustmentPayload(values));
      toast({
        variant: "success",
        title: "Stock adjustment created",
        description: `${adjustment.reference_number} is ready for line items.`,
      });
      onCreated(adjustment);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in createStockAdjustmentDefaultValues()) {
            form.setError(field as keyof CreateStockAdjustmentFormValues, { message });
          }
        }

        toast({
          variant: "error",
          title: "Could not create stock adjustment",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not create stock adjustment",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <TabbedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New stock adjustment"
      description="Choose the location and adjustment type. You can add line items on the next screen."
      tabs={[{ id: DETAILS_TAB, label: "Details" }]}
      activeTab={DETAILS_TAB}
      onTabChange={() => undefined}
      className={appFont.className}
      data-testid="create-stock-adjustment-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={isSubmitting}
            onClick={() => void handleSubmit()}
            data-testid="create-stock-adjustment-submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Creating...
              </>
            ) : (
              "Create adjustment"
            )}
          </PrimaryButton>
        </>
      }
    >
      <Form {...form}>
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <InventoryNoLocationsAlert enabled={open} />
          <StockAdjustmentFormContent
            form={form}
            locationSelectId="create-sa-location"
            adjustmentTypeSelectId="create-sa-type"
          />
        </form>
      </Form>
    </TabbedDialog>
  );
}
