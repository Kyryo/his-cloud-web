import type { Appointment } from "@/features/appointments/types/appointment.types";
import { TodaysAppointmentsBoardMetrics } from "@/features/reports/components/TodaysAppointmentsBoardMetrics";
import { TodaysAppointmentsBoardRow } from "@/features/reports/components/TodaysAppointmentsBoardRow";
import {
  type BoardGroupBy,
  type BoardRenderItem,
  type BoardStatusFilter,
  buildBoardMetrics,
  buildTimeBoardItems,
  filterBoardAppointments,
  groupBoardAppointments,
} from "@/features/reports/utils/todays-appointments-board";
import { cn } from "@/lib/utils";

type TodaysAppointmentsBoardProps = {
  appointments: Appointment[];
  now: Date;
  search: string;
  statusFilter: BoardStatusFilter;
  onStatusFilterChange: (filter: BoardStatusFilter) => void;
  groupBy: BoardGroupBy;
  onSelectAppointment: (appointment: Appointment) => void;
};

function BoardHeading({
  label,
  count,
  className,
}: {
  label: string;
  count: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 py-2", className)}>
      <h2 className="shrink-0 text-[13px] font-semibold tabular-nums text-brand-navy">
        {label}
      </h2>
      <span className="h-px min-w-4 flex-1 bg-dash-border/80" />
      <span className="text-[11px] tabular-nums text-dash-muted">{count}</span>
    </div>
  );
}

function NowMarker() {
  return (
    <div
      className="flex items-center gap-3 py-2"
      data-testid="todays-appointments-now"
    >
      <span className="text-[11px] font-semibold text-brand-primary">Now</span>
      <span className="h-px flex-1 bg-brand-primary/45" />
    </div>
  );
}

function TimeBoardList({
  items,
  onSelect,
}: {
  items: BoardRenderItem[];
  onSelect: (appointment: Appointment) => void;
}) {
  return (
    <div className="[&>:first-child]:mt-0" data-testid="todays-appointments-time-board">
      {items.map((item, index) => {
        if (item.type === "heading") {
          return (
            <BoardHeading
              key={`heading-${item.key}`}
              label={item.label}
              count={item.count}
              className="mt-5"
            />
          );
        }
        if (item.type === "now") {
          return <NowMarker key={`now-${index}`} />;
        }
        return (
          <div
            key={item.appointment.uuid}
            className="border-b border-dash-border/50 last:border-b-0"
          >
            <TodaysAppointmentsBoardRow
              appointment={item.appointment}
              onSelect={onSelect}
            />
          </div>
        );
      })}
    </div>
  );
}

export function TodaysAppointmentsBoard({
  appointments,
  now,
  search,
  statusFilter,
  onStatusFilterChange,
  groupBy,
  onSelectAppointment,
}: TodaysAppointmentsBoardProps) {
  const metrics = buildBoardMetrics(appointments);
  const visible = filterBoardAppointments(appointments, statusFilter, search);
  const grouped = groupBoardAppointments(visible, groupBy);
  const timeItems =
    groupBy === "time" ? buildTimeBoardItems(visible, now) : [];

  return (
    <div className="space-y-5" data-testid="todays-appointments-board">
      <TodaysAppointmentsBoardMetrics
        metrics={metrics}
        activeFilter={statusFilter}
        onFilterChange={onStatusFilterChange}
      />

      {visible.length === 0 ? (
        <p
          className="py-16 text-center text-sm text-dash-muted"
          data-testid="todays-appointments-filtered-empty"
        >
          No appointments match this view.
        </p>
      ) : groupBy === "time" ? (
        <TimeBoardList items={timeItems} onSelect={onSelectAppointment} />
      ) : (
        <div className="space-y-4" data-testid="todays-appointments-grouped-board">
          {grouped.map((group) => (
            <section key={group.key}>
              <BoardHeading
                label={group.label}
                count={group.appointments.length}
              />
              {group.appointments.map((appointment) => (
                <div
                  key={appointment.uuid}
                  className="border-b border-dash-border/50 last:border-b-0"
                >
                  <TodaysAppointmentsBoardRow
                    appointment={appointment}
                    onSelect={onSelectAppointment}
                    hideProvider={groupBy === "provider"}
                    hideClinic={groupBy === "clinic"}
                  />
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
