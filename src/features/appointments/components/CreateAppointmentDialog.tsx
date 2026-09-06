"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";

import { ClientAvatar } from "@/components/client-avatar";
import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { AppointmentClinicEmptyState } from "@/features/appointments/components/AppointmentClinicEmptyState";
import { AppointmentFormFields } from "@/features/appointments/components/AppointmentFormFields";
import {
  createAppointmentDefaultValues,
  createAppointmentSchema,
  resolveAppointmentErrorTab,
  resolveFirstAppointmentErrorField,
  toCreateAppointmentPayload,
  type CreateAppointmentFormValues,
} from "@/features/appointments/schemas/appointment.schema";
import { createAppointment } from "@/features/appointments/services/appointments.service";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import {
  fetchClinicalClinics,
  fetchClinicalDepartments,
} from "@/features/clinical/services/clinical-catalog.service";
import type {
  ClinicalClinic,
  ClinicalDepartment,
} from "@/features/clinical/types/clinical-catalog.types";
import { resolveDefaultDepartmentUuid } from "@/features/clinical/utils/apply-sole-department";
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
  initialSchedule?: Partial<CreateAppointmentFormValues> & {
    clinicianName?: string | null;
  };
};

function AppointmentClientCard({
  customer,
  onChangeClient,
}: {
  customer: Customer;
  onChangeClient?: () => void;
}) {
  const name = formatCustomerName(customer);
  const meta = [customer.customer_identifier, customer.phone_number]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
        Client
      </p>
      <div className="flex items-center gap-3 rounded-xl border border-dash-border bg-white px-3 py-2.5">
        <ClientAvatar name={name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-brand-navy">{name}</p>
          {meta ? (
            <p className="truncate text-xs text-brand-muted">{meta}</p>
          ) : null}
        </div>
        {onChangeClient ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 text-brand-muted"
            onClick={onChangeClient}
          >
            Change
          </Button>
        ) : null}
      </div>
    </section>
  );
}

function AppointmentDialogSkeleton() {
  return (
    <div
      className="space-y-4"
      aria-busy="true"
      data-testid="create-appointment-loading"
    >
      <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
      </div>
      <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
      <span className="sr-only">Loading appointment form</span>
    </div>
  );
}

