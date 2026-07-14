"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

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
import { StatusBanner } from "@/components/ui/status-banner";
import { fetchCustomerInsurance } from "@/features/customers/services/customer-insurance.service";
import type { CustomerInsurance } from "@/features/customers/types/customer-insurance.types";
import { VisitPaymentModeFields } from "@/features/visits/components/VisitPaymentModeFields";
import {
  editVisitPaymentSchema,
  toEditVisitPaymentDefaultValues,
  toUpdateVisitPaymentModePayload,
  type EditVisitPaymentFormValues,
} from "@/features/visits/schemas/edit-visit-payment.schema";
import { updateVisitPaymentMode } from "@/features/visits/services/visits.service";
import type { VisitDetail } from "@/features/visits/types/visit.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

type EditVisitPaymentDialogProps = {
  visit: VisitDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (visit: VisitDetail) => void;
};

export function EditVisitPaymentDialog({
  visit,
  open,
  onOpenChange,
  onUpdated,
}: EditVisitPaymentDialogProps) {
  const { toast } = useToast();
  const [insuranceSchemes, setInsuranceSchemes] = useState<CustomerInsurance[]>(
    [],
  );
  const [isLoadingSchemes, setIsLoadingSchemes] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<EditVisitPaymentFormValues>({
    resolver: zodResolver(editVisitPaymentSchema),
    defaultValues: toEditVisitPaymentDefaultValues(visit),
  });

  const modeOfPayment = form.watch("mode_of_payment");

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(toEditVisitPaymentDefaultValues(visit));
    setLoadError(null);

    let cancelled = false;

    void (async () => {
      try {
        setIsLoadingSchemes(true);
        const schemes = await fetchCustomerInsurance(visit.customer);
        if (!cancelled) {
          setInsuranceSchemes(schemes);
        }
      } catch (error) {
        if (!cancelled) {
          setInsuranceSchemes([]);
          setLoadError(
            error instanceof Error
              ? error.message
              : "Could not load insurance schemes.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSchemes(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [form, open, visit]);

  useEffect(() => {
    if (modeOfPayment !== "insurance") {
      form.setValue("insurance_scheme", "");
    }
  }, [form, modeOfPayment]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setIsSaving(true);
      const updatedVisit = await updateVisitPaymentMode(
        visit.uuid,
        toUpdateVisitPaymentModePayload(values),
      );
      onUpdated(updatedVisit);
      onOpenChange(false);
      toast({
        variant: "success",
        title: "Payment mode updated",
        description: "The visit payment mode has been saved.",
      });
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in form.getValues()) {
            form.setError(field as keyof EditVisitPaymentFormValues, { message });
          }
        }
        toast({
          variant: "error",
          title: "Could not update payment mode",
          description: formatBffErrorMessage(error.message, error.errors),
        });
      } else {
        toast({
          variant: "error",
          title: "Could not update payment mode",
          description:
            error instanceof Error ? error.message : "Something went wrong.",
        });
      }
    } finally {
      setIsSaving(false);
    }
  });

  const insuranceUnavailable =
    modeOfPayment === "insurance" && insuranceSchemes.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={appFont.className}>
        <DialogHeader>
          <DialogTitle>Edit payment mode</DialogTitle>
          <DialogDescription>
            Update how this visit is billed for {visit.customer_name}.
          </DialogDescription>
        </DialogHeader>

        {loadError ? (
          <StatusBanner variant="error" message={loadError} />
        ) : null}

        {isLoadingSchemes ? (
          <p className="text-sm text-brand-muted">Loading insurance schemes...</p>
        ) : (
          <Form {...form}>
            <form
              id="edit-visit-payment-form"
              className="space-y-4"
              onSubmit={onSubmit}
            >
              <VisitPaymentModeFields
                form={form}
                insuranceSchemes={insuranceSchemes}
              />
            </form>
          </Form>
        )}

        <DialogFooter>
          <SecondaryButton
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            form="edit-visit-payment-form"
            disabled={isSaving || isLoadingSchemes || insuranceUnavailable}
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
