"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  toUpdateCustomerNoteFormValues,
  toUpdateCustomerNotePayload,
  updateCustomerNoteSchema,
  type UpdateCustomerNoteFormValues,
} from "@/features/customers/schemas/customer-note.schema";
import { updateCustomerNote } from "@/features/customers/services/customer-notes.service";
import type { CustomerNote } from "@/features/customers/types/customer-note.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type UpdateCustomerNoteDialogProps = {
  note: CustomerNote;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (note: CustomerNote) => void;
};

export function UpdateCustomerNoteDialog({
  note,
  open,
  onOpenChange,
  onUpdated,
}: UpdateCustomerNoteDialogProps) {
  const { toast } = useToast();
  const form = useForm<UpdateCustomerNoteFormValues>({
    resolver: zodResolver(updateCustomerNoteSchema),
    defaultValues: toUpdateCustomerNoteFormValues(note),
  });

  useEffect(() => {
    if (open) {
      form.reset(toUpdateCustomerNoteFormValues(note));
    }
  }, [form, note, open]);

  async function handleSubmit(values: UpdateCustomerNoteFormValues) {
    try {
      const updatedNote = await updateCustomerNote(
        note.uuid,
        toUpdateCustomerNotePayload(values),
      );
      toast({
        variant: "success",
        title: "Note updated",
        description: "The note was saved successfully.",
      });
      onUpdated(updatedNote);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in toUpdateCustomerNoteFormValues(note)) {
            form.setError(field as keyof UpdateCustomerNoteFormValues, {
              message,
            });
          }
        }
        toast({
          variant: "error",
          title: "Could not update note",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not update note",
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
        data-testid="update-customer-note-dialog"
      >
        <DialogHeader>
          <DialogTitle>Update note</DialogTitle>
          <DialogDescription>
            Edit this client&apos;s note details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <CustomerNoteFormFields
              form={form}
              isSubmitting={isSubmitting}
              idPrefix="update-customer-note"
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      disabled={isSubmitting}
                      checked={field.value}
                      onChange={field.onChange}
                      className="size-4 rounded border-input"
                    />
                  </FormControl>
                  <FormLabel className="font-normal text-brand-slate">
                    Note is active
                  </FormLabel>
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
