"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useEffect } from "react";

import { AppointmentsBoardCardFace } from "@/features/appointments/components/AppointmentsBoardCard";
import { AppointmentsBoardColumn } from "@/features/appointments/components/AppointmentsBoardColumn";
import type { AppointmentTableAction } from "@/features/appointments/components/AppointmentActionConfirmDialog";
import { useAppointmentBoardStore } from "@/features/appointments/stores/appointment-board.store";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import type { AppointmentStatus } from "@/features/appointments/types/appointment.types";
import { groupAppointmentsByStatus } from "@/features/appointments/utils/appointment-board";
import { getBoardMoveAction } from "@/features/appointments/utils/appointment-board-transitions";
import type { AppointmentStatusFilter } from "@/features/appointments/utils/appointment-list-filters";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type AppointmentsBoardProps = {
  appointments: Appointment[];
  statusFilter?: AppointmentStatusFilter;
  onSelectAppointment: (appointment: Appointment) => void;
  onActionRequest: (
    appointment: Appointment,
    action: AppointmentTableAction,
  ) => void;
};

export function AppointmentsBoard({
  appointments,
  statusFilter = "all",
  onSelectAppointment,
  onActionRequest,
}: AppointmentsBoardProps) {
  const boardAppointments = useAppointmentBoardStore((state) => state.appointments);
  const draggingUuid = useAppointmentBoardStore((state) => state.draggingUuid);
  const movingUuid = useAppointmentBoardStore((state) => state.movingUuid);
  const hydrate = useAppointmentBoardStore((state) => state.hydrate);
  const setDraggingUuid = useAppointmentBoardStore((state) => state.setDraggingUuid);
  const moveToStatus = useAppointmentBoardStore((state) => state.moveToStatus);

  useEffect(() => {
    hydrate(appointments);
  }, [appointments, hydrate]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const columns = groupAppointmentsByStatus(boardAppointments, statusFilter);
  const draggingAppointment =
    boardAppointments.find((item) => item.uuid === draggingUuid) ?? null;

  function handleDragStart(event: DragStartEvent) {
    setDraggingUuid(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggingUuid(null);

    const overStatus = event.over?.id ? String(event.over.id) : null;
    const appointment = boardAppointments.find(
      (item) => item.uuid === String(event.active.id),
    );
    if (!appointment || !overStatus) {
      return;
    }

    const action = getBoardMoveAction(
      appointment.status,
      overStatus as AppointmentStatus,
    );
    if (!action) {
      return;
    }

    if (action !== "start") {
      moveToStatus(appointment.uuid, overStatus as AppointmentStatus);
    }

    onActionRequest(appointment, action);
  }

  function handleDragCancel() {
    setDraggingUuid(null);
  }

  return (
    <div
      className="flex h-[calc(100dvh-11.5rem)] min-h-0 flex-1 flex-col"
      data-testid="appointments-board"
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex h-full min-h-0 flex-1 gap-3 overflow-x-auto">
          {columns.map((column) => (
            <AppointmentsBoardColumn
              key={column.status}
              column={column}
              draggingStatus={draggingAppointment?.status ?? null}
              movingUuid={movingUuid}
              onSelectAppointment={onSelectAppointment}
            />
          ))}
        </div>
        <DragOverlay>
          {draggingAppointment ? (
            <div className={cn(appFont.className, "w-[17.5rem]")}>
              <AppointmentsBoardCardFace
                appointment={draggingAppointment}
                className="scale-[1.03] shadow-lg ring-black/10"
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
