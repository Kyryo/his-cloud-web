"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { Form } from "@/components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { AppointmentTableAction } from "@/features/appointments/components/AppointmentActionConfirmDialog";
import { AppointmentDetailOverview } from "@/features/appointments/components/AppointmentDetailOverview";
import { AppointmentDetailSheetFooter } from "@/features/appointments/components/AppointmentDetailSheetFooter";
import { AppointmentDetailSheetHeader } from "@/features/appointments/components/AppointmentDetailSheetHeader";
import { AppointmentDetailSkeleton } from "@/features/appointments/components/AppointmentDetailSkeleton";
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
  canCancelAppointment,
  canConfirmAppointment,
  canStartAppointmentVisit,
} from "@/features/appointments/utils/appointment-action-availability";
import {
  fetchClinicalClinics,
  fetchClinicalDepartments,
} from "@/features/clinical/services/clinical-catalog.service";
import type {
  ClinicalClinic,
  ClinicalDepartment,
} from "@/features/clinical/types/clinical-catalog.types";
import { resolveDefaultDepartmentUuid } from "@/features/clinical/utils/apply-sole-department";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type AppointmentDetailDialogProps = {
  appointmentUuid: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (appointment: Appointment) => void;
  onActionRequest?: (
    appointment: Appointment,
    action: AppointmentTableAction,
  ) => void;
};

type DetailMode = "overview" | "edit";

export function AppointmentDetailDialog({
  appointmentUuid,
  open,
  onOpenChange,
  onUpdated,
  onActionRequest,
}: AppointmentDetailDialogProps) {
  const { toast } = useToast();
  const [mode, setMode] = useState<DetailMode>("overview");
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedClinicianName, setSelectedClinicianName] = useState<string | null>(
    null,
  );
  const [clinics, setClinics] = useState<ClinicalClinic[]>([]);
  const [departments, setDepartments] = useState<ClinicalDepartment[]>([]);

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
  const isSubmitting = form.formState.isSubmitting;

  const loadDepartments = useCallback(async (clinicId: number) => {
    const nextDepartments = await fetchClinicalDepartments(clinicId);
    setDepartments(nextDepartments);
    return nextDepartments;
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
      setMode("overview");
      form.reset(appointmentToFormValues(data));

      const clinicId = clinicList.find((clinic) => clinic.uuid === data.clinic)?.id;
      if (clinicId) {
        await loadDepartments(clinicId);
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load appointment.");
      setAppointment(null);
    } finally {
      setIsLoading(false);
    }
  }, [appointmentUuid, form, loadDepartments]);

  useEffect(() => {
    if (!open || !appointmentUuid) {
      return;
    }

    void loadAppointment();
  }, [loadAppointment, open, appointmentUuid]);

  const handleClinicChange = (_clinicUuid: string, clinicId: number | null) => {
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
      setMode("overview");
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

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setMode("overview");
    }
    onOpenChange(nextOpen);
  }

  function requestAction(action: AppointmentTableAction) {
    if (!appointment || !onActionRequest) {
      return;
    }
    handleOpenChange(false);
    onActionRequest(appointment, action);
  }

  const showConfirm = appointment ? canConfirmAppointment(appointment) : false;
  const showCancel = appointment ? canCancelAppointment(appointment) : false;
  const showStart = appointment ? canStartAppointmentVisit(appointment) : false;
  const showMore = Boolean(onActionRequest && (showConfirm || showCancel));

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        className={cn(
          appFont.className,
          "flex w-full flex-col gap-0 p-0 sm:max-w-lg",
        )}
        data-testid="appointment-detail-dialog"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>
            {appointment ? appointment.patient_name : "Appointment details"}
          </SheetTitle>
          <SheetDescription>
            Review or edit this appointment.
          </SheetDescription>
        </SheetHeader>

        <AppointmentDetailSheetHeader
          appointment={appointment}
          isLoading={isLoading}
          showConfirm={showConfirm}
          showCancel={showCancel}
          onViewClient={() => handleOpenChange(false)}
          onConfirm={showMore && showConfirm ? () => requestAction("confirm") : undefined}
          onCancelAppointment={
            showMore && showCancel ? () => requestAction("cancel") : undefined
          }
        />

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <AppointmentDetailSkeleton />
          ) : loadError ? (
            <div className="py-10 text-center">
              <p className="text-sm text-red-700">{loadError}</p>
              <SecondaryButton
                type="button"
                className="mt-4"
                onClick={() => void loadAppointment()}
              >
                Try again
              </SecondaryButton>
            </div>
          ) : appointment && mode === "edit" ? (
            <Form {...form}>
              <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
                <AppointmentFormFields
                  form={form}
                  clinics={clinics}
                  departments={departments}
                  selectedClinicId={selectedClinicId}
                  selectedClinicUuid={selectedClinicUuid}
                  selectedClinicianName={selectedClinicianName}
                  onClinicianChange={(_, name) => setSelectedClinicianName(name)}
                  onClinicChange={handleClinicChange}
                />
              </form>
            </Form>
          ) : appointment ? (
            <AppointmentDetailOverview appointment={appointment} />
          ) : null}
        </div>

        {appointment && !isLoading && !loadError ? (
          <AppointmentDetailSheetFooter
            mode={mode}
            editable={editable}
            showStart={Boolean(onActionRequest && showStart)}
            isSubmitting={isSubmitting}
            onClose={() => handleOpenChange(false)}
            onEdit={() => setMode("edit")}
            onCancelEdit={() => setMode("overview")}
            onSave={() => void handleSubmit()}
            onStartVisit={
              onActionRequest && showStart ? () => requestAction("start") : undefined
            }
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
