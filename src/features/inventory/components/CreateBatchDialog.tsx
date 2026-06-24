"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { InventoryProductPicker } from "@/features/inventory/components/InventoryProductPicker";
import { InventorySupplierPicker } from "@/features/inventory/components/InventorySupplierPicker";
import {
  createBatchDefaultValues,
  createBatchSchema,
  toCreateBatchPayload,
  type CreateBatchFormValues,
} from "@/features/inventory/schemas/batch.schema";
import { createInventoryBatch } from "@/features/inventory/services/batches.service";
import type {
  InventoryBatch,
  InventoryProduct,
} from "@/features/inventory/types/inventory.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useUser } from "@/providers/user-provider";
import { useToast } from "@/providers/toast-provider";

type CreateBatchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (batch: InventoryBatch) => void;
};

export function CreateBatchDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateBatchDialogProps) {
  const { toast } = useToast();
  const { userData } = useUser();
  const tenantId =
    userData?.tenant?.id ?? userData?.primary_clinic?.tenant ?? null;
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(
    null,
  );

  const form = useForm<CreateBatchFormValues>({
    resolver: zodResolver(createBatchSchema),
    defaultValues: createBatchDefaultValues(),
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(createBatchDefaultValues());
    setSelectedProduct(null);
  }, [form, open]);

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!tenantId) {
      form.setError("root", { message: "Tenant context is required." });
      toast({ description: "Tenant context is required.", variant: "error" });
      return;
    }

    if (selectedProduct?.product_type === "service") {
      form.setError("product_uuid", {
        message:
          "Service products cannot have batches. Choose a stockable or consumable product.",
      });
      return;
    }

    try {
      const created = await createInventoryBatch(
        toCreateBatchPayload(values, tenantId),
      );

      toast({
        variant: "success",
        title: "Batch created",
        description: `${created.batch_number} has been added.`,
      });
      onCreated(created);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in createBatchDefaultValues()) {
            form.setError(field as keyof CreateBatchFormValues, { message });
          }
        }

        toast({
          variant: "error",
          title: "Could not create batch",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not create batch",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md", appFont.className)}>
        <DialogHeader>
          <DialogTitle>New batch</DialogTitle>
          <DialogDescription>
            Create a batch record for lot and expiry tracking.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="space-y-4 py-2"
          >
            <FormField
              control={form.control}
              name="product_uuid"
              render={({ field, fieldState }) => (
                <FormItem>
                  <InventoryProductPicker
                    id="create-batch-product"
                    label="Product"
                    required
                    product={selectedProduct}
                    disabled={isSubmitting}
                    invalid={!!fieldState.error}
                    filterBatchEligible
                    helperText="Search by product name or SKU. Only stockable and consumable products are shown."
                    onProductChange={(product) => {
                      setSelectedProduct(product);
                      field.onChange(product?.uuid ?? "");
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="batch_number"
              render={({ field, fieldState }) => (
                <FormItem>
                  <Label htmlFor="create-batch-number">
                    Batch number <RequiredFieldMarker />
                  </Label>
                  <FormControl>
                    <Input
                      id="create-batch-number"
                      disabled={isSubmitting}
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="expiry_date"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <Label htmlFor="create-batch-expiry">Expiry date</Label>
                    <FormControl>
                      <Input
                        id="create-batch-expiry"
                        type="date"
                        disabled={isSubmitting}
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="manufacture_date"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <Label htmlFor="create-batch-manufacture">Manufacture date</Label>
                    <FormControl>
                      <Input
                        id="create-batch-manufacture"
                        type="date"
                        disabled={isSubmitting}
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="supplier"
              render={({ field, fieldState }) => (
                <FormItem>
                  <InventorySupplierPicker
                    id="create-batch-supplier"
                    required
                    supplier={field.value}
                    disabled={isSubmitting}
                    invalid={!!fieldState.error}
                    onSupplierChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field, fieldState }) => (
                <FormItem>
                  <Label htmlFor="create-batch-notes">Notes</Label>
                  <FormControl>
                    <textarea
                      id="create-batch-notes"
                      disabled={isSubmitting}
                      rows={3}
                      aria-invalid={!!fieldState.error}
                      className="flex min-h-[5rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <SecondaryButton
                type="button"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                    Creating...
                  </>
                ) : (
                  "Create batch"
                )}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
