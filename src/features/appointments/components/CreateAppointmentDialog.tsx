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
import { CustomerSearchCombobox } from "@/features/customers/components/CustomerSearchCombobox";
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
  customer?: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (appointment: Appointment) => void;
};

type CreateAppointmentTab = "client" | "schedule" | "details";

const SCHEDULE_TABS = [
  { id: "schedule" as const, label: "Schedule" },
  { id: "details" as const, label: "Details" },
];

const FULL_TABS = [
  { id: "client" as const, label: "Client" },
  ...SCHEDULE_TABS,
];

export function CreateAppointmentDialog({
  customer: initialCustomer,
  open,
  onOpenChange,
  onCreated,
}: CreateAppointmentDialogProps) {
  const { toast } = useToast();
  const { userData } = useUser();
  const requiresClientSelection = !initialCustomer;
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    initialCustomer ?? null,
  );
  const [activeTab, setActiveTab] = useState<CreateAppointmentTab>(
    requiresClientSelection ? "client" : "schedule",
  );
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

  const customer = initialCustomer ?? selectedCustomer;
  const customerName = useMemo(
    () => (customer ? formatCustomerName(customer) : ""),
    [customer],
  );
  const tabs = requiresClientSelection ? FULL_TABS : SCHEDULE_TABS;

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
      setActiveTab(requiresClientSelection ? "client" : "schedule");
      if (requiresClientSelection) {
        setSelectedCustomer(null);
      }

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
  }, [
    form,
    loadDepartmentsAndLocations,
    open,
    requiresClientSelection,
    toast,
    userData?.primary_clinic?.id,
  ]);

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!customer) {
      toast({
        variant: "error",
        title: "Select a client",
        description: "Choose a client before scheduling the appointment.",
      });
      setActiveTab("client");
      return;
    }

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
      description={
        customerName
          ? `Book an appointment for ${customerName}.`
          : "Search for a client, then choose when and where to meet."
      }
      tabs={tabs}
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
          {activeTab === "client" ? (
            <PrimaryButton
              type="button"
              disabled={!selectedCustomer}
              onClick={() => setActiveTab("schedule")}
            >
              Continue
            </PrimaryButton>
          ) : activeTab === "schedule" ? (
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
              disabled={isSubmitting || isLoadingContext || !customer}
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
      {activeTab === "client" ? (
        <section className="space-y-4 rounded-xl border border-brand-border bg-slate-50/40 p-4">
          <div>
            <p className="text-sm font-medium text-brand-navy">Client</p>
            <p className="text-xs text-brand-muted">
              Search by name, identifier, or phone number.
            </p>
          </div>

          <CustomerSearchCombobox
            value={selectedCustomer?.uuid ?? null}
            onSelect={setSelectedCustomer}
          />

          {selectedCustomer ? (
            <div className="rounded-lg border border-brand-border bg-white px-4 py-3">
              <p className="text-sm font-medium text-brand-navy">{customerName}</p>
              <p className="mt-1 text-xs text-brand-muted">
                {selectedCustomer.customer_identifier}
                {selectedCustomer.phone_number
                  ? ` · ${selectedCustomer.phone_number}`
                  : ""}
              </p>
            </div>
          ) : null}
        </section>
      ) : isLoadingContext ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-brand-muted">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading clinics...
        </div>
      ) : (
        <Form {...form}>
          <form className="space-y-4">
            {activeTab === "schedule" ? (
              <div className="space-y-4">
                <section className="space-y-4 rounded-xl border border-brand-border bg-slate-50/40 p-4">
                  <div>
                    <p className="text-sm font-medium text-brand-navy">Location</p>
                    <p className="text-xs text-brand-muted">
                      Choose where the appointment will take place.
                    </p>
                  </div>

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
                </section>

                <section className="space-y-4 rounded-xl border border-brand-border px-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-brand-navy">Time</p>
                    <p className="text-xs text-brand-muted">
                      Set the start and end of the appointment window.
                    </p>
                  </div>

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
                            <Input type="datetime-local" className="bg-white" {...field} />
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
                            <Input type="datetime-local" className="bg-white" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>
              </div>
            ) : (
              <section className="space-y-4 rounded-xl border border-brand-border bg-slate-50/40 p-4">
                <div>
                  <p className="text-sm font-medium text-brand-navy">Visit details</p>
                  <p className="text-xs text-brand-muted">
                    Optional context for the care team.
                  </p>
                </div>

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
              </section>
            )}
          </form>
        </Form>
      )}
    </TabbedDialog>
  );
}
