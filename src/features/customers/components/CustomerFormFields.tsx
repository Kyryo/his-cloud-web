"use client";

import type { UseFormReturn } from "react-hook-form";

import { DateOfBirthField } from "@/components/date-of-birth-field";
import { PhoneNumberInput } from "@/components/phone-number-input";
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
import type { CreateCustomerFormValues } from "@/features/customers/schemas/customer.schema";
import { appFont } from "@/lib/fonts";
import { validateDateInput } from "@/lib/validate-date-input";

type CustomerFormFieldsProps = {
  form: UseFormReturn<CreateCustomerFormValues>;
  isSubmitting: boolean;
  fieldsDisabled?: boolean;
  idPrefix?: string;
};

export function CustomerFormFields({
  form,
  isSubmitting,
  fieldsDisabled = false,
  idPrefix = "customer",
}: CustomerFormFieldsProps) {
  const disabled = isSubmitting || fieldsDisabled;

  function handleDateOfBirthChange(value: string) {
    const error = validateDateInput(value, {
      futureMessage: "Date of birth cannot be in the future.",
    });

    if (error) {
      form.setError("dob", { type: "manual", message: error });
    } else {
      form.clearErrors("dob");
    }
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                First name <RequiredFieldMarker />
              </FormLabel>
              <FormControl>
                <Input
                  autoComplete="given-name"
                  disabled={disabled}
                  data-testid={`${idPrefix}-first-name`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="middle_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Middle name</FormLabel>
              <FormControl>
                <Input disabled={disabled} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="last_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Last name <RequiredFieldMarker />
            </FormLabel>
            <FormControl>
              <Input
                autoComplete="family-name"
                disabled={disabled}
                data-testid={`${idPrefix}-last-name`}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Gender <RequiredFieldMarker />
              </FormLabel>
              <Select
                disabled={disabled}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger data-testid={`${idPrefix}-gender`}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className={appFont.className}>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dob"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Date of birth</FormLabel>
              <FormControl>
                <DateOfBirthField
                  id={`${idPrefix}-dob`}
                  value={field.value ?? ""}
                  disabled={disabled}
                  hasError={Boolean(fieldState.error)}
                  onChange={(value) => {
                    field.onChange(value);
                    handleDateOfBirthChange(value);
                  }}
                  data-testid={`${idPrefix}-dob`}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="dob_is_estimated"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center gap-3 space-y-0">
            <FormControl>
              <input
                type="checkbox"
                disabled={disabled}
                checked={field.value}
                onChange={field.onChange}
                className="size-4 rounded border-input"
              />
            </FormControl>
            <FormLabel className="font-normal text-brand-slate">
              Date of birth is estimated
            </FormLabel>
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <PhoneNumberInput
                  value={field.value ?? ""}
                  disabled={disabled}
                  hasError={Boolean(fieldState.error)}
                  onChange={field.onChange}
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  disabled={disabled}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
