"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { fetchCustomer } from "@/features/customers/services/customers.service";
import type { Payment } from "@/features/payments/types/payment.types";
import { sendPaymentReceipt } from "@/features/payments/services/payments.service";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const CUSTOM_EMAIL_VALUE = "__custom__";

const sendReceiptSchema = z
  .object({
    emailChoice: z.string().trim().min(1, "Select an email"),
    customEmail: z.string().trim(),
  })
  .superRefine((values, context) => {
    if (values.emailChoice !== CUSTOM_EMAIL_VALUE) {
      return;
    }

    const parsed = z.string().email().safeParse(values.customEmail);
    if (!parsed.success) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid email address",
        path: ["customEmail"],
      });
    }
  });

type SendReceiptFormValues = z.infer<typeof sendReceiptSchema>;

type SendReceiptEmailDialogProps = {
  payment: Payment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SendReceiptEmailDialog({
  payment,
  open,
  onOpenChange,
}: SendReceiptEmailDialogProps) {
  const { toast } = useToast();
  const [savedEmails, setSavedEmails] = useState<string[]>([]);
  const form = useForm<SendReceiptFormValues>({
    resolver: zodResolver(sendReceiptSchema),
    defaultValues: {
      emailChoice: CUSTOM_EMAIL_VALUE,
      customEmail: "",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    void (async () => {
      let emails: string[] = [];
      if (payment.customer_uuid) {
        try {
          const customer = await fetchCustomer(payment.customer_uuid);
          const email = customer.email?.trim();
          if (email) {
            emails = [email];
          }
        } catch {
          emails = [];
        }
      }

      if (cancelled) {
        return;
      }

      setSavedEmails(emails);
      form.reset({
        emailChoice: emails[0] ?? CUSTOM_EMAIL_VALUE,
        customEmail: emails[0] ?? "",
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [form, open, payment.customer_uuid]);

  const emailChoice = form.watch("emailChoice");
  const emailOptions = useMemo(
    () => [
      ...savedEmails.map((email) => ({
        value: email,
        label: `${email} (client)`,
      })),
      { value: CUSTOM_EMAIL_VALUE, label: "Use another email" },
    ],
    [savedEmails],
  );

  async function handleSubmit(values: SendReceiptFormValues) {
    const email =
      values.emailChoice === CUSTOM_EMAIL_VALUE
        ? values.customEmail.trim()
        : values.emailChoice.trim();

    try {
      await sendPaymentReceipt(payment.id, { email });
      toast({
        variant: "success",
        title: "Receipt queued",
        description: `A receipt email will be sent to ${email}.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not send receipt",
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
        data-testid="send-receipt-email-dialog"
      >
        <DialogHeader>
          <DialogTitle>Send receipt via email</DialogTitle>
          <DialogDescription>
            Send a receipt for {payment.name || `payment #${payment.id}`} to the
            client or another recipient.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="emailChoice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient</FormLabel>
                  <FormControl>
                    <FilterSelectField
                      id="send-receipt-email-choice"
                      label=""
                      value={field.value}
                      options={emailOptions}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {emailChoice === CUSTOM_EMAIL_VALUE ? (
              <FormField
                control={form.control}
                name="customEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        autoComplete="email"
                        disabled={isSubmitting}
                        data-testid="send-receipt-custom-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

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
                    Sending...
                  </>
                ) : (
                  "Send receipt"
                )}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
