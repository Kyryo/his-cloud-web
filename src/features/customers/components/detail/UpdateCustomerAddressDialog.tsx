"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
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
  createCustomerAddressSchema,
  toUpdateCustomerAddressFormValues,
  toUpdateCustomerAddressPayload,
  type CreateCustomerAddressFormValues,
} from "@/features/customers/schemas/customer-address.schema";
import { updateCustomerAddress } from "@/features/customers/services/customer-addresses.service";
import type { CustomerAddress } from "@/features/customers/types/customer-address.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type UpdateCustomerAddressDialogProps = {
  address: CustomerAddress;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (address: CustomerAddress) => void;
};

export function UpdateCustomerAddressDialog({
  address,
  open,
  onOpenChange,
  onUpdated,
}: UpdateCustomerAddressDialogProps) {
  const { toast } = useToast();
  const form = useForm<CreateCustomerAddressFormValues>({
    resolver: zodResolver(createCustomerAddressSchema),
    defaultValues: toUpdateCustomerAddressFormValues(address),
  });

  useEffect(() => {
    if (open) {
      form.reset(toUpdateCustomerAddressFormValues(address));
    }
  }, [address, form, open]);

  async function handleSubmit(values: CreateCustomerAddressFormValues) {
    try {
      const updatedAddress = await updateCustomerAddress(
        address.uuid,
        toUpdateCustomerAddressPayload(values),
      );
      toast({
        variant: "success",
        title: "Address updated",
        description: "Address details were saved successfully.",
      });
      onUpdated(updatedAddress);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in toUpdateCustomerAddressFormValues(address)) {
            form.setError(field as keyof CreateCustomerAddressFormValues, {
              message,
            });
          }
        }
        toast({
          variant: "error",
          title: "Could not update address",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not update address",
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
        data-testid="update-customer-address-dialog"
      >
        <DialogHeader>
          <DialogTitle>Update address</DialogTitle>
          <DialogDescription>
            Edit this client&apos;s address details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <CustomerAddressFormFields
              form={form}
              isSubmitting={isSubmitting}
              idPrefix="update-customer-address"
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
                  "Save changes"
                )}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
