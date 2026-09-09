"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { UserIdenticon } from "@/components/UserIdenticon";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import { formatBoardAppointmentWhen } from "@/features/appointments/utils/appointment-board";
import { cn } from "@/lib/utils";

type AppointmentsBoardCardFaceProps = {
  appointment: Appointment;
  className?: string;
  isMoving?: boolean;
  onSelect?: (appointment: Appointment) => void;
  dragHandleProps?: Record<string, unknown>;
};

export function AppointmentsBoardCardFace({
  appointment,
  className,
  isMoving = false,
  onSelect,
  dragHandleProps,
}: AppointmentsBoardCardFaceProps) {
  return (
    <button
      type="button"
      data-testid={`appointments-board-card-${appointment.uuid}`}
      className={cn(
        "w-full rounded-xl bg-white p-3 text-left shadow-[0_1px_2px_rgba(31,42,36,0.06)] ring-1 ring-black/5 transition-shadow",
        isMoving && "opacity-70",
        className,
      )}
      onClick={() => onSelect?.(appointment)}
      {...dragHandleProps}
    >
      <span className="flex items-start gap-2.5">
        <UserIdenticon
          seed={appointment.patient || appointment.patient_name}
          name={appointment.patient_name}
          className="size-8 shrink-0 rounded-full"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-brand-navy">
            {appointment.patient_name}
          </span>
          <span className="mt-0.5 block text-[11px] tabular-nums text-dash-muted">
            {formatBoardAppointmentWhen(appointment.scheduled_start)}
          </span>
          <span className="mt-1 block truncate text-[11px] text-dash-muted">
            {appointment.clinician_name?.trim() || "Unassigned"}
            {appointment.department_name
              ? ` · ${appointment.department_name}`
              : ""}
          </span>
        </span>
      </span>
    </button>
  );
}

type AppointmentsBoardCardProps = {
  appointment: Appointment;
  isMoving?: boolean;
  onSelect: (appointment: Appointment) => void;
};

export function AppointmentsBoardCard({
  appointment,
  isMoving = false,
  onSelect,
}: AppointmentsBoardCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: appointment.uuid,
    data: { appointment },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(isDragging && "opacity-30")}
    >
      <AppointmentsBoardCardFace
        appointment={appointment}
        isMoving={isMoving}
        onSelect={isDragging ? undefined : onSelect}
        dragHandleProps={{ ...listeners, ...attributes }}
        className="hover:ring-brand-primary/20"
      />
    </div>
  );
}
