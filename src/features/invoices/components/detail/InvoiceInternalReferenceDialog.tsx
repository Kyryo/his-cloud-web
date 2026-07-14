"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  updateInvoiceInternalReferenceSchema,
  type UpdateInvoiceInternalReferenceFormValues,
} from "@/features/invoices/schemas/internal-reference.schema";
import { updateInvoiceInternalReference } from "@/features/invoices/services/invoices.service";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type InvoiceInternalReferenceDialogProps = {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (invoice: Invoice) => void;
};

export function InvoiceInternalReferenceDialog({
  invoice,
  open,
  onOpenChange,
  onSaved,
}: InvoiceInternalReferenceDialogProps) {
  const { toast } = useToast();
  const form = useForm<UpdateInvoiceInternalReferenceFormValues>({
    resolver: zodResolver(updateInvoiceInternalReferenceSchema),
    defaultValues: {
      internal_reference: invoice.internal_reference ?? "",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    form.reset({
      internal_reference: invoice.internal_reference ?? "",
    });
  }, [form, invoice.internal_reference, open]);

  async function handleSubmit(values: UpdateInvoiceInternalReferenceFormValues) {
    try {
      const updated = await updateInvoiceInternalReference(invoice.id, {
        internal_reference: values.internal_reference.trim(),
      });
      toast({
        variant: "success",
        title: "Internal reference saved",
        description: "The invoice internal reference was updated.",
      });
      onSaved(updated);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in form.getValues()) {
            form.setError(
              field as keyof UpdateInvoiceInternalReferenceFormValues,
              { message },
            );
          }
        }
        toast({
          variant: "error",
          title: "Could not save internal reference",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not save internal reference",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("sm:max-w-lg", appFont.className)}
        data-testid="invoice-internal-reference-dialog"
      >
        <DialogHeader>
          <DialogTitle>Internal reference</DialogTitle>
          <DialogDescription>
            Add an internal note for {invoice.name || `invoice #${invoice.id}`}.
            This is not shown on the customer-facing invoice.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="internal_reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="e.g. Follow up with finance on 15 Jul"
                      disabled={isSubmitting}
                      data-testid="invoice-internal-reference-input"
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
              <PrimaryButton type="submit" disabled={isSubmitting}>
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
