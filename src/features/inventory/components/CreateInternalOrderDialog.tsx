"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Form } from "@/components/ui/form";
import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import { InternalOrderFormContent } from "@/features/inventory/components/InternalOrderFormContent";
import {
  createInternalOrderDefaultValues,
  createInternalOrderSchema,
  toCreateInternalOrderPayload,
  type CreateInternalOrderFormValues,
} from "@/features/inventory/schemas/internal-order.schema";
import { createInternalOrder } from "@/features/inventory/services/internal-orders.service";
import type { InternalOrder } from "@/features/inventory/types/inventory.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

type CreateInternalOrderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (order: InternalOrder) => void;
};

const DETAILS_TAB = "details";

export function CreateInternalOrderDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateInternalOrderDialogProps) {
  const { toast } = useToast();

  const form = useForm<CreateInternalOrderFormValues>({
    resolver: zodResolver(createInternalOrderSchema),
    defaultValues: createInternalOrderDefaultValues(),
  });

  useEffect(() => {
    if (open) {
      form.reset(createInternalOrderDefaultValues());
    }
  }, [form, open]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const order = await createInternalOrder(toCreateInternalOrderPayload(values));
      toast({
        variant: "success",
        title: "Internal order created",
        description: `${order.reference_number} is ready for line items.`,
      });
      onCreated(order);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in createInternalOrderDefaultValues()) {
            form.setError(field as keyof CreateInternalOrderFormValues, { message });
          }
        }

        toast({
          variant: "error",
          title: "Could not create internal order",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not create internal order",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <TabbedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New internal order"
      description="Choose source and destination locations. You can add line items on the next screen."
      tabs={[{ id: DETAILS_TAB, label: "Details" }]}
      activeTab={DETAILS_TAB}
      onTabChange={() => undefined}
      className={appFont.className}
      data-testid="create-internal-order-dialog"
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
            data-testid="create-internal-order-submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Creating...
              </>
            ) : (
              "Create internal order"
            )}
          </PrimaryButton>
        </>
      }
    >
      <Form {...form}>
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <InternalOrderFormContent
            form={form}
            sourceLocationSelectId="create-io-source-location"
            destinationLocationSelectId="create-io-destination-location"
          />
        </form>
      </Form>
    </TabbedDialog>
  );
}
