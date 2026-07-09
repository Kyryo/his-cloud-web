"use client";

import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";

import { FilterSelectField } from "@/components/filter-select-field";
import { CareProviderCombobox } from "@/features/appointments/components/CareProviderCombobox";
import { AppointmentClinicEmptyState } from "@/features/appointments/components/AppointmentClinicEmptyState";
import { AppointmentStatusBadge } from "@/features/appointments/components/AppointmentStatusBadge";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import {
  generateDaySlots,
  getAppointmentDayKey,
  getUnassignedAppointmentsForDay,
  mapAppointmentsToSlots,
  resolveDepartmentSlotMinutes,
  toLocalDateTimeInputFromDate,
  type MappedSlot,
} from "@/features/appointments/utils/appointment-calendar-utils";
import { fetchClinicalDepartments } from "@/features/clinical/services/clinical-catalog.service";
import type { ClinicalDepartment } from "@/features/clinical/types/clinical-catalog.types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export type AppointmentCreateSchedulePrefill = {
  clinic?: string;
  department?: string;
  clinician?: number | null;
  clinicianName?: string | null;
  scheduled_start?: string;
  scheduled_end?: string;
};

type AppointmentsDayPanelProps = {
  day: Date | null;
  open: boolean;
  appointments: Appointment[];
  clinicUuid?: string;
  clinicId?: number | null;
  departmentUuid?: string;
  initialClinicianId?: number | null;
  onOpenChange: (open: boolean) => void;
  onAppointmentSelect: (appointment: Appointment) => void;
  onCreateSlot: (prefill: AppointmentCreateSchedulePrefill) => void;
};

function SlotRow({
  slot,
  onSelect,
}: {
  slot: MappedSlot;
  onSelect: () => void;
}) {
  if (slot.status === "booked" && slot.appointment) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-start justify-between gap-3 rounded-lg border border-brand-border bg-white p-3 text-left transition-colors hover:border-brand-primary/40 hover:bg-brand-primary/5"
      >
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-brand-navy">
            {slot.appointment.patient_name}
          </p>
          <p className="text-xs text-brand-muted">
            {slot.appointment.clinician_name || "Unassigned"}
          </p>
          <p className="text-xs text-brand-muted">
            {slot.startLabel} – {slot.endLabel}
          </p>
        </div>
        <AppointmentStatusBadge status={slot.appointment.status} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-dashed border-brand-border/80 bg-brand-surface/30 p-3 text-left transition-colors hover:border-brand-primary/40 hover:bg-brand-primary/5"
    >
      <div>
        <p className="text-sm font-medium text-brand-muted">Available</p>
        <p className="text-xs text-brand-muted">
          {slot.startLabel} – {slot.endLabel}
        </p>
      </div>
    </button>
  );
}

