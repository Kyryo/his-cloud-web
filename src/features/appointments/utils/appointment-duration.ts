/**
 * Duration helpers for appointment scheduling UI.
 *
 * End time is derived as start + duration minutes (presets or custom).
 */

export const APPOINTMENT_DURATION_PRESETS = [15, 30, 45, 60] as const;

export type AppointmentDurationPreset =
  (typeof APPOINTMENT_DURATION_PRESETS)[number];

export type AppointmentDurationSelectValue =
  | `${AppointmentDurationPreset}`
  | "other";

export function isAppointmentDurationPreset(
  minutes: number,
): minutes is AppointmentDurationPreset {
  return (APPOINTMENT_DURATION_PRESETS as readonly number[]).includes(minutes);
}

function toLocalDateTimeString(date: Date): string {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

/**
 * Add minutes to a `datetime-local` value and return the same format.
 */
export function addMinutesToLocalDateTime(
  localDateTime: string,
  minutes: number,
): string {
  const date = new Date(localDateTime);
  if (Number.isNaN(date.getTime()) || !Number.isFinite(minutes)) {
    return "";
  }

  return toLocalDateTimeString(new Date(date.getTime() + minutes * 60_000));
}

/**
 * Whole-minute difference between two `datetime-local` values.
 * Returns null when either value is invalid or end is not after start.
 */
export function getDurationMinutesBetween(
  startLocalDateTime: string,
  endLocalDateTime: string,
): number | null {
  const startMs = new Date(startLocalDateTime).getTime();
  const endMs = new Date(endLocalDateTime).getTime();

  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) {
    return null;
  }

  return Math.round((endMs - startMs) / 60_000);
}

/**
 * Resolve which duration select option matches the current start/end pair.
 */
export function resolveDurationSelectValue(
  startLocalDateTime: string,
  endLocalDateTime: string,
  forceOther = false,
): AppointmentDurationSelectValue {
  if (forceOther) {
    return "other";
  }

  const minutes = getDurationMinutesBetween(startLocalDateTime, endLocalDateTime);
  if (minutes !== null && isAppointmentDurationPreset(minutes)) {
    return String(minutes) as AppointmentDurationSelectValue;
  }

  return "other";
}

/**
 * Parse a custom duration input. Returns null when empty or invalid.
 */
export function formatAppointmentDurationLabel(minutes: number): string {
  if (minutes === 60) {
    return "1 hour";
  }

  if (minutes > 60 && minutes % 60 === 0) {
    return `${minutes / 60} hours`;
  }

  return `${minutes} minutes`;
}

export function formatAppointmentScheduleRange(
  startLocalDateTime: string,
  endLocalDateTime: string,
): { dateLabel: string; timeLabel: string; durationLabel: string } | null {
  const start = new Date(startLocalDateTime);
  const end = new Date(endLocalDateTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  const minutes = getDurationMinutesBetween(startLocalDateTime, endLocalDateTime);
  const timeFormat = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    dateLabel: new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(start),
    timeLabel: `${timeFormat.format(start)} – ${timeFormat.format(end)}`,
    durationLabel: minutes ? formatAppointmentDurationLabel(minutes) : "",
  };
}

export function parseCustomDurationMinutes(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 1440) {
    return null;
  }

  return parsed;
}
