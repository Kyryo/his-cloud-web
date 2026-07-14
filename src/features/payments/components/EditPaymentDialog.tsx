"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { FilterSelectField } from "@/components/filter-select-field";
import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  buildRecordPaymentSchema,
  PAYMENT_METHOD_OPTIONS,
  type RecordPaymentFormValues,
} from "@/features/payments/schemas/record-payment.schema";
import { updatePayment } from "@/features/payments/services/payments.service";
import type { Payment } from "@/features/payments/types/payment.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type EditPaymentDialogProps = {
  payment: Payment;
  maxAmount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (payment: Payment) => void;
};

function toEditDefaultValues(payment: Payment): RecordPaymentFormValues {
  return {
    amount: String(payment.amount ?? ""),
    paymentMethod: payment.payment_method || "Cash",
    paymentDate: payment.payment_date
      ? payment.payment_date.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    note: payment.note ?? "",
  };
}

export function EditPaymentDialog({
  payment,
  maxAmount,
  open,
  onOpenChange,
  onUpdated,
}: EditPaymentDialogProps) {
  const { toast } = useToast();
  const validationSchema = useMemo(
    () => buildRecordPaymentSchema(maxAmount),
    [maxAmount],
  );
  const form = useForm<RecordPaymentFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: toEditDefaultValues(payment),
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    form.reset(toEditDefaultValues(payment));
  }, [form, open, payment]);

  async function handleSubmit(values: RecordPaymentFormValues) {
    try {
      const updated = await updatePayment(payment.id, {
        amount: values.amount.trim(),
        paymentMethod: values.paymentMethod.trim(),
        paymentDate: values.paymentDate,
        note: values.note.trim() || undefined,
      });
      toast({
        variant: "success",
        title: "Payment updated",
        description: `${updated.name || "Payment"} was saved.`,
      });
      onUpdated(updated);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in form.getValues()) {
            form.setError(field as keyof RecordPaymentFormValues, { message });
          }
        }
        toast({
          variant: "error",
          title: "Could not update payment",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not update payment",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;
  const watchedAmount = Number(form.watch("amount"));
  const exceedsMax =
    Number.isFinite(watchedAmount) && watchedAmount > maxAmount;
  const isSubmitDisabled = isSubmitting || exceedsMax;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("max-h-[90vh] overflow-y-auto sm:max-w-lg", appFont.className)}
        data-testid="edit-payment-dialog"
      >
        <DialogHeader>
          <DialogTitle>Edit payment</DialogTitle>
          <DialogDescription>
            Update details for {payment.name || `payment #${payment.id}`}.
            Amount cannot exceed {maxAmount.toFixed(2)}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      disabled={isSubmitting}
                      data-testid="edit-payment-amount"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment method</FormLabel>
                  <FormControl>
                    <FilterSelectField
                      id="edit-payment-method"
                      label=""
                      value={field.value}
                      options={[...PAYMENT_METHOD_OPTIONS]}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment date</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      disabled={isSubmitting}
                      data-testid="edit-payment-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Optional payment notes"
                      disabled={isSubmitting}
                      data-testid="edit-payment-note"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <SecondaryButton
                type="button"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={isSubmitDisabled}>
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
