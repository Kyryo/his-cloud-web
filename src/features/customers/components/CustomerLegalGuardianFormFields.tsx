"use client";

import type { UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormDescription,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { CreateCustomerLegalGuardianFormValues } from "@/features/customers/schemas/customer-legal-guardian.schema";
import { CUSTOMER_LEGAL_GUARDIAN_RELATIONSHIP_OPTIONS } from "@/features/customers/types/customer-legal-guardian.types";
import { appFont } from "@/lib/fonts";

type CustomerLegalGuardianFormFieldsProps = {
  form: UseFormReturn<CreateCustomerLegalGuardianFormValues>;
  isSubmitting: boolean;
  idPrefix?: string;
};

export function CustomerLegalGuardianFormFields({
  form,
  isSubmitting,
  idPrefix = "create-customer-legal-guardian",
}: CustomerLegalGuardianFormFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="full_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor={`${idPrefix}-full-name`}>
              Full name <RequiredFieldMarker />
            </FormLabel>
            <FormControl>
              <Input
                id={`${idPrefix}-full-name`}
                disabled={isSubmitting}
                autoComplete="name"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="relationship"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Relationship <RequiredFieldMarker />
            </FormLabel>
            <Select
              disabled={isSubmitting}
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger data-testid={`${idPrefix}-relationship`}>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className={appFont.className}>
                {CUSTOMER_LEGAL_GUARDIAN_RELATIONSHIP_OPTIONS.map((option) => (
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

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={`${idPrefix}-phone`}>Phone</FormLabel>
              <FormControl>
                <Input
                  id={`${idPrefix}-phone`}
                  disabled={isSubmitting}
                  autoComplete="tel"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={`${idPrefix}-email`}>Email</FormLabel>
              <FormControl>
                <Input
                  id={`${idPrefix}-email`}
                  type="email"
                  disabled={isSubmitting}
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="national_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor={`${idPrefix}-national-id`}>National ID</FormLabel>
            <FormControl>
              <Input id={`${idPrefix}-national-id`} disabled={isSubmitting} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor={`${idPrefix}-notes`}>Notes</FormLabel>
            <FormControl>
              <Textarea
                id={`${idPrefix}-notes`}
                disabled={isSubmitting}
                rows={3}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="is_primary"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border border-brand-border px-4 py-3">
            <div className="space-y-0.5">
              <FormLabel>Primary guardian</FormLabel>
              <FormDescription>
                Mark this person as the primary legal guardian for this client.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                disabled={isSubmitting}
                onCheckedChange={field.onChange}
                data-testid={`${idPrefix}-is-primary`}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
}
