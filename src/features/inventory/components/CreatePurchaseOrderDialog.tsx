"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Form } from "@/components/ui/form";
import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import { PurchaseOrderFormTabContent } from "@/features/inventory/components/PurchaseOrderFormTabContent";
import { InventoryNoLocationsAlert } from "@/features/inventory/components/InventoryNoLocationsAlert";
import {
  countPurchaseOrderStepErrors,
  createPurchaseOrderDefaultValues,
  purchaseOrderDetailsStepFields,
  purchaseOrderReferencesStepFields,
  resolvePurchaseOrderErrorStep,
  toCreatePurchaseOrderPayload,
  updatePurchaseOrderSchema,
  type UpdatePurchaseOrderFormValues,
} from "@/features/inventory/schemas/purchase-order.schema";
import { createPurchaseOrder } from "@/features/inventory/services/purchase-orders.service";
import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";
import { useEnterEscapeShortcuts } from "@/hooks/use-enter-escape-shortcuts";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

type CreatePurchaseOrderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (order: PurchaseOrder) => void;
};

type CreatePurchaseOrderTab = "details" | "references";

export function CreatePurchaseOrderDialog({
  open,
  onOpenChange,
  onCreated,
}: CreatePurchaseOrderDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<CreatePurchaseOrderTab>("details");

  const form = useForm<UpdatePurchaseOrderFormValues>({
    resolver: zodResolver(updatePurchaseOrderSchema),
    defaultValues: createPurchaseOrderDefaultValues(),
  });

  const formErrors = form.formState.errors;
  const detailsErrorCount = useMemo(
    () => countPurchaseOrderStepErrors(formErrors, purchaseOrderDetailsStepFields),
    [formErrors],
  );
  const referencesErrorCount = useMemo(
    () => countPurchaseOrderStepErrors(formErrors, purchaseOrderReferencesStepFields),
    [formErrors],
  );

  function resetDialog() {
    setActiveTab("details");
    form.reset(createPurchaseOrderDefaultValues());
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetDialog();
    }
    onOpenChange(nextOpen);
  }

  function navigateToErrorStep(
    errors: Partial<Record<keyof UpdatePurchaseOrderFormValues, unknown>>,
  ) {
    setActiveTab(resolvePurchaseOrderErrorStep(errors));
  }

  async function handleContinue() {
    const isValid = await form.trigger([...purchaseOrderDetailsStepFields]);
    if (isValid) {
      setActiveTab("references");
    }
  }

  const handleSubmit = form.handleSubmit(
    async (values) => {
      try {
        const order = await createPurchaseOrder(toCreatePurchaseOrderPayload(values));
        toast({
          variant: "success",
          title: "Purchase order created",
          description: `${order.reference_number} is ready for line items.`,
        });
        onCreated(order);
        handleOpenChange(false);
      } catch (error) {
        if (error instanceof BffError) {
          const fieldErrors = mapBffErrorsToForm(error.errors);
          for (const [field, message] of Object.entries(fieldErrors)) {
            if (field in createPurchaseOrderDefaultValues()) {
              form.setError(field as keyof UpdatePurchaseOrderFormValues, { message });
            }
          }

          navigateToErrorStep(fieldErrors as Partial<Record<keyof UpdatePurchaseOrderFormValues, unknown>>);

          toast({
            variant: "error",
            title: "Could not create purchase order",
            description: formatBffErrorMessage(error.message, error.errors),
          });
          return;
        }

        toast({
          variant: "error",
          title: "Could not create purchase order",
          description: error instanceof Error ? error.message : "Something went wrong.",
        });
      }
    },
    (errors) => {
      navigateToErrorStep(errors);
    },
  );

  const isSubmitting = form.formState.isSubmitting;

  // Enter advances/submits like the primary footer button; Escape closes via
  // the dialog primitive itself.
  useEnterEscapeShortcuts({
    enabled: open,
    isBusy: isSubmitting,
    onEnter: () => {
      if (activeTab === "details") {
        void handleContinue();
      } else {
        void handleSubmit();
      }
    },
  });

  const tabs = [
    { id: "details", label: "Details", errorCount: detailsErrorCount },
    { id: "references", label: "References", errorCount: referencesErrorCount },
  ];

  return (
    <TabbedDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="New purchase order"
      description="Enter vendor, location, and reference details. You can add line items on the next screen."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tabId) => {
        if (tabId === "details" || tabId === "references") {
          setActiveTab(tabId);
        }
      }}
      className={appFont.className}
      data-testid="create-purchase-order-dialog"
      footer={
        <>
          {activeTab === "references" ? (
            <SecondaryButton
              type="button"
              disabled={isSubmitting}
              onClick={() => setActiveTab("details")}
              data-testid="create-purchase-order-back-button"
            >
              Back
            </SecondaryButton>
          ) : (
            <SecondaryButton
              type="button"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </SecondaryButton>
          )}
          {activeTab === "details" ? (
            <PrimaryButton
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleContinue()}
              data-testid="create-purchase-order-continue-button"
            >
              Continue
            </PrimaryButton>
          ) : (
            <PrimaryButton
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleSubmit()}
              data-testid="create-purchase-order-submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Creating...
                </>
              ) : (
                "Create purchase order"
              )}
            </PrimaryButton>
          )}
        </>
      }
    >
      <Form {...form}>
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <InventoryNoLocationsAlert enabled={open} />
          <PurchaseOrderFormTabContent
            form={form}
            activeTab={activeTab}
            locationSelectId="create-po-receiving-location"
          />
        </form>
      </Form>
    </TabbedDialog>
  );
}
