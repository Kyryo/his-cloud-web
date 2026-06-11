"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import { InventoryLocationSelect } from "@/features/inventory/components/InventoryLocationSelect";
import {
  toUpdatePurchaseOrderFormValues,
  toUpdatePurchaseOrderPayload,
  updatePurchaseOrderSchema,
  type UpdatePurchaseOrderFormValues,
} from "@/features/inventory/schemas/purchase-order.schema";
import { updatePurchaseOrder } from "@/features/inventory/services/purchase-orders.service";
import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

type UpdatePurchaseOrderDialogProps = {
  order: PurchaseOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (order: PurchaseOrder) => void;
};

type UpdatePurchaseOrderTab = "details" | "references";

export function UpdatePurchaseOrderDialog({
  order,
  open,
  onOpenChange,
  onUpdated,
}: UpdatePurchaseOrderDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<UpdatePurchaseOrderTab>("details");

  const form = useForm<UpdatePurchaseOrderFormValues>({
    resolver: zodResolver(updatePurchaseOrderSchema),
    defaultValues: toUpdatePurchaseOrderFormValues(order),
  });

  useEffect(() => {
    if (open) {
      setActiveTab("details");
      form.reset(toUpdatePurchaseOrderFormValues(order));
    }
  }, [form, open, order]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const updated = await updatePurchaseOrder(
        order.uuid,
        toUpdatePurchaseOrderPayload(values),
      );
      toast({
        variant: "success",
        title: "Purchase order updated",
        description: `${updated.reference_number} was saved.`,
      });
      onUpdated(updated);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in toUpdatePurchaseOrderFormValues(order)) {
            form.setError(field as keyof UpdatePurchaseOrderFormValues, { message });
          }
        }

        toast({
          variant: "error",
          title: "Could not update purchase order",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not update purchase order",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  });

  const isSubmitting = form.formState.isSubmitting;
  const tabs = [
    { id: "details", label: "Details" },
    { id: "references", label: "References" },
  ];

  return (
    <TabbedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Update purchase order"
      description="Edit vendor, location, and reference details for this order."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tabId) => {
        if (tabId === "details" || tabId === "references") {
          setActiveTab(tabId);
        }
      }}
      className={appFont.className}
      data-testid="update-purchase-order-dialog"
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
            data-testid="update-purchase-order-submit"
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
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          {activeTab === "details" ? (
            <>
              <FormField
                control={form.control}
                name="vendor_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Supplier name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="receiving_location"
                render={({ field }) => (
                  <FormItem>
                    <InventoryLocationSelect
                      id="update-po-receiving-location"
                      label="Receiving location"
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(locationId) => field.onChange(Number(locationId))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="delivery_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="lpo_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LPO number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="grn_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GRN number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="invoice_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="invoice_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={4}
                        className="flex min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </form>
      </Form>
    </TabbedDialog>
  );
}
