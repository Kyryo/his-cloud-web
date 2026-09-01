"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  createCustomerInsuranceDefaultValues,
  createCustomerInsuranceSchema,
  toCustomerInsurancePayload,
  type CreateCustomerInsuranceFormValues,
} from "@/features/customers/schemas/customer-insurance.schema";
import { createCustomerInsurance } from "@/features/customers/services/customer-insurance.service";
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

type AddCustomerInsuranceDialogProps = {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (insurance: CustomerInsurance) => void;
};

export function AddCustomerInsuranceDialog({
  customer,
  open,
  onOpenChange,
  onCreated,
}: AddCustomerInsuranceDialogProps) {
  const { toast } = useToast();
  const [schemes, setSchemes] = useState<InsuranceScheme[]>([]);
  const [isLoadingSchemes, setIsLoadingSchemes] = useState(false);
  const form = useForm<CreateCustomerInsuranceFormValues>({
    resolver: zodResolver(createCustomerInsuranceSchema),
    defaultValues: createCustomerInsuranceDefaultValues,
  });

  const customerFullName = useMemo(
    () => formatCustomerName(customer),
    [customer],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(createCustomerInsuranceDefaultValues);
    let cancelled = false;

    async function run() {
      try {
        const data = await fetchInsuranceSchemes();
        if (!cancelled) {
          setSchemes(data);
          setIsLoadingSchemes(false);
        }
      } catch {
        if (!cancelled) {
          toast({
            variant: "error",
            title: "Could not load insurance schemes",
            description: "Try again or contact your administrator.",
          });
          setIsLoadingSchemes(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [form, open, toast]);

  async function handleSubmit(values: CreateCustomerInsuranceFormValues) {
    try {
      const insurance = await createCustomerInsurance(
        customer.uuid,
        toCustomerInsurancePayload(values),
      );
      toast({
        variant: "success",
        title: "Insurance added",
        description: `Insurance profile for ${customerFullName} was created.`,
      });
      onCreated(insurance);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError && error.fieldErrors) {
        mapBffErrorsToForm(error.fieldErrors, form.setError);
      }

      toast({
        variant: "error",
        title: "Could not add insurance",
        description: formatBffErrorMessage(
          error,
          "Failed to create insurance. Please check your inputs.",
        ),
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("sm:max-w-xl", appFont.className)}
        data-testid="add-customer-insurance-dialog"
      >
        <DialogHeader>
          <DialogTitle>Add insurance</DialogTitle>
          <DialogDescription>
            Attach an insurance policy for {customerFullName}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <CustomerInsuranceFormFields
              form={form}
              schemes={schemes}
              isLoadingSchemes={isLoadingSchemes}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <SecondaryButton
                type="button"
                disabled={form.formState.isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                disabled={form.formState.isSubmitting || isLoadingSchemes}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                    Saving...
                  </>
                ) : (
                  "Save insurance"
                )}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
