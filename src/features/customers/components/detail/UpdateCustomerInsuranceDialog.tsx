"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { CustomerInsuranceFormFields } from "@/features/customers/components/CustomerInsuranceFormFields";
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
  createCustomerInsuranceSchema,
  toCustomerInsurancePayload,
  toUpdateCustomerInsuranceFormValues,
  type CreateCustomerInsuranceFormValues,
} from "@/features/customers/schemas/customer-insurance.schema";
import { updateCustomerInsurance } from "@/features/customers/services/customer-insurance.service";
import { fetchInsuranceSchemes } from "@/features/customers/services/insurance-schemes.service";
import type { CustomerInsurance } from "@/features/customers/types/customer-insurance.types";
import type { InsuranceScheme } from "@/features/customers/types/customer-insurance.types";
import type { Customer } from "@/features/customers/types/customer.types";
import { formatCustomerName } from "@/features/customers/utils/format-customer";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type UpdateCustomerInsuranceDialogProps = {
  customer: Customer;
  insurance: CustomerInsurance;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (insurance: CustomerInsurance) => void;
};

export function UpdateCustomerInsuranceDialog({
  customer,
  insurance,
  open,
  onOpenChange,
  onUpdated,
}: UpdateCustomerInsuranceDialogProps) {
  const { toast } = useToast();
  const [schemes, setSchemes] = useState<InsuranceScheme[]>([]);
  const [isLoadingSchemes, setIsLoadingSchemes] = useState(false);
  const form = useForm<CreateCustomerInsuranceFormValues>({
    resolver: zodResolver(createCustomerInsuranceSchema),
    defaultValues: toUpdateCustomerInsuranceFormValues(insurance),
  });

  const customerFullName = useMemo(
    () => formatCustomerName(customer),
    [customer],
  );

  const loadSchemes = useCallback(async () => {
    setIsLoadingSchemes(true);
    try {
      const data = await fetchInsuranceSchemes();
      setSchemes(data);
    } catch {
      toast({
        variant: "error",
        title: "Could not load insurance schemes",
        description: "Try again or contact your administrator.",
      });
    } finally {
      setIsLoadingSchemes(false);
    }
  }, [toast]);

  useEffect(() => {
    if (open) {
      form.reset(toUpdateCustomerInsuranceFormValues(insurance));
      void loadSchemes();
    }
  }, [form, insurance, loadSchemes, open]);

  async function handleSubmit(values: CreateCustomerInsuranceFormValues) {
    try {
      const updatedInsurance = await updateCustomerInsurance(
        customer.uuid,
        insurance.uuid,
        toCustomerInsurancePayload(values),
      );
      toast({
        variant: "success",
        title: "Insurance updated",
        description: "Insurance details were saved successfully.",
      });
      onUpdated(updatedInsurance);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in toUpdateCustomerInsuranceFormValues(insurance)) {
            form.setError(field as keyof CreateCustomerInsuranceFormValues, {
              message,
            });
          }
        }
        toast({
          variant: "error",
          title: "Could not update insurance",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not update insurance",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl",
          appFont.className,
        )}
        data-testid="update-customer-insurance-dialog"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <DialogHeader className="border-b border-brand-border px-6 py-5">
            <DialogTitle>Update insurance</DialogTitle>
            <DialogDescription>
              Edit this client&apos;s insurance membership details.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                <CustomerInsuranceFormFields
                  form={form}
                  schemes={schemes}
                  isLoadingSchemes={isLoadingSchemes}
                  isSubmitting={isSubmitting}
                  customerFullName={customerFullName}
                  idPrefix="update-customer-insurance"
                />
              </div>
              <DialogFooter className="mt-0 border-t border-brand-border px-6 py-5">
                <SecondaryButton
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  type="submit"
                  disabled={isSubmitting || schemes.length === 0}
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
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
