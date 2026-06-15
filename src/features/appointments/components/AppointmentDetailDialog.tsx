"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import { ROUTES } from "@/constants/routes";
import { AppointmentFormFields } from "@/features/appointments/components/AppointmentFormFields";
import {
  appointmentToFormValues,
  canEditAppointment,
  createAppointmentDefaultValues,
  createAppointmentSchema,
  toUpdateAppointmentPayload,
  type CreateAppointmentFormValues,
} from "@/features/appointments/schemas/appointment.schema";
import {
  fetchAppointment,
  updateAppointment,
} from "@/features/appointments/services/appointments.service";
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
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

type AppointmentDetailDialogProps = {
  appointmentUuid: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (appointment: Appointment) => void;
};

type AppointmentDetailTab = "overview" | "edit";

const TABS = [
  { id: "overview" as const, label: "Overview" },
  { id: "edit" as const, label: "Edit" },
];

export function AppointmentDetailDialog({
  appointmentUuid,
  open,
  onOpenChange,
  onUpdated,
}: AppointmentDetailDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AppointmentDetailTab>("overview");
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedClinicianName, setSelectedClinicianName] = useState<string | null>(
    null,
  );
  const [clinics, setClinics] = useState<ClinicalClinic[]>([]);
  const [departments, setDepartments] = useState<ClinicalDepartment[]>([]);
  const [locations, setLocations] = useState<ClinicalLocation[]>([]);

  const form = useForm<CreateAppointmentFormValues>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: createAppointmentDefaultValues(),
  });

  const selectedClinicUuid = form.watch("clinic");
  const selectedClinicId = useMemo(
    () => clinics.find((clinic) => clinic.uuid === selectedClinicUuid)?.id ?? null,
    [clinics, selectedClinicUuid],
  );

  const editable = appointment ? canEditAppointment(appointment.status) : false;
  const tabs = editable ? TABS : [TABS[0]];

  const loadDepartmentsAndLocations = useCallback(async (clinicId: number) => {
    const [nextDepartments, nextLocations] = await Promise.all([
      fetchClinicalDepartments(clinicId),
      fetchClinicalLocations(clinicId),
    ]);
    setDepartments(nextDepartments);
    setLocations(nextLocations);
  }, []);

  const loadAppointment = useCallback(async () => {
    if (!appointmentUuid) {
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      const [data, clinicList] = await Promise.all([
        fetchAppointment(appointmentUuid),
        fetchClinicalClinics(),
      ]);
      setAppointment(data);
      setClinics(clinicList);
      setSelectedClinicianName(data.clinician_name);
      form.reset(appointmentToFormValues(data));

      const clinicId = clinicList.find((clinic) => clinic.uuid === data.clinic)?.id;
      if (clinicId) {
        await loadDepartmentsAndLocations(clinicId);
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load appointment.");
      setAppointment(null);
    } finally {
      setIsLoading(false);
    }
  }, [appointmentUuid, form, loadDepartmentsAndLocations]);

  useEffect(() => {
    if (!open || !appointmentUuid) {
      return;
    }

    setActiveTab("overview");
    void loadAppointment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, appointmentUuid]);

  const handleClinicChange = (clinicUuid: string, clinicId: number | null) => {
    if (clinicId) {
      void loadDepartmentsAndLocations(clinicId);
    } else {
      setDepartments([]);
      setLocations([]);
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!appointment) {
      return;
    }

    try {
      const updated = await updateAppointment(
        appointment.uuid,
        toUpdateAppointmentPayload(values),
      );
      setAppointment(updated);
      setSelectedClinicianName(updated.clinician_name);
      toast({
        variant: "success",
        title: "Appointment updated",
        description: "Changes have been saved.",
      });
      onUpdated?.(updated);
      setActiveTab("overview");
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
          title: "Could not update appointment",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not update appointment",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  });

  const dialogTitle = appointment ? (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="text-brand-navy">{appointment.patient_name}</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs text-brand-muted hover:text-brand-navy"
        asChild
      >
        <Link
          href={ROUTES.customerDetail(appointment.patient)}
          onClick={() => onOpenChange(false)}
        >
          View client
        </Link>
      </Button>
    </span>
  ) : (
    "Appointment details"
  );

  const dialogDescription = appointment
    ? `${appointment.clinic_name} · ${formatDisplayDateTime(appointment.scheduled_start)}`
    : "Loading appointment information...";

  const isSubmitting = form.formState.isSubmitting;

  return (
    <TabbedDialog
      open={open}
      onOpenChange={onOpenChange}
      title={dialogTitle}
      description={dialogDescription}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tabId) => setActiveTab(tabId as AppointmentDetailTab)}
      className={appFont.className}
      data-testid="appointment-detail-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            disabled={isSubmitting}
            className="rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Close
          </SecondaryButton>
          {activeTab === "edit" && editable ? (
            <PrimaryButton
              type="button"
              disabled={isSubmitting || isLoading}
              className="rounded-full"
              onClick={() => void handleSubmit()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </PrimaryButton>
          ) : editable ? (
            <PrimaryButton
              type="button"
              className="rounded-full"
              onClick={() => setActiveTab("edit")}
            >
              Edit appointment
            </PrimaryButton>
          ) : null}
        </>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-brand-muted">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading appointment...
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-700">
          {loadError}
        </div>
      ) : appointment && activeTab === "overview" ? (
        <div className="space-y-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-brand-muted">Client</dt>
              <dd className="mt-1 text-sm font-medium text-brand-navy">
                {appointment.patient_name}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-brand-muted">Care provider</dt>
              <dd className="mt-1 text-sm font-medium text-brand-navy">
                {appointment.clinician_name || "Unassigned"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-brand-muted">Clinic</dt>
              <dd className="mt-1 text-sm font-medium text-brand-navy">
                {appointment.clinic_name || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-brand-muted">Department</dt>
              <dd className="mt-1 text-sm font-medium text-brand-navy">
                {appointment.department_name || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-brand-muted">Location</dt>
              <dd className="mt-1 text-sm font-medium text-brand-navy">
                {appointment.location_name || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-brand-muted">Scheduled start</dt>
              <dd className="mt-1 text-sm font-medium text-brand-navy">
                {formatDisplayDateTime(appointment.scheduled_start)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-brand-muted">Scheduled end</dt>
              <dd className="mt-1 text-sm font-medium text-brand-navy">
                {formatDisplayDateTime(appointment.scheduled_end)}
              </dd>
            </div>
          </dl>

          <div>
            <dt className="text-xs text-brand-muted">Reason for visit</dt>
            <dd className="mt-1 text-sm text-brand-navy">
              {appointment.reason || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-brand-muted">Internal notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-brand-navy">
              {appointment.notes || "—"}
            </dd>
          </div>
        </div>
      ) : appointment ? (
        <Form {...form}>
          <form className="space-y-5">
            <AppointmentFormFields
              form={form}
              clinics={clinics}
              departments={departments}
              locations={locations}
              selectedClinicId={selectedClinicId}
              selectedClinicUuid={selectedClinicUuid}
              selectedClinicianName={selectedClinicianName}
              onClinicianChange={(_, name) => setSelectedClinicianName(name)}
              onClinicChange={handleClinicChange}
            />
          </form>
        </Form>
      ) : null}
    </TabbedDialog>
  );
}
