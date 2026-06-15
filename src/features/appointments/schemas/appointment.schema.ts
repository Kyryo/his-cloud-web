import { z } from "zod";

function toIsoDateTime(value: string) {
  return new Date(value).toISOString();
}

export const createAppointmentSchema = z
  .object({
    clinic: z.string().min(1, "Select a clinic"),
    department: z.string().min(1, "Select a department"),
    location: z.string().optional(),
    clinician: z.number().nullable().optional(),
    scheduled_start: z.string().min(1, "Start time is required"),
    scheduled_end: z.string().min(1, "End time is required"),
    reason: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  })
  .superRefine((values, context) => {
    const start = new Date(values.scheduled_start).getTime();
    const end = new Date(values.scheduled_end).getTime();

    if (!Number.isNaN(start) && !Number.isNaN(end) && end <= start) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be after start time",
        path: ["scheduled_end"],
      });
    }
  });

export type CreateAppointmentFormValues = z.infer<typeof createAppointmentSchema>;

export function createAppointmentDefaultValues(
  defaults?: Partial<CreateAppointmentFormValues>,
): CreateAppointmentFormValues {
  const start = new Date();
  start.setMinutes(Math.ceil(start.getMinutes() / 15) * 15, 0, 0);
  const end = new Date(start.getTime() + 30 * 60_000);
  const offset = start.getTimezoneOffset();
  const toLocalInput = (date: Date) =>
    new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);

  return {
    clinic: "",
    department: "",
    location: "",
    clinician: null,
    scheduled_start: toLocalInput(start),
    scheduled_end: toLocalInput(end),
    reason: "",
    notes: "",
    ...defaults,
  };
}

export function toCreateAppointmentPayload(
  patientUuid: string,
  values: CreateAppointmentFormValues,
): {
  patient: string;
  clinic: string;
  department: string;
  location?: string | null;
  clinician?: number | null;
  scheduled_start: string;
  scheduled_end: string;
  reason: string;
  notes: string;
} {
  return {
    patient: patientUuid,
    clinic: values.clinic,
    department: values.department,
    location: values.location?.trim() ? values.location : null,
    clinician: values.clinician ?? null,
    scheduled_start: toIsoDateTime(values.scheduled_start),
    scheduled_end: toIsoDateTime(values.scheduled_end),
    reason: values.reason?.trim() ?? "",
    notes: values.notes?.trim() ?? "",
  };
}

function toLocalDateTimeString(date: Date): string {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function toLocalDateTimeInput(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return toLocalDateTimeString(date);
}

export function appointmentToFormValues(
  appointment: {
    clinic: string;
    department: string;
    location: string | null;
    clinician: number | null;
    scheduled_start: string;
    scheduled_end: string;
    reason: string;
    notes: string;
  },
): CreateAppointmentFormValues {
  return {
    clinic: appointment.clinic,
    department: appointment.department,
    location: appointment.location ?? "",
    clinician: appointment.clinician,
    scheduled_start: toLocalDateTimeInput(appointment.scheduled_start),
    scheduled_end: toLocalDateTimeInput(appointment.scheduled_end),
    reason: appointment.reason ?? "",
    notes: appointment.notes ?? "",
  };
}

export function toUpdateAppointmentPayload(
  values: CreateAppointmentFormValues,
): {
  clinic: string;
  department: string;
  location: string | null;
  clinician: number | null;
  scheduled_start: string;
  scheduled_end: string;
  reason: string;
  notes: string;
} {
  return {
    clinic: values.clinic,
    department: values.department,
    location: values.location?.trim() ? values.location : null,
    clinician: values.clinician ?? null,
    scheduled_start: toIsoDateTime(values.scheduled_start),
    scheduled_end: toIsoDateTime(values.scheduled_end),
    reason: values.reason?.trim() ?? "",
    notes: values.notes?.trim() ?? "",
  };
}

export function canEditAppointment(status: string): boolean {
  return !["completed", "cancelled", "no_show"].includes(status);
}
