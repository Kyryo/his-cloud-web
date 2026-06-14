"use client";

import { CalendarPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { TabAddActionButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import { StatsCard1, StatsCard1Grid } from "@/components/stats-card1";
import { CreateAppointmentDialog } from "@/features/appointments/components/CreateAppointmentDialog";
import { StartVisitFromAppointmentDialog } from "@/features/appointments/components/StartVisitFromAppointmentDialog";
import { fetchAppointments, runAppointmentAction } from "@/features/appointments/services/appointments.service";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import {
  CustomerDetailRecordList,
  CustomerDetailRecordListItem,
} from "@/features/customers/components/detail/CustomerDetailRecordList";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import type { Customer } from "@/features/customers/types/customer.types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { AppointmentStatusBadge } from "@/features/appointments/components/AppointmentStatusBadge";
import { formatCompactNumber } from "@/utils/format-compact-number";
import { useToast } from "@/providers/toast-provider";

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
  const [startingAppointment, setStartingAppointment] = useState<Appointment | null>(
    null,
  );
  const [actionUuid, setActionUuid] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetchAppointments({
        patient: customer.patient_uuid,
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
  }, [customer.patient_uuid]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    void loadAppointments();
  }, [isActive, loadAppointments, refreshKey]);

  const handleAction = async (
    appointment: Appointment,
    action: "confirm" | "cancel" | "no-show",
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
              : "Marked as no-show.",
      });
      await loadAppointments();
    } catch (error) {
      toast({
        variant: "error",
        title: "Action could not be completed",
        description: error instanceof Error ? error.message : "Try again.",
      });
    } finally {
      setActionUuid(null);
    }
  };

  const scheduleButton = (
    <TabAddActionButton
      label="Schedule appointment"
      onClick={() => setCreateOpen(true)}
      data-testid="schedule-appointment-button"
    />
  );

  if (!isActive) {
    return null;
  }

  if (isLoading && !hasLoaded) {
    return <CustomerTabSkeleton statCards={3} rows={5} />;
  }

  if (loadError && !hasLoaded) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
        {loadError}
      </div>
    );
  }

  const upcomingCount = appointments.filter((appointment) =>
    ["scheduled", "confirmed", "in_progress"].includes(appointment.status),
  ).length;
  const completedCount = appointments.filter(
    (appointment) => appointment.status === "completed",
  ).length;

  return (
    <div className="space-y-4" data-testid="customer-detail-appointments-tab">
      <CreateAppointmentDialog
        customer={customer}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => void loadAppointments()}
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatsCard1Grid className="flex-1">
          <StatsCard1
            title="Total appointments"
            value={formatCompactNumber(appointments.length)}
          />
          <StatsCard1 title="Upcoming" value={formatCompactNumber(upcomingCount)} />
          <StatsCard1 title="Completed" value={formatCompactNumber(completedCount)} />
        </StatsCard1Grid>
        {appointments.length > 0 ? scheduleButton : null}
      </div>

      {appointments.length === 0 ? (
        <CustomerDetailTabEmptyState
          icon={CalendarPlus}
          title="No appointments yet"
          description="Schedule the client's next visit to reserve clinic time in advance."
          action={scheduleButton}
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
                    {canCancel(appointment) ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-brand-muted hover:text-brand-navy"
                        disabled={actionUuid === appointment.uuid}
                        onClick={() => void handleAction(appointment, "cancel")}
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
    </div>
  );
}
