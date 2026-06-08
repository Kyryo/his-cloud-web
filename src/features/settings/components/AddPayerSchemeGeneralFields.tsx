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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateOrganizationPayerSchemeFormValues } from "@/features/settings/schemas/organization-payer-scheme.schema";
import type { OrganizationPayer } from "@/features/settings/types/settings.types";

type AddPayerSchemeGeneralFieldsProps = {
  form: UseFormReturn<CreateOrganizationPayerSchemeFormValues>;
  payers: OrganizationPayer[];
};

export function AddPayerSchemeGeneralFields({
  form,
  payers,
}: AddPayerSchemeGeneralFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="insurance_company"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Payer</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={payers.length === 0}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      payers.length === 0
                        ? "Add a payer first"
                        : "Select a payer"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {payers.map((payer) => (
                  <SelectItem key={payer.uuid} value={String(payer.id)}>
                    {payer.name} ({payer.code})
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
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Scheme name</FormLabel>
            <FormControl>
              <Input {...field} autoComplete="off" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" />
              </FormControl>
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
                <Input {...field} autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
