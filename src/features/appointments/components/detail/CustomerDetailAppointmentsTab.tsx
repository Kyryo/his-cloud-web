"use client";

import { CalendarPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { TabAddActionButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import {
  AppointmentActionConfirmDialog,
  type AppointmentTableAction,
} from "@/features/appointments/components/AppointmentActionConfirmDialog";
import { AppointmentDetailDialog } from "@/features/appointments/components/AppointmentDetailDialog";
import { AppointmentStatusBadge } from "@/features/appointments/components/AppointmentStatusBadge";
import { CreateAppointmentDialog } from "@/features/appointments/components/CreateAppointmentDialog";
import { StartVisitFromAppointmentDialog } from "@/features/appointments/components/StartVisitFromAppointmentDialog";
import { fetchAppointments, runAppointmentAction } from "@/features/appointments/services/appointments.service";
import type { Appointment, AppointmentAction } from "@/features/appointments/types/appointment.types";
import {
  CustomerDetailRecordList,
  CustomerDetailRecordListItem,
} from "@/features/customers/components/detail/CustomerDetailRecordList";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import type { Customer } from "@/features/customers/types/customer.types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { useToast } from "@/providers/toast-provider";
import { formatCompactNumber } from "@/utils/format-compact-number";

type CustomerDetailAppointmentsTabProps = {
  customer: Customer;
  isActive: boolean;
  refreshKey?: number;
  onVisitStarted?: () => void;
};

function canStartVisit(appointment: Appointment) {
  return ["scheduled", "confirmed"].includes(appointment.status);
}

function canConfirm(appointment: Appointment) {
  return appointment.status === "scheduled";
}

function canCancel(appointment: Appointment) {
  return ["scheduled", "confirmed"].includes(appointment.status);
}

function canMarkNoShow(appointment: Appointment) {
  return ["scheduled", "confirmed"].includes(appointment.status);
}

function formatAppointmentMeta(appointment: Appointment) {
  return [
    appointment.reason || "No reason provided",
    appointment.location_name,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function CustomerDetailAppointmentsTab({
  customer,
  isActive,
  refreshKey = 0,
  onVisitStarted,
}: CustomerDetailAppointmentsTabProps) {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedAppointmentUuid, setSelectedAppointmentUuid] = useState<
    string | null
  >(null);
  const [startingAppointment, setStartingAppointment] = useState<Appointment | null>(
    null,
  );
  const [actionUuid, setActionUuid] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    appointment: Appointment;
    action: AppointmentTableAction;
  } | null>(null);

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetchAppointments({
        patient: customer.uuid,
        pageSize: 100,
      });
      setAppointments(response.results);
      setHasLoaded(true);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to load appointments.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [customer.uuid]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        const response = await fetchAppointments({
          patient: customer.uuid,
          pageSize: 100,
        });
        if (!cancelled) {
          setAppointments(response.results);
          setHasLoaded(true);
          setLoadError(null);
          setIsLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Failed to load appointments.",
          );
          setIsLoading(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [isActive, customer.uuid, refreshKey]);

  const handleAction = async (
    appointment: Appointment,
    action: AppointmentAction,
  ) => {
    setActionUuid(appointment.uuid);

    try {
      await runAppointmentAction(appointment.uuid, action);
      toast({
        variant: "success",
        title: "Appointment updated",
        description:
          action === "confirm"
            ? "Appointment confirmed."
            : action === "cancel"
              ? "Appointment cancelled."
              : "Appointment marked as no-show.",
      });
      await loadAppointments();
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update appointment",
        description:
          error instanceof Error
            ? error.message
            : "The appointment action failed.",
      });
    } finally {
      setActionUuid(null);
      setPendingAction(null);
    }
  };

  const scheduleButton = (
    <TabAddActionButton
      label="Schedule"
      onClick={() => setCreateOpen(true)}
      data-testid="customer-appointments-schedule-button"
    />
  );

  const emptyStateScheduleButton = (
    <Button
      type="button"
      size="sm"
      onClick={() => setCreateOpen(true)}
      data-testid="customer-appointments-empty-schedule-button"
    >
      <CalendarPlus className="mr-1.5 size-4" aria-hidden="true" />
      Schedule appointment
    </Button>
  );

  if (isLoading && !hasLoaded) {
    return <CustomerTabSkeleton statCards={4} rows={3} />;
  }

  if (loadError && !hasLoaded) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
          {loadError}
        </div>
        <Button type="button" variant="outline" onClick={() => void loadAppointments()}>
          Try again
        </Button>
      </div>
    );
  }

  const upcomingCount = appointments.filter((appointment) =>
    ["scheduled", "confirmed", "in_progress"].includes(appointment.status),
  ).length;
  const completedCount = appointments.filter(
    (appointment) => appointment.status === "completed",
  ).length;
  const cancelledCount = appointments.filter(
    (appointment) => appointment.status === "cancelled",
  ).length;

  return (
    <div className="space-y-5" data-testid="customer-detail-appointments-tab">
      <CreateAppointmentDialog
        customer={customer}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => void loadAppointments()}
      />

      <AppointmentDetailDialog
        appointmentUuid={selectedAppointmentUuid}
        open={Boolean(selectedAppointmentUuid)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAppointmentUuid(null);
          }
        }}
        onUpdated={() => void loadAppointments()}
        onActionRequest={(appointment, action) => {
          setSelectedAppointmentUuid(null);
          if (action === "start") {
            setStartingAppointment(appointment);
            return;
          }
          if (action === "confirm") {
            void handleAction(appointment, "confirm");
            return;
          }
          setPendingAction({ appointment, action });
        }}
      />

      {startingAppointment ? (
        <StartVisitFromAppointmentDialog
          appointment={startingAppointment}
          patientUuid={customer.uuid}
          open={Boolean(startingAppointment)}
          onOpenChange={(open) => {
            if (!open) {
              setStartingAppointment(null);
            }
          }}
          onStarted={() => {
            onVisitStarted?.();
            void loadAppointments();
          }}
        />
      ) : null}

      <AppointmentActionConfirmDialog
        action={pendingAction?.action ?? null}
        appointment={pendingAction?.appointment ?? null}
        isSubmitting={Boolean(actionUuid)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAction(null);
          }
        }}
        onConfirm={() => {
          if (pendingAction) {
            void handleAction(pendingAction.appointment, pendingAction.action);
          }
        }}
      />

      {/* Seamless Cardless Stat Strip */}
      <dl
        className="grid grid-cols-2 divide-y divide-dash-border/60 border-b border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
        data-testid="customer-appointments-stats"
      >
        {/* 1. Total appointments */}
        <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
          <div className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-blue-500" />
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
              Total appointments
            </dt>
          </div>
          <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
            {formatCompactNumber(appointments.length)}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">All scheduled bookings</p>
        </div>

        {/* 2. Upcoming */}
        <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
          <div className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-indigo-500" />
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
              Upcoming
            </dt>
          </div>
          <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
            {formatCompactNumber(upcomingCount)}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Future bookings</p>
        </div>

        {/* 3. Completed */}
        <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
          <div className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
              Completed
            </dt>
          </div>
          <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
            {formatCompactNumber(completedCount)}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Concluded sessions</p>
        </div>

        {/* 4. Cancelled */}
        <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
          <div className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-slate-400" />
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
              Cancelled
            </dt>
          </div>
          <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
            {formatCompactNumber(cancelledCount)}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Voided appointments</p>
        </div>
      </dl>

      {appointments.length === 0 ? (
        <CustomerDetailTabEmptyState
          icon={CalendarPlus}
          title="No appointments yet"
          description="Schedule the client's next visit to reserve clinic time in advance."
          action={emptyStateScheduleButton}
          data-testid="customer-appointments-empty-state"
        />
      ) : (
        <CustomerDetailRecordList
          title="Appointments"
          description="Upcoming and recent appointments for this client."
          action={scheduleButton}
          data-testid="customer-appointments-list"
        >
          {appointments.map((appointment) => (
            <CustomerDetailRecordListItem
              key={appointment.uuid}
              compact
              title={`${appointment.department_name} · ${appointment.clinic_name}`}
              badges={<AppointmentStatusBadge status={appointment.status} />}
              description={
                <div className="space-y-1.5">
                  <p>{formatAppointmentMeta(appointment)}</p>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 px-2.5 text-xs"
                      onClick={() => setSelectedAppointmentUuid(appointment.uuid)}
                    >
                      View
                    </Button>
                    {canConfirm(appointment) ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 px-2.5 text-xs"
                        disabled={actionUuid === appointment.uuid}
                        onClick={() => void handleAction(appointment, "confirm")}
                      >
                        Confirm
                      </Button>
                    ) : null}
                    {canStartVisit(appointment) ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 px-2.5 text-xs"
                        onClick={() => setStartingAppointment(appointment)}
                      >
                        Start visit
                      </Button>
                    ) : null}
                    {canMarkNoShow(appointment) ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-brand-muted hover:text-brand-navy"
                        disabled={actionUuid === appointment.uuid}
                        onClick={() => void handleAction(appointment, "no-show")}
                      >
                        No-show
                      </Button>
                    ) : null}
                    {canCancel(appointment) ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-brand-muted hover:text-brand-navy"
                        disabled={actionUuid === appointment.uuid}
                        onClick={() =>
                          setPendingAction({ appointment, action: "cancel" })
                        }
                      >
                        Cancel
                      </Button>
                    ) : null}
                  </div>
                </div>
              }
              dateTime={formatDisplayDateTime(appointment.scheduled_start)}
              data-testid={`customer-appointment-${appointment.uuid}`}
            />
          ))}
        </CustomerDetailRecordList>
      )}

      {loadError && hasLoaded ? (
        <p className="text-xs text-red-600">{loadError}</p>
      ) : null}
    </div>
  );
}
