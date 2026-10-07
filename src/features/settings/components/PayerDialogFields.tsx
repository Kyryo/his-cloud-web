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
import { RegistryPayerPicker } from "@/features/settings/components/RegistryPayerPicker";
import type { CreateOrganizationPayerFormValues } from "@/features/settings/schemas/organization-payer.schema";

export type PayerDialogTab = "general" | "contact";

const generalFields = ["name", "code", "registry_payer", "description"] as const;
const contactFields = ["email", "phone_number", "address"] as const;

export function payerTabForFieldErrors(
  fields: string[],
  current: PayerDialogTab,
): PayerDialogTab {
  const hasContact = fields.some((field) =>
    (contactFields as readonly string[]).includes(field),
  );
  const hasGeneral = fields.some((field) =>
    (generalFields as readonly string[]).includes(field),
  );
  if (current === "general" && hasContact && !hasGeneral) {
    return "contact";
  }
  if (current === "contact" && hasGeneral && !hasContact) {
    return "general";
  }
  if (hasGeneral) {
    return "general";
  }
  if (hasContact) {
    return "contact";
  }
  return current;
}

type PayerDialogFieldsProps = {
  form: UseFormReturn<CreateOrganizationPayerFormValues>;
  activeTab: PayerDialogTab;
  disabled?: boolean;
};

export function PayerDialogFields({
  form,
  activeTab,
  disabled = false,
}: PayerDialogFieldsProps) {
  if (activeTab === "contact") {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} autoComplete="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input type="tel" {...field} autoComplete="tel" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="street-address" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="registry_payer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Link to registry payer (optional)</FormLabel>
            <FormControl>
              <RegistryPayerPicker
                value={field.value ?? null}
                onChange={field.onChange}
                disabled={disabled}
              />
            </FormControl>
            <FormDescription>
              Lets this payer use the registry&apos;s capabilities, such as
              member search, benefits, automatic claim submission, and closing
              claims. Your name and code stay as you entered them.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Input {...field} autoComplete="off" disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
