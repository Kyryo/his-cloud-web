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
import type { ClinicalDepartment } from "@/features/clinical/types/clinical-catalog.types";
import type { CustomerInsurance } from "@/features/customers/types/customer-insurance.types";
import { VisitPaymentModeFields } from "@/features/visits/components/VisitPaymentModeFields";
import type { StartVisitFormValues } from "@/features/visits/schemas/start-visit.schema";
import type { ConsultationServiceCatalogItem } from "@/features/visits/types/visit.types";

type StartVisitFormFieldsProps = {
  form: UseFormReturn<StartVisitFormValues>;
  tab: "visit" | "payment";
  defaultClinicName: string;
  departments: ClinicalDepartment[];
  consultationServices: ConsultationServiceCatalogItem[];
  insuranceSchemes: CustomerInsurance[];
  consultationServiceSearch: string;
  onConsultationServiceSearchChange: (value: string) => void;
  selectedClinicId: number | null;
};

export function StartVisitFormFields({
  form,
  tab,
  defaultClinicName,
  departments,
  consultationServices,
  insuranceSchemes,
  consultationServiceSearch,
  onConsultationServiceSearchChange,
  selectedClinicId,
}: StartVisitFormFieldsProps) {
  const modeOfPayment = form.watch("mode_of_payment");
  const requiresPreAuth = form.watch("requires_pre_authorization");

  const filteredServices = consultationServices.filter((service) =>
    service.name.toLowerCase().includes(consultationServiceSearch.toLowerCase()),
  );

  if (tab === "visit") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-brand-border bg-slate-50/60 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">
            Clinic
          </p>
          <p className="mt-1 text-sm font-medium text-brand-navy">{defaultClinicName}</p>
          <p className="mt-1 text-xs text-brand-muted">
            Visits are started at your assigned default clinic.
          </p>
        </div>

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Department <span className="text-red-500">*</span>
              </FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedClinicId || departments.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department.uuid} value={department.uuid}>
                      {department.name}
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
          name="consultation_service"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Consultation service <span className="text-red-500">*</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a consultation service" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-72">
                  <div className="border-b border-brand-border p-2">
                    <Input
                      type="search"
                      placeholder="Search services..."
                      value={consultationServiceSearch}
                      onChange={(event) =>
                        onConsultationServiceSearchChange(event.target.value)
                      }
                    />
                  </div>
                  {filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                      <SelectItem key={service.uuid} value={service.uuid}>
                        {service.name}
                      </SelectItem>
                    ))
                  ) : (
                    <p className="px-2 py-3 text-center text-sm text-brand-muted">
                      No consultation services found
                    </p>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="visit_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Visit date & time <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
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
      <VisitPaymentModeFields form={form} insuranceSchemes={insuranceSchemes} />

      {modeOfPayment === "insurance" ? (
        <>
          <FormField
            control={form.control}
            name="requires_pre_authorization"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                    className="size-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  Requires pre-authorization
                </FormLabel>
              </FormItem>
            )}
          />

          {requiresPreAuth ? (
            <>
              <FormField
                control={form.control}
                name="pre_authorization_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Pre-authorization number{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="AUTH123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pre_authorization_comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pre-authorization comments</FormLabel>
                    <FormControl>
                      <Input placeholder="Additional notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
