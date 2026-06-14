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
import { DateTimeLocalInput } from "@/components/ui/datetime-local-input";
import { Textarea } from "@/components/ui/textarea";
import { CareProviderCombobox } from "@/features/appointments/components/CareProviderCombobox";
import type { CreateAppointmentFormValues } from "@/features/appointments/schemas/appointment.schema";
import type {
  ClinicalClinic,
  ClinicalDepartment,
  ClinicalLocation,
} from "@/features/clinical/types/clinical-catalog.types";

type AppointmentFormFieldsProps = {
  form: UseFormReturn<CreateAppointmentFormValues>;
  clinics: ClinicalClinic[];
  departments: ClinicalDepartment[];
  locations: ClinicalLocation[];
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
  locations,
  selectedClinicId,
  selectedClinicUuid,
  selectedClinicianName,
  onClinicianChange,
  onClinicChange,
  showDetails = true,
}: AppointmentFormFieldsProps) {
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
              onValueChange={(value) => {
                field.onChange(value);
                form.setValue("department", "");
                form.setValue("location", "");
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
                {clinics.map((clinic) => (
                  <SelectItem key={clinic.uuid} value={clinic.uuid}>
                    {clinic.name}
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
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={!selectedClinicId || locations.length === 0}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Optional service point" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.uuid} value={location.uuid}>
                    {location.name}
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
