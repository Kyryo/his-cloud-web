import type {
  AppointmentAction,
  AppointmentStatus,
} from "@/features/appointments/types/appointment.types";

const BOARD_MOVES: Record<AppointmentStatus, Partial<Record<AppointmentStatus, AppointmentAction>>> =
  {
    scheduled: {
      confirmed: "confirm",
      in_progress: "start",
      cancelled: "cancel",
      no_show: "no-show",
    },
    confirmed: {
      in_progress: "start",
      cancelled: "cancel",
      no_show: "no-show",
    },
    in_progress: {},
    completed: {},
    cancelled: {},
    no_show: {},
    rescheduled: {},
  };

export function getBoardMoveAction(
  from: AppointmentStatus,
  to: AppointmentStatus,
): AppointmentAction | null {
  if (from === to) {
    return null;
  }

  return BOARD_MOVES[from][to] ?? null;
}

export function canDropOnBoardColumn(
  from: AppointmentStatus,
  to: AppointmentStatus,
): boolean {
  return from === to || getBoardMoveAction(from, to) !== null;
}
