"use client";

import Link from "next/link";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { PrimaryButton } from "@/components/ui/app-buttons";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { StatusBanner } from "@/components/ui/status-banner";
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
import type { CustomerInsurance } from "@/features/customers/types/customer-insurance.types";
import { customerDetailTabHref } from "@/features/customers/utils/customer-detail-tabs";
import { StartVisitChoiceRow } from "@/features/visits/components/StartVisitChoiceRow";

const PAYMENT_OPTIONS = [
  {
    value: "free" as const,
    label: "Free",
    hint: "No charges for this visit",
  },
  {
    value: "cash" as const,
    label: "Cash",
    hint: "Collect at reception",
  },
  {
    value: "insurance" as const,
    label: "Insurance / payer",
    hint: "Bill a scheme or partner company on file",
  },
];

export type VisitStartPaymentFieldValues = FieldValues & {
  mode_of_payment: "cash" | "insurance" | "free";
  insurance_scheme?: string;
  requires_pre_authorization: boolean;
  pre_authorization_number: string;
  pre_authorization_comments: string;
};

type StartVisitPaymentChoiceProps<T extends VisitStartPaymentFieldValues> = {
  form: UseFormReturn<T>;
  insuranceSchemes: CustomerInsurance[];
  customerUuid: string;
  onInsuranceHrefClick?: () => void;
};

export function StartVisitPaymentChoice<T extends VisitStartPaymentFieldValues>({
  form,
  insuranceSchemes,
  customerUuid,
  onInsuranceHrefClick,
}: StartVisitPaymentChoiceProps<T>) {
  const modeOfPayment = form.watch("mode_of_payment" as Path<T>);
  const requiresPreAuth = form.watch("requires_pre_authorization" as Path<T>);
  const selectedSchemeUuid = form.watch("insurance_scheme" as Path<T>) as
    | string
    | undefined;
  const selectedScheme =
    insuranceSchemes.find((scheme) => scheme.uuid === selectedSchemeUuid) ?? null;
  const hasAssignedInsurance = insuranceSchemes.length > 0;

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name={"mode_of_payment" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Paying with <RequiredFieldMarker />
            </FormLabel>
            <FormControl>
              <div
                role="radiogroup"
                aria-label="Mode of payment"
                className="divide-y divide-dash-border/70 border-y border-dash-border/70"
              >
                {PAYMENT_OPTIONS.map((option) => (
                  <StartVisitChoiceRow
                    key={option.value}
                    selected={field.value === option.value}
                    title={option.label}
                    hint={option.hint}
                    onSelect={() => field.onChange(option.value)}
                  />
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {modeOfPayment === "insurance" && !hasAssignedInsurance ? (
        <StatusBanner
          variant="warning"
          message="This client has no insurance assigned."
          description="Add a scheme on the client before you can start an insured visit."
        >
          <PrimaryButton asChild size="sm" className="mt-2">
            <Link
              href={customerDetailTabHref(customerUuid, "insurance")}
              onClick={onInsuranceHrefClick}
            >
              Add insurance
            </Link>
          </PrimaryButton>
        </StatusBanner>
      ) : null}

      {modeOfPayment === "insurance" && hasAssignedInsurance ? (
        <>
          <FormField
            control={form.control}
            name={"insurance_scheme" as Path<T>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Scheme or company details <RequiredFieldMarker />
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select a scheme" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="z-[60]">
                    {insuranceSchemes.map((scheme) => (
                      <SelectItem key={scheme.uuid} value={scheme.uuid}>
                        {scheme.scheme_name}
                        {scheme.insurance_company_name
                          ? ` · ${scheme.insurance_company_name}`
                          : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedScheme?.membership_number ? (
                  <p className="text-xs text-dash-muted">
                    {selectedScheme.membership_number}
                  </p>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={"requires_pre_authorization" as Path<T>}
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-4 border-t border-dash-border/70 pt-4">
                <FormLabel className="text-sm font-medium text-brand-navy">
                  Pre-authorization required
                </FormLabel>
                <FormControl>
                  <Switch
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                    aria-label="Requires pre-authorization"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {requiresPreAuth ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name={"pre_authorization_number" as Path<T>}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Auth number <RequiredFieldMarker />
                    </FormLabel>
                    <FormControl>
                      <Input className="h-11" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={"pre_authorization_comments" as Path<T>}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input className="h-11" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
