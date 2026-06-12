"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Form } from "@/components/ui/form";
import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import { PurchaseOrderFormTabContent } from "@/features/inventory/components/PurchaseOrderFormTabContent";
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
          <PurchaseOrderFormTabContent
            form={form}
            activeTab={activeTab}
            locationSelectId="update-po-receiving-location"
          />
        </form>
      </Form>
    </TabbedDialog>
  );
}
