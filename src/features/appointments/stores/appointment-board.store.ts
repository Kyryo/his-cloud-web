import { create } from "zustand";

import type { Appointment } from "@/features/appointments/types/appointment.types";
import type { AppointmentStatus } from "@/features/appointments/types/appointment.types";

type AppointmentBoardState = {
  appointments: Appointment[];
  draggingUuid: string | null;
  movingUuid: string | null;
  rollbackByUuid: Record<string, Appointment>;
  hydrate: (appointments: Appointment[]) => void;
  setDraggingUuid: (uuid: string | null) => void;
  moveToStatus: (uuid: string, status: AppointmentStatus) => Appointment | null;
  revert: (uuid: string) => void;
  commit: (uuid: string) => void;
  reset: () => void;
};

const INITIAL_STATE = {
  appointments: [] as Appointment[],
  draggingUuid: null as string | null,
  movingUuid: null as string | null,
  rollbackByUuid: {} as Record<string, Appointment>,
};

export const useAppointmentBoardStore = create<AppointmentBoardState>((set, get) => ({
  ...INITIAL_STATE,
  hydrate: (appointments) => {
    const { movingUuid, appointments: current } = get();
    const optimistic = movingUuid
      ? current.find((item) => item.uuid === movingUuid)
      : undefined;

    set({
      appointments: appointments.map((item) =>
        optimistic && item.uuid === optimistic.uuid
          ? { ...item, status: optimistic.status }
          : item,
      ),
    });
  },
  setDraggingUuid: (uuid) => {
    set({ draggingUuid: uuid });
  },
  moveToStatus: (uuid, status) => {
    const current = get().appointments.find((item) => item.uuid === uuid);
    if (!current || current.status === status) {
      return null;
    }

    set((state) => ({
      movingUuid: uuid,
      rollbackByUuid: {
        ...state.rollbackByUuid,
        [uuid]: current,
      },
      appointments: state.appointments.map((item) =>
        item.uuid === uuid ? { ...item, status } : item,
      ),
    }));

    return current;
  },
  revert: (uuid) => {
    const original = get().rollbackByUuid[uuid];
    if (!original) {
      return;
    }

    set((state) => {
      const rollbackByUuid = { ...state.rollbackByUuid };
      delete rollbackByUuid[uuid];
      return {
        rollbackByUuid,
        movingUuid: state.movingUuid === uuid ? null : state.movingUuid,
        appointments: state.appointments.map((item) =>
          item.uuid === uuid ? original : item,
        ),
      };
    });
  },
  commit: (uuid) => {
    set((state) => {
      const rollbackByUuid = { ...state.rollbackByUuid };
      delete rollbackByUuid[uuid];
      return {
        rollbackByUuid,
        movingUuid: state.movingUuid === uuid ? null : state.movingUuid,
      };
    });
  },
  reset: () => {
    set({ ...INITIAL_STATE, rollbackByUuid: {} });
  },
}));
