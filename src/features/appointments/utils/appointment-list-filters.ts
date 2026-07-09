import type {
  AppointmentStatus,
  FetchAppointmentsOptions,
} from "@/features/appointments/types/appointment.types";

export type AppointmentStatusFilter = AppointmentStatus | "all";

export type AppointmentListFilterState = {
  status: AppointmentStatusFilter;
  clinicUuid: string;
  departmentUuid: string;
  clinicianId: number | null;
  scheduledFrom: string;
  scheduledTo: string;
};

export const DEFAULT_APPOINTMENT_FILTERS: AppointmentListFilterState = {
  status: "all",
  clinicUuid: "",
  departmentUuid: "",
  clinicianId: null,
  scheduledFrom: "",
  scheduledTo: "",
};

export function countActiveAppointmentFilters(
  filters: AppointmentListFilterState,
): number {
  let count = 0;

  if (filters.status !== "all") {
    count += 1;
  }
  if (filters.clinicUuid) {
    count += 1;
  }
  if (filters.departmentUuid) {
    count += 1;
  }
  if (filters.clinicianId) {
    count += 1;
  }
  if (filters.scheduledFrom) {
    count += 1;
  }
  if (filters.scheduledTo) {
    count += 1;
  }

  return count;
}

export function buildAppointmentListFilters(
  filters: AppointmentListFilterState,
  options: {
    page: number;
    pageSize: number;
    search?: string;
  },
): FetchAppointmentsOptions {
  return {
    page: options.page,
    pageSize: options.pageSize,
    search: options.search || undefined,
    status: filters.status === "all" ? undefined : filters.status,
    clinicUuid: filters.clinicUuid || undefined,
    departmentUuid: filters.departmentUuid || undefined,
    ...(filters.clinicianId ? { clinicianId: filters.clinicianId } : {}),
    scheduledFrom: filters.scheduledFrom || undefined,
    scheduledTo: filters.scheduledTo || undefined,
  };
}

export const APPOINTMENT_STATUS_OPTIONS: Array<{
  value: AppointmentStatusFilter;
  label: string;
}> = [
  { value: "all", label: "All statuses" },
  { value: "scheduled", label: "Scheduled" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No show" },
  { value: "rescheduled", label: "Rescheduled" },
];
