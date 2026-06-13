"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import {
  fetchClinicalClinics,
  fetchClinicalDepartments,
  fetchClinicalLocations,
} from "@/features/clinical/services/clinical-catalog.service";
import type {
  ClinicalClinic,
  ClinicalDepartment,
  ClinicalLocation,
} from "@/features/clinical/types/clinical-catalog.types";
import {
  createAppointmentDefaultValues,
  createAppointmentSchema,
  toCreateAppointmentPayload,
  type CreateAppointmentFormValues,
} from "@/features/appointments/schemas/appointment.schema";
import { createAppointment } from "@/features/appointments/services/appointments.service";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import type { Customer } from "@/features/customers/types/customer.types";
import { formatCustomerName } from "@/features/customers/utils/format-customer";
import { useUser } from "@/providers/user-provider";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

type CreateAppointmentDialogProps = {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (appointment: Appointment) => void;
};

type CreateAppointmentTab = "schedule" | "details";

const TABS = [
  { id: "schedule" as const, label: "Schedule" },
  { id: "details" as const, label: "Details" },
];

export function CreateAppointmentDialog({
  customer,
  open,
  onOpenChange,
  onCreated,
}: CreateAppointmentDialogProps) {
  const { toast } = useToast();
  const { userData } = useUser();
  const [activeTab, setActiveTab] = useState<CreateAppointmentTab>("schedule");
  const [clinics, setClinics] = useState<ClinicalClinic[]>([]);
  const [departments, setDepartments] = useState<ClinicalDepartment[]>([]);
  const [locations, setLocations] = useState<ClinicalLocation[]>([]);
  const [isLoadingContext, setIsLoadingContext] = useState(false);

  const form = useForm<CreateAppointmentFormValues>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: createAppointmentDefaultValues(),
  });

  const selectedClinicUuid = form.watch("clinic");
  const selectedClinicId = useMemo(() => {
    return clinics.find((clinic) => clinic.uuid === selectedClinicUuid)?.id ?? null;
  }, [clinics, selectedClinicUuid]);

  const customerName = useMemo(() => formatCustomerName(customer), [customer]);

  const loadDepartmentsAndLocations = useCallback(async (clinicId: number) => {
    const [nextDepartments, nextLocations] = await Promise.all([
      fetchClinicalDepartments(clinicId),
      fetchClinicalLocations(clinicId),
    ]);
    setDepartments(nextDepartments);
    setLocations(nextLocations);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    let active = true;

    async function loadContext() {
      setIsLoadingContext(true);
      setActiveTab("schedule");

      try {
        const clinicList = await fetchClinicalClinics();
        if (!active) {
          return;
        }

        setClinics(clinicList);

        const primaryClinicUuid =
          clinicList.find((clinic) => clinic.id === userData?.primary_clinic?.id)
            ?.uuid ??
          clinicList[0]?.uuid ??
          "";

        form.reset(
          createAppointmentDefaultValues({
            clinic: primaryClinicUuid,
          }),
        );

        const clinicId = clinicList.find(
          (clinic) => clinic.uuid === primaryClinicUuid,
        )?.id;

        if (clinicId) {
          await loadDepartmentsAndLocations(clinicId);
        }
      } catch (error) {
        toast({
          variant: "error",
          title: "Could not load appointment form",
          description:
            error instanceof Error ? error.message : "Try again in a moment.",
        });
      } finally {
        if (active) {
          setIsLoadingContext(false);
        }
      }
    }

    void loadContext();

    return () => {
      active = false;
    };
  }, [form, loadDepartmentsAndLocations, open, toast, userData?.primary_clinic?.id]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const appointment = await createAppointment(
        toCreateAppointmentPayload(customer.uuid, values),
      );
      toast({
        variant: "success",
        title: "Appointment scheduled",
        description: `Booked ${customerName} for ${new Date(appointment.scheduled_start).toLocaleString()}.`,
      });
      onCreated(appointment);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in createAppointmentDefaultValues()) {
            form.setError(field as keyof CreateAppointmentFormValues, { message });
          }
        }
        toast({
          variant: "error",
          title: "Could not create appointment",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not create appointment",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <TabbedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Schedule appointment"
      description={`Book an appointment for ${customerName}.`}
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={(tabId) => setActiveTab(tabId as CreateAppointmentTab)}
      className={appFont.className}
      data-testid="create-appointment-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            disabled={isSubmitting || isLoadingContext}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          {activeTab === "schedule" ? (
            <PrimaryButton
              type="button"
              disabled={isLoadingContext}
              onClick={() => setActiveTab("details")}
            >
              Continue
            </PrimaryButton>
          ) : (
            <PrimaryButton
              type="button"
              disabled={isSubmitting || isLoadingContext}
              onClick={() => void handleSubmit()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Scheduling...
                </>
              ) : (
                "Schedule appointment"
              )}
            </PrimaryButton>
          )}
        </>
      }
    >
      {isLoadingContext ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-brand-muted">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading clinics...
        </div>
      ) : (
        <Form {...form}>
          <form className="space-y-4">
            {activeTab === "schedule" ? (
              <>
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
                          const clinicId = clinics.find(
                            (clinic) => clinic.uuid === value,
                          )?.id;
                          if (clinicId) {
                            void loadDepartmentsAndLocations(clinicId);
                          }
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
                          <Input type="datetime-local" {...field} />
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
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            ) : (
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
                        <Input placeholder="Optional scheduling notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </form>
        </Form>
      )}
    </TabbedDialog>
  );
}
