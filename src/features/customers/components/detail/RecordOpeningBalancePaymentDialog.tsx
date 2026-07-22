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
import { CustomerAppointmentPicker } from "@/features/customers/components/CustomerAppointmentPicker";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  buildRecordPaymentDefaultValues,
  buildRecordPaymentSchema,
  PAYMENT_METHOD_OPTIONS,
  toRecordOpeningBalancePaymentPayload,
  type RecordPaymentFormValues,
} from "@/features/payments/schemas/record-payment.schema";
import { createPayment } from "@/features/payments/services/payments.service";
import type { Payment } from "@/features/payments/types/payment.types";
import { formatSalesOrderAmount } from "@/features/sales-orders/utils/format-sales-order";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type RecordOpeningBalancePaymentDialogProps = {
  customer: Customer | null;
  remainingBalance: number;
  open: boolean;
  canRecord: boolean;
  onOpenChange: (open: boolean) => void;
  onRecorded: (payment: Payment) => void;
  showCustomerPicker?: boolean;
  isLoadingRemaining?: boolean;
  onCustomerChange?: (customer: Customer | null) => void;
};

export function RecordOpeningBalancePaymentDialog({
  customer,
  remainingBalance,
  open,
  canRecord,
  onOpenChange,
  onRecorded,
  showCustomerPicker = false,
  isLoadingRemaining = false,
  onCustomerChange,
}: RecordOpeningBalancePaymentDialogProps) {
  const { toast } = useToast();
  const hasUnpaidOpeningBalance = remainingBalance > 0;
  const canSubmitPayment =
    Boolean(customer) &&
    hasUnpaidOpeningBalance &&
    !isLoadingRemaining;
  const showPaymentFields = showCustomerPicker
    ? canSubmitPayment
    : Boolean(customer);

  const validationSchema = useMemo(
    () => buildRecordPaymentSchema(remainingBalance),
    [remainingBalance],
  );
  const form = useForm<RecordPaymentFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: buildRecordPaymentDefaultValues(remainingBalance),
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    form.reset(buildRecordPaymentDefaultValues(remainingBalance));
  }, [form, open, remainingBalance]);

  async function handleSubmit(values: RecordPaymentFormValues) {
    if (!customer || !canSubmitPayment) {
      return;
    }

    try {
      const payment = await createPayment(
        toRecordOpeningBalancePaymentPayload(customer, values),
      );
      toast({
        variant: "success",
        title: "Payment recorded",
        description: `${payment.name || "Payment"} was saved against the opening balance.`,
      });
      onRecorded(payment);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in buildRecordPaymentDefaultValues(remainingBalance)) {
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
    Number.isFinite(watchedAmount) && watchedAmount > remainingBalance;
  const isSubmitDisabled = showCustomerPicker
    ? isSubmitting || exceedsOutstanding || !canSubmitPayment
    : isSubmitting || exceedsOutstanding || !customer;

  const description = showCustomerPicker
    ? customer
      ? isLoadingRemaining
        ? "Loading this client's unpaid opening balance..."
        : hasUnpaidOpeningBalance
          ? `Capture a payment against this client's unpaid opening balance. Remaining ${formatSalesOrderAmount(remainingBalance, "MWK")}.`
          : "This client has no unpaid opening balance to record a payment against."
      : "Select a client with an unpaid opening balance to record a payment."
    : `Capture a payment against this client's unpaid opening balance. Remaining ${formatSalesOrderAmount(remainingBalance, "MWK")}.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("max-h-[90vh] overflow-y-auto sm:max-w-lg", appFont.className)}
        data-testid="record-opening-balance-payment-dialog"
      >
        <DialogHeader>
          <DialogTitle>Record opening balance payment</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {canRecord ? (
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
              {showCustomerPicker ? (
                <CustomerAppointmentPicker
                  customer={customer}
                  onCustomerChange={(next) => onCustomerChange?.(next)}
                  disabled={isSubmitting}
                />
              ) : null}

              {showCustomerPicker && customer && isLoadingRemaining ? (
                <div className="flex items-center gap-2 py-2 text-sm text-brand-muted">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Checking opening balance...
                </div>
              ) : null}

              {showCustomerPicker &&
              customer &&
              !isLoadingRemaining &&
              !hasUnpaidOpeningBalance ? (
                <div
                  className="rounded-xl border border-brand-border bg-white px-4 py-6 text-center"
                  data-testid="record-ob-payment-no-balance"
                >
                  <p className="text-sm font-semibold text-brand-navy">
                    No unpaid opening balance
                  </p>
                  <p className="mt-2 text-sm text-brand-muted">
                    Add or edit an opening balance on the client account before
                    recording a payment.
                  </p>
                </div>
              ) : null}

              {showPaymentFields ? (
                <>
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
                            data-testid="record-ob-payment-amount"
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
                            id="record-ob-payment-method"
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
                            data-testid="record-ob-payment-date"
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
                            data-testid="record-ob-payment-note"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : null}

              <DialogFooter>
                <SecondaryButton
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </SecondaryButton>
                {showPaymentFields ? (
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
                ) : null}
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <>
            <div
              className="rounded-xl border border-brand-border bg-white px-4 py-8 text-center"
              data-testid="record-ob-payment-access-denied"
            >
              <p className="text-sm font-semibold text-brand-navy">Access denied</p>
              <p className="mt-2 text-sm text-brand-muted">
                Only users in the Billing group can record opening-balance payments.
                Contact your administrator if you need access.
              </p>
            </div>
            <DialogFooter>
              <SecondaryButton type="button" onClick={() => onOpenChange(false)}>
                Close
              </SecondaryButton>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
