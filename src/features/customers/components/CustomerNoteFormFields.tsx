"use client";

import type { UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateCustomerNoteFormValues } from "@/features/customers/schemas/customer-note.schema";
import { CUSTOMER_NOTE_TYPE_OPTIONS } from "@/features/customers/types/customer-note.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type CustomerNoteFormFieldsProps<T extends CreateCustomerNoteFormValues> = {
  form: UseFormReturn<T>;
  isSubmitting: boolean;
  idPrefix?: string;
};

export function CustomerNoteFormFields<T extends CreateCustomerNoteFormValues>({
  form,
  isSubmitting,
  idPrefix = "create-customer-note",
}: CustomerNoteFormFieldsProps<T>) {
  return (
    <>
      <FormField
        control={form.control}
        name="note_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Note type</FormLabel>
            <Select
              disabled={isSubmitting}
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger data-testid={`${idPrefix}-note-type`}>
                  <SelectValue placeholder="Select note type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className={appFont.className}>
                {CUSTOMER_NOTE_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input
                disabled={isSubmitting}
                placeholder="Optional title"
                data-testid={`${idPrefix}-title`}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="body"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Note <RequiredFieldMarker />
            </FormLabel>
            <FormControl>
              <textarea
                disabled={isSubmitting}
                rows={5}
                placeholder="Enter note details"
                data-testid={`${idPrefix}-body`}
                className={cn(
                  "flex min-h-[7.5rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                )}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="is_pinned"
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
              Pin this note
            </FormLabel>
          </FormItem>
        )}
      />
    </>
  );
}
