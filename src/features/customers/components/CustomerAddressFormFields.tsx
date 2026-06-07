"use client";

import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";

import { CountrySelectField } from "@/components/country-select-field";
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
import type { CreateCustomerAddressFormValues } from "@/features/customers/schemas/customer-address.schema";
import { CUSTOMER_ADDRESS_TYPE_OPTIONS } from "@/features/customers/types/customer-address.types";
import { appFont } from "@/lib/fonts";
import { useUser } from "@/providers/user-provider";

type CustomerAddressFormFieldsProps = {
  form: UseFormReturn<CreateCustomerAddressFormValues>;
  isSubmitting: boolean;
  idPrefix?: string;
};

export function CustomerAddressFormFields({
  form,
  isSubmitting,
  idPrefix = "create-customer-address",
}: CustomerAddressFormFieldsProps) {
  const { userData } = useUser();
  const tenantCountry = userData?.tenant?.country ?? null;

  useEffect(() => {
    if (!form.getValues("country") && tenantCountry) {
      form.setValue("country", tenantCountry, { shouldDirty: false });
    }
  }, [form, tenantCountry]);

  return (
    <>
      <FormField
        control={form.control}
        name="address_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Address type <RequiredFieldMarker />
            </FormLabel>
            <Select
              disabled={isSubmitting}
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger data-testid={`${idPrefix}-address-type`}>
                  <SelectValue placeholder="Select address type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className={appFont.className}>
                {CUSTOMER_ADDRESS_TYPE_OPTIONS.map((option) => (
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
        name="line1"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Address line 1 <RequiredFieldMarker />
            </FormLabel>
            <FormControl>
              <Input
                disabled={isSubmitting}
                data-testid={`${idPrefix}-line1`}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="line2"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address line 2</FormLabel>
            <FormControl>
              <Input disabled={isSubmitting} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="state_province"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State / province</FormLabel>
              <FormControl>
                <Input disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="postal_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal code</FormLabel>
              <FormControl>
                <Input disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <CountrySelectField
                  value={field.value ?? ""}
                  disabled={isSubmitting}
                  hasError={Boolean(fieldState.error)}
                  tenantCountryName={tenantCountry}
                  onChange={field.onChange}
                  data-testid={`${idPrefix}-country`}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="is_primary"
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
              Set as primary address
            </FormLabel>
          </FormItem>
        )}
      />
    </>
  );
}
