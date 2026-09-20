/**
 * Calendar-accurate age parts from a date of birth.
 * Years / months / days are computed by walking calendar boundaries
 * (not approximate day totals).
 */

export type AgeParts = {
  years: number;
  months: number;
  days: number;
};

function parseDob(dob: string | Date): Date | null {
  if (dob instanceof Date) {
    return Number.isNaN(dob.getTime()) ? null : dob;
  }
  const trimmed = dob.trim();
  if (!trimmed) {
    return null;
  }
  // Prefer YYYY-MM-DD as local calendar date to avoid UTC shift.
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]) - 1;
    const day = Number(dateOnly[3]);
    const local = new Date(year, month, day);
    if (
      local.getFullYear() !== year ||
      local.getMonth() !== month ||
      local.getDate() !== day
    ) {
      return null;
    }
    return local;
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Calculate years, months, and days of age for a date of birth.
 * Returns null when dob is missing, invalid, or in the future.
 */
export function calculateAgeParts(
  dob?: string | Date | null,
  asOf: Date = new Date(),
): AgeParts | null {
  if (dob == null || dob === "") {
    return null;
  }

  const birth = parseDob(dob);
  if (!birth) {
    return null;
  }

  const today = startOfLocalDay(asOf);
  const birthDay = startOfLocalDay(birth);
  if (birthDay.getTime() > today.getTime()) {
    return null;
  }

  let years = today.getFullYear() - birthDay.getFullYear();
  let months = today.getMonth() - birthDay.getMonth();
  let days = today.getDate() - birthDay.getDate();

  if (days < 0) {
    months -= 1;
    const previousMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
    const previousMonthYear =
      today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
    days += daysInMonth(previousMonthYear, previousMonth);
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

export type FormatAgeOptions = {
  asOf?: Date;
  /** compact: "32y 4m 11d"; long: "32 years, 4 months, 11 days" */
  style?: "compact" | "long";
  /** Shown when age cannot be calculated. Default: "—" */
  empty?: string;
};

function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/**
 * Format an age as years, months, and days for display.
 */
export function formatAge(
  dob?: string | Date | null,
  options: FormatAgeOptions = {},
): string {
  const parts = calculateAgeParts(dob, options.asOf);
  if (!parts) {
    return options.empty ?? "—";
  }
  return formatAgeParts(parts, options.style ?? "compact");
}

export function formatAgeParts(
  parts: AgeParts,
  style: "compact" | "long" = "compact",
): string {
  if (style === "long") {
    return [
      pluralize(parts.years, "year", "years"),
      pluralize(parts.months, "month", "months"),
      pluralize(parts.days, "day", "days"),
    ].join(", ");
  }

  return `${parts.years}y ${parts.months}m ${parts.days}d`;
}
