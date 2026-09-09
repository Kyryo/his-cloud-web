"use client";

import { useDroppable } from "@dnd-kit/core";

import { AppointmentsBoardCard } from "@/features/appointments/components/AppointmentsBoardCard";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import type { AppointmentStatus } from "@/features/appointments/types/appointment.types";
import {
  APPOINTMENT_BOARD_ACCENT,
  type AppointmentBoardColumn,
} from "@/features/appointments/utils/appointment-board";
import { canDropOnBoardColumn } from "@/features/appointments/utils/appointment-board-transitions";
import { cn } from "@/lib/utils";

type AppointmentsBoardColumnProps = {
  column: AppointmentBoardColumn;
  draggingStatus: AppointmentStatus | null;
  movingUuid: string | null;
  onSelectAppointment: (appointment: Appointment) => void;
};

export function AppointmentsBoardColumn({
  column,
  draggingStatus,
  movingUuid,
  onSelectAppointment,
}: AppointmentsBoardColumnProps) {
  const isValidTarget =
    !draggingStatus || canDropOnBoardColumn(draggingStatus, column.status);
  const { setNodeRef, isOver } = useDroppable({
    id: column.status,
    data: { status: column.status },
    disabled: !isValidTarget,
  });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex h-full w-[18.5rem] shrink-0 flex-col rounded-2xl bg-dash-canvas/90 p-2.5",
        draggingStatus && !isValidTarget && "opacity-40",
        isOver && isValidTarget && "ring-2 ring-brand-primary/25",
      )}
      data-testid={`appointments-board-column-${column.status}`}
    >
      <header className="flex items-center justify-between gap-3 px-1.5 pb-2.5 pt-1">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className={cn(
              "size-2 shrink-0 rounded-full",
              APPOINTMENT_BOARD_ACCENT[column.status],
            )}
          />
          <h3 className="truncate text-[13px] font-semibold text-brand-navy">
            {column.label}
          </h3>
        </div>
        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] tabular-nums text-dash-muted ring-1 ring-black/5">
          {column.appointments.length}
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-0.5">
        {column.appointments.length === 0 ? (
          <p className="rounded-xl border border-dashed border-dash-border/90 px-3 py-8 text-center text-xs text-dash-muted">
            {isValidTarget && draggingStatus
              ? "Drop to update status"
              : "No appointments"}
          </p>
        ) : (
          column.appointments.map((appointment) => (
            <AppointmentsBoardCard
              key={appointment.uuid}
              appointment={appointment}
              isMoving={movingUuid === appointment.uuid}
              onSelect={onSelectAppointment}
            />
          ))
        )}
      </div>
    </section>
  );
}
