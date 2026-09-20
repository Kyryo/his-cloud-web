import { format, isValid } from "date-fns";

const MINUTE_STEP = 5;

export function parseDateTimeLocal(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hours = Number(match[4]);
  const minutes = Number(match[5]);
  const parsed = new Date(year, month - 1, day, hours, minutes);

  return isValid(parsed) ? parsed : null;
}

export function formatDateTimeLocal(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function formatDateTimePickerLabel(date: Date): string {
  return format(date, "d MMM yyyy, HH:mm");
}

export function formatDateTimePickerDate(date: Date): string {
  return format(date, "EEE d MMM");
}

export function formatDateTimePickerTime(date: Date): string {
  return format(date, "HH:mm");
}

export function buildMinuteOptions(selectedMinute?: number): number[] {
  const options = Array.from({ length: 60 / MINUTE_STEP }, (_, index) => {
    return index * MINUTE_STEP;
  });

  if (
    typeof selectedMinute === "number" &&
    selectedMinute >= 0 &&
    selectedMinute <= 59 &&
    !options.includes(selectedMinute)
  ) {
    return [...options, selectedMinute].toSorted((left, right) => left - right);
  }

  return options;
}

export function applyDatePart(base: Date, nextDate: Date): Date {
  return new Date(
    nextDate.getFullYear(),
    nextDate.getMonth(),
    nextDate.getDate(),
    base.getHours(),
    base.getMinutes(),
  );
}

export function applyTimePart(base: Date, hours: number, minutes: number): Date {
  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    hours,
    minutes,
  );
}
