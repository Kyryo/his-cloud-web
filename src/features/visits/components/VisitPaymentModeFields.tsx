"use client";

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CustomerInsurance } from "@/features/customers/types/customer-insurance.types";

type VisitPaymentModeFieldValues = FieldValues & {
  mode_of_payment: "cash" | "insurance";
  insurance_scheme?: string | null;
};

type VisitPaymentModeFieldsProps<T extends VisitPaymentModeFieldValues> = {
  form: UseFormReturn<T>;
  insuranceSchemes: CustomerInsurance[];
  showRequiredMarker?: boolean;
};

export function VisitPaymentModeFields<T extends VisitPaymentModeFieldValues>({
  form,
  insuranceSchemes,
  showRequiredMarker = true,
}: VisitPaymentModeFieldsProps<T>) {
  const modeOfPayment = form.watch("mode_of_payment" as Path<T>);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={"mode_of_payment" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Mode of payment{" "}
              {showRequiredMarker ? (
                <span className="text-red-500">*</span>
              ) : null}
            </FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {modeOfPayment === "insurance" ? (
        <FormField
          control={form.control}
          name={"insurance_scheme" as Path<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Insurance scheme{" "}
                {showRequiredMarker ? (
                  <span className="text-red-500">*</span>
                ) : null}
              </FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={insuranceSchemes.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select insurance scheme" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
              {insuranceSchemes.length === 0 ? (
                <p className="text-xs text-brand-muted">
                  This client has no insurance schemes on file.
                </p>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}
    </div>
  );
}
