"use client";

import { useMemo, useState } from "react";
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
import { DateTimeLocalInput } from "@/components/ui/datetime-local-input";
import { Textarea } from "@/components/ui/textarea";
import { CareProviderCombobox } from "@/features/appointments/components/CareProviderCombobox";
import type { CreateAppointmentFormValues } from "@/features/appointments/schemas/appointment.schema";
import type {
  ClinicalClinic,
  ClinicalDepartment,
} from "@/features/clinical/types/clinical-catalog.types";

type AppointmentFormFieldsProps = {
  form: UseFormReturn<CreateAppointmentFormValues>;
  clinics: ClinicalClinic[];
  departments: ClinicalDepartment[];
  selectedClinicId: number | null;
  selectedClinicUuid: string;
  selectedClinicianName: string | null;
  onClinicianChange: (id: number | null, name: string | null) => void;
  onClinicChange: (clinicUuid: string, clinicId: number | null) => void;
  showDetails?: boolean;
};

export function AppointmentFormFields({
  form,
  clinics,
  departments,
  selectedClinicId,
  selectedClinicUuid,
  selectedClinicianName,
  onClinicianChange,
  onClinicChange,
  showDetails = true,
}: AppointmentFormFieldsProps) {
  const [clinicOpen, setClinicOpen] = useState(false);
  const [clinicSearch, setClinicSearch] = useState("");
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [departmentSearch, setDepartmentSearch] = useState("");

  const filteredClinics = useMemo(() => {
    const term = clinicSearch.trim().toLowerCase();
    if (!term) return clinics;
    return clinics.filter(
      (clinic) =>
        clinic.name.toLowerCase().includes(term) ||
        clinic.code.toLowerCase().includes(term),
    );
  }, [clinicSearch, clinics]);

  const filteredDepartments = useMemo(() => {
    const term = departmentSearch.trim().toLowerCase();
    if (!term) return departments;
    return departments.filter(
      (department) =>
        department.name.toLowerCase().includes(term) ||
        department.code.toLowerCase().includes(term),
    );
  }, [departmentSearch, departments]);

  return (
    <div className="space-y-5">
      <FormField
        control={form.control}
        name="clinic"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Clinic <span className="text-red-500">*</span>
            </FormLabel>
            <Select
              value={field.value}
              open={clinicOpen}
              onOpenChange={(open) => {
                setClinicOpen(open);
                if (!open) {
                  setClinicSearch("");
                }
              }}
              onValueChange={(value) => {
                field.onChange(value);
                form.setValue("department", "");
                onClinicianChange(null, null);
                form.setValue("clinician", null);
                const clinicId = clinics.find((clinic) => clinic.uuid === value)?.id ?? null;
                onClinicChange(value, clinicId);
              }}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a clinic" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <div className="border-b border-brand-border p-2">
                  <Input
                    value={clinicSearch}
                    placeholder="Search clinics..."
                    className="h-9"
                    onChange={(event) => setClinicSearch(event.target.value)}
                    onKeyDown={(event) => event.stopPropagation()}
                  />
                </div>
                {filteredClinics.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-brand-muted">
                    No clinics found.
                  </div>
                ) : (
                  filteredClinics.map((clinic) => (
                    <SelectItem key={clinic.uuid} value={clinic.uuid}>
                      <div className="flex flex-col items-start">
                        <span>{clinic.name}</span>
                        <span className="text-xs text-brand-muted">{clinic.code}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

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
              open={departmentOpen}
              onOpenChange={(open) => {
                setDepartmentOpen(open);
                if (!open) {
                  setDepartmentSearch("");
                }
              }}
              onValueChange={field.onChange}
              disabled={!selectedClinicId || departments.length === 0}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <div className="border-b border-brand-border p-2">
                  <Input
                    value={departmentSearch}
                    placeholder="Search departments..."
                    className="h-9"
                    onChange={(event) => setDepartmentSearch(event.target.value)}
                    onKeyDown={(event) => event.stopPropagation()}
                  />
                </div>
                {filteredDepartments.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-brand-muted">
                    {selectedClinicId ? "No departments found." : "Select a clinic first."}
                  </div>
                ) : (
                  filteredDepartments.map((department) => (
                    <SelectItem key={department.uuid} value={department.uuid}>
                      <div className="flex flex-col items-start">
                        <span>{department.name}</span>
                        <span className="text-xs text-brand-muted">{department.code}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="clinician"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <CareProviderCombobox
                value={field.value ?? null}
                displayName={selectedClinicianName}
                clinicUuid={selectedClinicUuid || undefined}
                disabled={!selectedClinicUuid}
                onSelect={(provider) => {
                  field.onChange(provider?.id ?? null);
                  onClinicianChange(provider?.id ?? null, provider?.name ?? null);
                }}
              />
            </FormControl>
            <p className="text-xs text-brand-muted">
              Optional. Assign a doctor or nurse for this appointment.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="scheduled_start"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Start <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <DateTimeLocalInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="scheduled_end"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                End <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <DateTimeLocalInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {showDetails ? (
        <>
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason for visit</FormLabel>
                <FormControl>
                  <Input placeholder="Follow-up, new complaint..." {...field} />
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
                <FormLabel>Internal notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Optional scheduling notes for the care team..."
                    className="min-h-24 resize-y bg-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      ) : null}
    </div>
  );
}
