"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { CustomerAddressFormFields } from "@/features/customers/components/CustomerAddressFormFields";
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
import {
  createCustomerAddressDefaultValues,
  createCustomerAddressSchema,
  toCustomerAddressPayload,
  type CreateCustomerAddressFormValues,
} from "@/features/customers/schemas/customer-address.schema";
import { createCustomerAddress } from "@/features/customers/services/customer-addresses.service";
import type { CustomerAddress } from "@/features/customers/types/customer-address.types";
import type { Customer } from "@/features/customers/types/customer.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type AddCustomerAddressDialogProps = {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (address: CustomerAddress) => void;
};

export function AddCustomerAddressDialog({
  customer,
  open,
  onOpenChange,
  onCreated,
}: AddCustomerAddressDialogProps) {
  const { toast } = useToast();
  const form = useForm<CreateCustomerAddressFormValues>({
    resolver: zodResolver(createCustomerAddressSchema),
    defaultValues: createCustomerAddressDefaultValues,
  });

  async function handleSubmit(values: CreateCustomerAddressFormValues) {
    try {
      const address = await createCustomerAddress(
        toCustomerAddressPayload(customer.id, values),
      );
      toast({
        variant: "success",
        title: "Address added",
        description: "Address details were saved for this client.",
      });
      form.reset(createCustomerAddressDefaultValues);
      onCreated(address);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in createCustomerAddressDefaultValues) {
            form.setError(field as keyof CreateCustomerAddressFormValues, {
              message,
            });
          }
        }
        toast({
          variant: "error",
          title: "Could not add address",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not add address",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("max-h-[90vh] overflow-y-auto sm:max-w-lg", appFont.className)}
        data-testid="add-customer-address-dialog"
      >
        <DialogHeader>
          <DialogTitle>Add address</DialogTitle>
          <DialogDescription>
            Save a home, work, billing, or other address for this client.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <CustomerAddressFormFields
              form={form}
              isSubmitting={isSubmitting}
              idPrefix="add-customer-address"
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
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  "Add address"
                )}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