export function AppointmentsDayPanel({
  day,
  open,
  appointments,
  clinicUuid,
  clinicId,
  departmentUuid: initialDepartmentUuid,
  initialClinicianId = null,
  onOpenChange,
  onAppointmentSelect,
  onCreateSlot,
}: AppointmentsDayPanelProps) {
  const [selectedClinicianId, setSelectedClinicianId] = useState<number | null>(
    initialClinicianId,
  );
  const [selectedClinicianName, setSelectedClinicianName] = useState<string | null>(
    null,
  );
  const [selectedDepartmentUuid, setSelectedDepartmentUuid] = useState(
    initialDepartmentUuid ?? "",
  );
  const [departments, setDepartments] = useState<ClinicalDepartment[]>([]);

  useEffect(() => {
    if (open) {
      setSelectedClinicianId(initialClinicianId);
      setSelectedClinicianName(null);
      setSelectedDepartmentUuid(initialDepartmentUuid ?? "");
    }
  }, [initialClinicianId, initialDepartmentUuid, open]);

  useEffect(() => {
    if (!open || !clinicId) {
      setDepartments([]);
      return;
    }

    void fetchClinicalDepartments(clinicId)
      .then(setDepartments)
      .catch(() => setDepartments([]));
  }, [clinicId, open]);

  const selectedDepartment = useMemo(
    () => departments.find((department) => department.uuid === selectedDepartmentUuid),
    [departments, selectedDepartmentUuid],
  );

  const slotMinutes = useMemo(
    () =>
      resolveDepartmentSlotMinutes(
        selectedDepartment?.default_appointment_duration_minutes,
      ),
    [selectedDepartment?.default_appointment_duration_minutes],
  );

  const dayAppointments = useMemo(() => {
    if (!day) {
      return [];
    }

    const dayKey = format(day, "yyyy-MM-dd");
    return appointments.filter(
      (appointment) => getAppointmentDayKey(appointment.scheduled_start) === dayKey,
    );
  }, [appointments, day]);

  const slots = useMemo(() => {
    if (!day) {
      return [];
    }

    return mapAppointmentsToSlots(
      generateDaySlots(day, slotMinutes),
      dayAppointments,
      selectedClinicianId,
    );
  }, [day, dayAppointments, selectedClinicianId, slotMinutes]);

  const unassignedAppointments = useMemo(
    () => getUnassignedAppointmentsForDay(dayAppointments),
    [dayAppointments],
  );

  function handleSlotSelect(slot: MappedSlot) {
    if (slot.status === "booked" && slot.appointment) {
      onAppointmentSelect(slot.appointment);
      return;
    }

    onCreateSlot({
      clinic: clinicUuid,
      department: selectedDepartmentUuid || undefined,
      clinician: selectedClinicianId,
      clinicianName: selectedClinicianName,
      scheduled_start: toLocalDateTimeInputFromDate(slot.start),
      scheduled_end: toLocalDateTimeInputFromDate(slot.end),
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn("w-full overflow-y-auto sm:max-w-lg", appFont.className)}
        data-testid="appointments-day-panel"
      >
        <SheetHeader>
          <SheetTitle>
            {day ? format(day, "EEEE, MMMM d, yyyy") : "Day schedule"}
          </SheetTitle>
          <SheetDescription>
            Review booked slots or choose an available time to schedule a new
            appointment.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {!clinicUuid ? (
            <AppointmentClinicEmptyState className="py-8" />
          ) : (
            <>
              <FilterSelectField
                id="appointments-day-department"
                label="Department"
                value={selectedDepartmentUuid || "none"}
                options={[
                  { value: "none", label: "Select a department" },
                  ...departments.map((department) => ({
                    value: department.uuid,
                    label: department.name,
                  })),
                ]}
                onValueChange={(value) =>
                  setSelectedDepartmentUuid(value === "none" ? "" : value)
                }
              />

              <CareProviderCombobox
                id="appointments-day-provider"
                label="Care provider"
                value={selectedClinicianId}
                clinicUuid={clinicUuid}
                disabled={!clinicUuid}
                onSelect={(provider) => {
                  setSelectedClinicianId(provider?.id ?? null);
                  setSelectedClinicianName(provider?.name ?? null);
                }}
              />

              {!selectedDepartmentUuid ? (
                <p className="rounded-lg border border-dashed border-brand-border px-3 py-4 text-sm text-brand-muted">
                  Select a department to use its default appointment duration for
                  available slots.
                </p>
              ) : !selectedClinicianId ? (
                <p className="rounded-lg border border-dashed border-brand-border px-3 py-4 text-sm text-brand-muted">
                  Select a care provider to see booked and available slots for this
                  day.
                </p>
              ) : (
                <div className="space-y-2">
                  {slots.map((slot) => (
                    <SlotRow
                      key={slot.start.toISOString()}
                      slot={slot}
                      onSelect={() => handleSlotSelect(slot)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {unassignedAppointments.length > 0 ? (
            <div className="space-y-2 border-t border-brand-border pt-4">
              <h3 className="text-sm font-medium text-brand-navy">Unassigned</h3>
              {unassignedAppointments.map((appointment) => (
                <button
                  key={appointment.uuid}
                  type="button"
                  onClick={() => onAppointmentSelect(appointment)}
                  className="flex w-full items-start justify-between gap-3 rounded-lg border border-brand-border bg-white p-3 text-left transition-colors hover:border-brand-primary/40 hover:bg-brand-primary/5"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-medium text-brand-navy">
                      {appointment.patient_name}
                    </p>
                    <p className="text-xs text-brand-muted">
                      {format(new Date(appointment.scheduled_start), "h:mm a")} –{" "}
                      {format(new Date(appointment.scheduled_end), "h:mm a")}
                    </p>
                  </div>
                  <AppointmentStatusBadge status={appointment.status} />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
