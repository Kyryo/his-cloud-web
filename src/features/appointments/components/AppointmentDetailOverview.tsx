import { AppointmentStatusBadge } from "@/features/appointments/components/AppointmentStatusBadge";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import { formatAppointmentScheduleRange } from "@/features/appointments/utils/appointment-duration";

type AppointmentDetailOverviewProps = {
  appointment: Appointment;
};

function MetaRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-3 first:pt-0 last:pb-0">
      <dt className="shrink-0 text-sm text-dash-muted">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium text-brand-navy">
        {value}
      </dd>
    </div>
  );
}

function NoteBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const hasValue = Boolean(value.trim());

  return (
    <section>
      <h3 className="text-sm text-dash-muted">{label}</h3>
      <p
        className={
          hasValue
            ? "mt-1.5 whitespace-pre-wrap text-sm leading-6 text-brand-navy"
            : "mt-1.5 text-sm text-dash-muted"
        }
      >
        {hasValue ? value : "None added"}
      </p>
    </section>
  );
}

export function AppointmentDetailOverview({
  appointment,
}: AppointmentDetailOverviewProps) {
  const schedule = formatAppointmentScheduleRange(
    appointment.scheduled_start,
    appointment.scheduled_end,
  );
  const location = [appointment.department_name, appointment.location_name]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-8" data-testid="appointment-detail-overview">
      <section className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-dash-muted">When</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-brand-navy">
            {schedule?.dateLabel ?? "—"}
          </p>
          <p className="mt-1 text-sm text-dash-muted">
            {[schedule?.timeLabel, schedule?.durationLabel]
              .filter(Boolean)
              .join(" · ") || "—"}
          </p>
        </div>
        <AppointmentStatusBadge status={appointment.status} />
      </section>

      <dl className="divide-y divide-dash-border/70 border-y border-dash-border/70">
        <MetaRow
          label="Care provider"
          value={appointment.clinician_name || "Unassigned"}
        />
        <MetaRow label="Clinic" value={appointment.clinic_name || "—"} />
        <MetaRow label="Department" value={location || "—"} />
      </dl>

      <div className="space-y-6">
        <NoteBlock label="Reason for visit" value={appointment.reason} />
        <NoteBlock label="Internal notes" value={appointment.notes} />
      </div>
    </div>
  );
}
