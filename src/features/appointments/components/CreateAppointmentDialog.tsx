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
import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import { Textarea } from "@/components/ui/textarea";
import { AppointmentFormFields } from "@/features/appointments/components/AppointmentFormFields";
import {
  createAppointmentDefaultValues,
  createAppointmentSchema,
  toCreateAppointmentPayload,
  type CreateAppointmentFormValues,
} from "@/features/appointments/schemas/appointment.schema";
import { createAppointment } from "@/features/appointments/services/appointments.service";
import type { Appointment } from "@/features/appointments/types/appointment.types";
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
import { CustomerAppointmentPicker } from "@/features/customers/components/CustomerAppointmentPicker";
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
  const [selectedClinicianName, setSelectedClinicianName] = useState<string | null>(
    null,
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

    setActiveTab(requiresClientSelection ? "client" : "schedule");
    if (requiresClientSelection) {
      setSelectedCustomer(null);
    }
    setSelectedClinicianName(null);

    let active = true;

    async function loadContext() {
      setIsLoadingContext(true);

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
    // Reset form state only when the dialog opens, not when unrelated deps change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
        <CustomerAppointmentPicker
          customer={selectedCustomer}
          onCustomerChange={setSelectedCustomer}
        />
      ) : isLoadingContext ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-brand-muted">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading clinics...
        </div>
      ) : (
        <Form {...form}>
          <form className="space-y-5">
            {activeTab === "schedule" ? (
              <AppointmentFormFields
                form={form}
                clinics={clinics}
                departments={departments}
                locations={locations}
                selectedClinicId={selectedClinicId}
                selectedClinicUuid={selectedClinicUuid}
                selectedClinicianName={selectedClinicianName}
                onClinicianChange={(_, name) => setSelectedClinicianName(name)}
                onClinicChange={(_, clinicId) => {
                  if (clinicId) {
                    void loadDepartmentsAndLocations(clinicId);
                  } else {
                    setDepartments([]);
                    setLocations([]);
                  }
                }}
                showDetails={false}
              />
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
            )}
          </form>
        </Form>
      )}
    </TabbedDialog>
  );
}
