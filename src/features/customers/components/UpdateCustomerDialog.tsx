"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { CustomerFormFields } from "@/features/customers/components/CustomerFormFields";
import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Form } from "@/components/ui/form";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import {
  createCustomerSchema,
  toCustomerWritePayload,
  toUpdateCustomerFormValues,
  type CreateCustomerFormValues,
} from "@/features/customers/schemas/customer.schema";
import { updateCustomer } from "@/features/customers/services/customers.service";
import type { Customer } from "@/features/customers/types/customer.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const FORM_ID = "update-customer-form";

type UpdateCustomerDialogProps = {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (customer: Customer) => void;
};

export function UpdateCustomerDialog({
  customer,
  open,
  onOpenChange,
  onUpdated,
}: UpdateCustomerDialogProps) {
  const { toast } = useToast();
  const form = useForm<CreateCustomerFormValues>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: toUpdateCustomerFormValues(customer),
  });

  useEffect(() => {
    if (open) {
      form.reset(toUpdateCustomerFormValues(customer));
    }
  }, [customer, form, open]);

  async function handleSubmit(values: CreateCustomerFormValues) {
    try {
      const updatedCustomer = await updateCustomer(
        customer.uuid,
        toCustomerWritePayload(values),
      );
      toast({
        variant: "success",
        title: "Client updated",
        description: `${updatedCustomer.full_name || updatedCustomer.first_name} was saved successfully.`,
      });
      onUpdated(updatedCustomer);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in toUpdateCustomerFormValues(customer)) {
            form.setError(field as keyof CreateCustomerFormValues, { message });
          }
        }

        toast({
          variant: "error",
          title: "Could not update client",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not update client",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Update client"
      description="Edit this client's profile details. Required fields are marked with an asterisk."
      className={cn("sm:max-w-lg", appFont.className)}
      data-testid="update-customer-dialog"
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
            type="submit"
            form={FORM_ID}
            disabled={isSubmitting}
            data-testid="update-customer-submit"
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
        <form
          id={FORM_ID}
          className="space-y-4"
          onSubmit={form.handleSubmit(handleSubmit)}
          data-testid="update-customer-form"
        >
          <CustomerFormFields
            form={form}
            isSubmitting={isSubmitting}
            idPrefix="update-customer"
          />
        </form>
      </Form>
    </SectionedDialog>
  );
}
