"use client";

import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { StockAdjustmentFormContent } from "@/features/inventory/components/StockAdjustmentFormContent";
import {
  createStockAdjustmentSchema,
  toUpdateStockAdjustmentFormValues,
  toUpdateStockAdjustmentPayload,
  type CreateStockAdjustmentFormValues,
} from "@/features/inventory/schemas/stock-adjustment.schema";
import { updateStockAdjustment } from "@/features/inventory/services/stock-adjustments.service";
import type { StockAdjustment } from "@/features/inventory/types/inventory.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type UpdateStockAdjustmentDialogProps = {
  adjustment: StockAdjustment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (adjustment: StockAdjustment) => void;
};

export function UpdateStockAdjustmentDialog({
  adjustment,
  open,
  onOpenChange,
  onUpdated,
}: UpdateStockAdjustmentDialogProps) {
  const { toast } = useToast();

  const form = useForm<CreateStockAdjustmentFormValues>({
    resolver: zodResolver(createStockAdjustmentSchema),
    defaultValues: toUpdateStockAdjustmentFormValues(adjustment),
  });

  useEffect(() => {
    if (open) {
      form.reset(toUpdateStockAdjustmentFormValues(adjustment));
    }
  }, [adjustment, form, open]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const updated = await updateStockAdjustment(
        adjustment.uuid,
        toUpdateStockAdjustmentPayload(values),
      );
      toast({
        variant: "success",
        title: "Stock adjustment updated",
        description: `${updated.reference_number} was saved.`,
      });
      onUpdated(updated);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in toUpdateStockAdjustmentFormValues(adjustment)) {
            form.setError(field as keyof CreateStockAdjustmentFormValues, { message });
          }
        }

        toast({
          variant: "error",
          title: "Could not update stock adjustment",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not update stock adjustment",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-lg", appFont.className)}>
        <DialogHeader>
          <DialogTitle>Update stock adjustment</DialogTitle>
          <DialogDescription>
            Edit location, type, and reason for {adjustment.reference_number}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <StockAdjustmentFormContent
              form={form}
              locationSelectId="update-sa-location"
              adjustmentTypeSelectId="update-sa-type"
            />
          </form>
        </Form>

        <DialogFooter>
          <SecondaryButton
            type="button"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton type="button" disabled={isSubmitting} onClick={() => void handleSubmit()}>
            {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Save changes
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