export function CreateAppointmentDialog({
  customer: initialCustomer,
  open,
  onOpenChange,
  onCreated,
  initialSchedule,
}: CreateAppointmentDialogProps) {
  const { toast } = useToast();
  const { userData, isLoading: isUserLoading } = useUser();
  const hasAssignedClinic = Boolean(userData?.primary_clinic);
  const requiresClientSelection = !initialCustomer;
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    initialCustomer ?? null,
  );
  const [selectedClinicianName, setSelectedClinicianName] = useState<string | null>(
    null,
  );
  const [clinics, setClinics] = useState<ClinicalClinic[]>([]);
  const [departments, setDepartments] = useState<ClinicalDepartment[]>([]);
  const [isLoadingContext, setIsLoadingContext] = useState(false);

  const form = useForm<CreateAppointmentFormValues>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: createAppointmentDefaultValues({
      clinic: initialSchedule?.clinic,
      department: initialSchedule?.department,
      clinician: initialSchedule?.clinician,
      scheduled_start: initialSchedule?.scheduled_start,
      scheduled_end: initialSchedule?.scheduled_end,
    }),
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
  const lockScheduleFields = Boolean(initialSchedule?.scheduled_start);

  const loadDepartments = useCallback(async (clinicId: number) => {
    const nextDepartments = await fetchClinicalDepartments(clinicId);
    setDepartments(nextDepartments);
    return nextDepartments;
  }, []);

  function focusFirstError(errors: FieldErrors<CreateAppointmentFormValues>) {
    const tab = resolveAppointmentErrorTab(errors);
    const firstField = resolveFirstAppointmentErrorField(errors, tab);
    if (firstField) {
      requestAnimationFrame(() => {
        form.setFocus(firstField);
      });
    }
  }

  useEffect(() => {
    if (!open || isUserLoading) {
      return;
    }

    let active = true;

    async function loadContext() {
      await Promise.resolve();
      if (!active) {
        return;
      }

      if (requiresClientSelection) {
        setSelectedCustomer(null);
      }
      setSelectedClinicianName(initialSchedule?.clinicianName ?? null);

      if (!hasAssignedClinic) {
        setClinics([]);
        setDepartments([]);
        setIsLoadingContext(false);
        return;
      }

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

        const resetClinicUuid = initialSchedule?.clinic ?? primaryClinicUuid;

        const clinicId =
          clinicList.find((clinic) => clinic.uuid === resetClinicUuid)?.id ?? null;

        let nextDepartments: ClinicalDepartment[] = [];
        if (clinicId) {
          nextDepartments = await loadDepartments(clinicId);
          if (!active) {
            return;
          }
        } else {
          setDepartments([]);
        }

        const resetValues: Partial<CreateAppointmentFormValues> = {
          clinic: resetClinicUuid,
          department:
            initialSchedule?.department ||
            resolveDefaultDepartmentUuid(nextDepartments),
        };
        if (initialSchedule?.clinician !== undefined) {
          resetValues.clinician = initialSchedule.clinician;
        }
        if (initialSchedule?.scheduled_start) {
          resetValues.scheduled_start = initialSchedule.scheduled_start;
        }
        if (initialSchedule?.scheduled_end) {
          resetValues.scheduled_end = initialSchedule.scheduled_end;
        }

        form.reset(createAppointmentDefaultValues(resetValues));
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
  }, [open, isUserLoading, hasAssignedClinic, initialSchedule]);

  const handleSubmit = form.handleSubmit(
    async (values) => {
      if (!customer) {
        toast({
          variant: "error",
          title: "Select a client",
          description: "Choose a client before scheduling the appointment.",
        });
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
          focusFirstError(
            fieldErrors as FieldErrors<CreateAppointmentFormValues>,
          );
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
    },
    (errors) => {
      focusFirstError(errors);
    },
  );

  const isSubmitting = form.formState.isSubmitting;
  const isDialogLoading = isLoadingContext || (open && isUserLoading);
  const showClinicEmptyState = !isDialogLoading && !hasAssignedClinic;

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Schedule appointment"
      description={
        customerName
          ? `Reserve clinic time for ${customerName}.`
          : "Choose a client, then set the location, time, and visit details."
      }
      className={appFont.className}
      data-testid="create-appointment-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            disabled={isSubmitting || isDialogLoading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          {showClinicEmptyState ? null : (
            <PrimaryButton
              type="button"
              disabled={isSubmitting || isDialogLoading || !customer}
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
      {isDialogLoading ? (
        <AppointmentDialogSkeleton />
      ) : showClinicEmptyState ? (
        <AppointmentClinicEmptyState compact />
      ) : (
        <div className="space-y-6">
          {requiresClientSelection && !customer ? (
            <CustomerAppointmentPicker
              customer={selectedCustomer}
              onCustomerChange={setSelectedCustomer}
              disabled={isDialogLoading}
            />
          ) : customer ? (
            <AppointmentClientCard
              customer={customer}
              onChangeClient={
                requiresClientSelection
                  ? () => setSelectedCustomer(null)
                  : undefined
              }
            />
          ) : null}

          <Form {...form}>
            <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
              <AppointmentFormFields
                form={form}
                clinics={clinics}
                departments={departments}
                selectedClinicId={selectedClinicId}
                selectedClinicUuid={selectedClinicUuid}
                selectedClinicianName={selectedClinicianName}
                onClinicianChange={(_, name) => setSelectedClinicianName(name)}
                onClinicChange={(_, clinicId) => {
                  if (!clinicId) {
                    setDepartments([]);
                    form.setValue("department", "");
                    return;
                  }

                  void (async () => {
                    const nextDepartments = await loadDepartments(clinicId);
                    form.setValue(
                      "department",
                      resolveDefaultDepartmentUuid(nextDepartments),
                      { shouldValidate: nextDepartments.length === 1 },
                    );
                  })();
                }}
                lockScheduleFields={lockScheduleFields}
              />
            </form>
          </Form>
        </div>
      )}
    </SectionedDialog>
  );
}
