"use client";

import type { UseFormReturn } from "react-hook-form";

import { DateOfBirthField } from "@/components/date-of-birth-field";
import { CustomerInsuranceEmptyState } from "@/features/customers/components/CustomerInsuranceEmptyState";
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
import type { CreateCustomerInsuranceFormValues } from "@/features/customers/schemas/customer-insurance.schema";
import { applyPrincipalMemberDefaults } from "@/features/customers/schemas/customer-insurance.schema";
import { PRINCIPAL_MEMBER_RELATIONSHIPS } from "@/features/customers/types/customer-insurance.types";
import type { InsuranceScheme } from "@/features/customers/types/customer-insurance.types";
import { appFont } from "@/lib/fonts";
import { validateDateInput } from "@/lib/validate-date-input";

type CustomerInsuranceFormFieldsProps = {
  form: UseFormReturn<CreateCustomerInsuranceFormValues>;
  schemes: InsuranceScheme[];
  isLoadingSchemes: boolean;
  isSubmitting: boolean;
  customerFullName: string;
  idPrefix?: string;
};

export function CustomerInsuranceFormFields({
  form,
  schemes,
  isLoadingSchemes,
  isSubmitting,
  customerFullName,
  idPrefix = "create-customer-insurance",
}: CustomerInsuranceFormFieldsProps) {
  const isPrincipalMember = form.watch("is_principal_member");
  const dateJoinedNotAvailable = form.watch("date_joined_not_available");
  const availableRelationships = PRINCIPAL_MEMBER_RELATIONSHIPS.filter(
    (relationship) => relationship !== "Self",
  );

  function handleDateJoinedChange(value: string) {
    if (dateJoinedNotAvailable) {
      form.clearErrors("date_joined");
      return;
    }

    const error = validateDateInput(value, {
      futureMessage: "Date joined cannot be in the future.",
    });

    if (error) {
      form.setError("date_joined", { type: "manual", message: error });
    } else {
      form.clearErrors("date_joined");
    }
  }

  if (isLoadingSchemes) {
    return (
      <p className="text-sm text-brand-muted">Loading insurance schemes...</p>
    );
  }

  if (schemes.length === 0) {
    return <CustomerInsuranceEmptyState />;
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="insurance_scheme"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Insurance scheme <RequiredFieldMarker />
              </FormLabel>
              <Select
                disabled={isSubmitting}
                value={field.value > 0 ? String(field.value) : ""}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <FormControl>
                  <SelectTrigger data-testid={`${idPrefix}-scheme`}>
                    <SelectValue placeholder="Select an insurance scheme" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className={appFont.className}>
                  {schemes.map((scheme) => (
                    <SelectItem key={scheme.id} value={String(scheme.id)}>
                      {scheme.name}
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
          name="membership_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Membership number <RequiredFieldMarker />
              </FormLabel>
              <FormControl>
                <Input
                  disabled={isSubmitting}
                  data-testid={`${idPrefix}-membership-number`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="suffix"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Suffix</FormLabel>
              <FormControl>
                <Input
                  disabled={isSubmitting}
                  data-testid={`${idPrefix}-suffix`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date_joined"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Date joined</FormLabel>
              <FormControl>
                <DateOfBirthField
                  id={`${idPrefix}-date-joined`}
                  value={field.value ?? ""}
                  disabled={isSubmitting || dateJoinedNotAvailable}
                  hasError={Boolean(fieldState.error)}
                  onChange={(value) => {
                    field.onChange(value);
                    handleDateJoinedChange(value);
                  }}
                  data-testid={`${idPrefix}-date-joined`}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="date_joined_not_available"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center gap-3 space-y-0">
            <FormControl>
              <input
                type="checkbox"
                disabled={isSubmitting}
                checked={field.value}
                onChange={(event) => {
                  const checked = event.target.checked;
                  field.onChange(checked);
                  if (checked) {
                    form.setValue("date_joined", "");
                    form.clearErrors("date_joined");
                  } else {
                    form.setValue(
                      "date_joined",
                      new Date().toISOString().split("T")[0],
                    );
                  }
                }}
                className="size-4 rounded border-input"
              />
            </FormControl>
            <FormLabel className="font-normal text-brand-slate">
              Date joined not available
            </FormLabel>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="is_principal_member"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center gap-3 space-y-0">
            <FormControl>
              <input
                type="checkbox"
                disabled={isSubmitting}
                checked={field.value}
                onChange={(event) => {
                  const nextValues = applyPrincipalMemberDefaults(
                    form.getValues(),
                    customerFullName,
                    event.target.checked,
                  );
                  form.reset(nextValues);
                }}
                className="size-4 rounded border-input"
                data-testid={`${idPrefix}-is-principal-member`}
              />
            </FormControl>
            <FormLabel className="font-normal text-brand-slate">
              This client is the principal member
            </FormLabel>
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="principal_member_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Principal member name
                {!isPrincipalMember ? (
                  <>
                    {" "}
                    <RequiredFieldMarker />
                  </>
                ) : null}
              </FormLabel>
              <FormControl>
                <Input
                  disabled={isSubmitting || isPrincipalMember}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="relationship_to_principal_member"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relationship to principal member</FormLabel>
              {isPrincipalMember ? (
                <FormControl>
                  <Input disabled value="Self" />
                </FormControl>
              ) : (
                <Select
                  disabled={isSubmitting}
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className={appFont.className}>
                    {availableRelationships.map((relationship) => (
                      <SelectItem key={relationship} value={relationship}>
                        {relationship}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
