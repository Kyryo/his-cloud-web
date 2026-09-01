"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { CustomerLegalGuardianFormFields } from "@/features/customers/components/CustomerLegalGuardianFormFields";
import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Form } from "@/components/ui/form";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import {
  createCustomerLegalGuardianSchema,
  toUpdateCustomerLegalGuardianFormValues,
  toUpdateCustomerLegalGuardianPayload,
  type CreateCustomerLegalGuardianFormValues,
} from "@/features/customers/schemas/customer-legal-guardian.schema";
import { updateCustomerLegalGuardian } from "@/features/customers/services/customer-legal-guardians.service";
import type { CustomerLegalGuardian } from "@/features/customers/types/customer-legal-guardian.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const FORM_ID = "update-customer-legal-guardian-form";

type UpdateCustomerLegalGuardianDialogProps = {
  guardian: CustomerLegalGuardian;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (guardian: CustomerLegalGuardian) => void;
};

export function UpdateCustomerLegalGuardianDialog({
  guardian,
  open,
  onOpenChange,
  onUpdated,
}: UpdateCustomerLegalGuardianDialogProps) {
  const { toast } = useToast();
  const form = useForm<CreateCustomerLegalGuardianFormValues>({
    resolver: zodResolver(createCustomerLegalGuardianSchema),
    defaultValues: toUpdateCustomerLegalGuardianFormValues(guardian),
  });

  useEffect(() => {
    if (open) {
      form.reset(toUpdateCustomerLegalGuardianFormValues(guardian));
    }
  }, [form, guardian, open]);

  async function handleSubmit(values: CreateCustomerLegalGuardianFormValues) {
    try {
      const updatedGuardian = await updateCustomerLegalGuardian(
        guardian.uuid,
        toUpdateCustomerLegalGuardianPayload(values),
      );
      toast({
        variant: "success",
        title: "Legal guardian updated",
        description: "Guardian details were saved successfully.",
      });
      onUpdated(updatedGuardian);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in toUpdateCustomerLegalGuardianFormValues(guardian)) {
            form.setError(field as keyof CreateCustomerLegalGuardianFormValues, {
              message,
            });
          }
        }
        toast({
          variant: "error",
          title: "Could not update legal guardian",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not update legal guardian",
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
      title="Update legal guardian"
      description="Edit this client's legal guardian details."
      className={cn("sm:max-w-lg", appFont.className)}
      data-testid="update-customer-legal-guardian-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" form={FORM_ID} disabled={isSubmitting}>
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
        >
          <CustomerLegalGuardianFormFields
            form={form}
            isSubmitting={isSubmitting}
            idPrefix="update-customer-legal-guardian"
          />
        </form>
      </Form>
    </SectionedDialog>
  );
}
