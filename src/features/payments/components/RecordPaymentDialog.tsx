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
import type { Invoice } from "@/features/invoices/types/invoice.types";
import { formatInvoiceAmount } from "@/features/invoices/utils/format-invoice";
import { getInvoiceOutstandingBalance } from "@/features/invoices/utils/sum-invoice-billing";
import {
  buildRecordPaymentDefaultValues,
  buildRecordPaymentSchema,
  PAYMENT_METHOD_OPTIONS,
  toRecordPaymentPayload,
  type RecordPaymentFormValues,
} from "@/features/payments/schemas/record-payment.schema";
import { createPayment } from "@/features/payments/services/payments.service";
import type { Payment } from "@/features/payments/types/payment.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type RecordPaymentDialogProps = {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecorded: (payment: Payment) => void;
};

export function RecordPaymentDialog({
  invoice,
  open,
  onOpenChange,
  onRecorded,
}: RecordPaymentDialogProps) {
  const { toast } = useToast();
  const outstandingBalance = getInvoiceOutstandingBalance(invoice);
  const validationSchema = useMemo(
    () => buildRecordPaymentSchema(outstandingBalance),
    [outstandingBalance],
  );
  const form = useForm<RecordPaymentFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: buildRecordPaymentDefaultValues(outstandingBalance),
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    form.reset(buildRecordPaymentDefaultValues(outstandingBalance));
  }, [form, open, outstandingBalance]);

  async function handleSubmit(values: RecordPaymentFormValues) {
    try {
      const payment = await createPayment(
        toRecordPaymentPayload(invoice.id, values),
      );
      toast({
        variant: "success",
        title: "Payment recorded",
        description: `${payment.name || "Payment"} was saved for this invoice.`,
      });
      onRecorded(payment);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in buildRecordPaymentDefaultValues(invoice.amount_total)) {
            form.setError(field as keyof RecordPaymentFormValues, { message });
          }
        }
        toast({
          variant: "error",
          title: "Could not record payment",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not record payment",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;
  const watchedAmount = Number(form.watch("amount"));
  const exceedsOutstanding =
    Number.isFinite(watchedAmount) && watchedAmount > outstandingBalance;
  const isSubmitDisabled = isSubmitting || exceedsOutstanding;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("max-h-[90vh] overflow-y-auto sm:max-w-lg", appFont.className)}
        data-testid="record-payment-dialog"
      >
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            Capture a payment against {invoice.name || `invoice #${invoice.id}`}.
            Outstanding balance {formatInvoiceAmount(outstandingBalance)}.
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
                      data-testid="record-payment-amount"
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
                      id="record-payment-method"
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
                      data-testid="record-payment-date"
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
                      data-testid="record-payment-note"
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
                  "Save"
                )}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
