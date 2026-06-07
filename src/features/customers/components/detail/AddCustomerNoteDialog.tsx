"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { CustomerNoteFormFields } from "@/features/customers/components/CustomerNoteFormFields";
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
  createCustomerNoteDefaultValues,
  createCustomerNoteSchema,
  toCustomerNotePayload,
  type CreateCustomerNoteFormValues,
} from "@/features/customers/schemas/customer-note.schema";
import { createCustomerNote } from "@/features/customers/services/customer-notes.service";
import type { CustomerNote } from "@/features/customers/types/customer-note.types";
import type { Customer } from "@/features/customers/types/customer.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type AddCustomerNoteDialogProps = {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (note: CustomerNote) => void;
};

export function AddCustomerNoteDialog({
  customer,
  open,
  onOpenChange,
  onCreated,
}: AddCustomerNoteDialogProps) {
  const { toast } = useToast();
  const form = useForm<CreateCustomerNoteFormValues>({
    resolver: zodResolver(createCustomerNoteSchema),
    defaultValues: createCustomerNoteDefaultValues,
  });

  async function handleSubmit(values: CreateCustomerNoteFormValues) {
    try {
      const note = await createCustomerNote(
        toCustomerNotePayload(customer.id, values),
      );
      toast({
        variant: "success",
        title: "Note added",
        description: "The note was saved for this client.",
      });
      form.reset(createCustomerNoteDefaultValues);
      onCreated(note);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in createCustomerNoteDefaultValues) {
            form.setError(field as keyof CreateCustomerNoteFormValues, {
              message,
            });
          }
        }
        toast({
          variant: "error",
          title: "Could not add note",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not add note",
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
        data-testid="add-customer-note-dialog"
      >
        <DialogHeader>
          <DialogTitle>Add note</DialogTitle>
          <DialogDescription>
            Record a general, clinical, billing, or administrative note.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <CustomerNoteFormFields
              form={form}
              isSubmitting={isSubmitting}
              idPrefix="add-customer-note"
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
                  "Add note"
                )}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
