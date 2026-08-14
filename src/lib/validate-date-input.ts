export type ValidateDateInputOptions = {
  allowFuture?: boolean;
  minYear?: number;
  maxYear?: number;
  required?: boolean;
  futureMessage?: string;
};

const DATE_INPUT_PATTERN = /^\d{0,4}(-\d{0,2}){0,2}(-\d{0,2})?$/;
const COMPLETE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Formats a partial ISO date as the user types: YYYY → YYYY- → YYYY-MM- → YYYY-MM-DD.
 * Digits only; max 8. Trailing dashes are added when moving forward past year/month.
 */
export function formatPartialIsoDateInput(
  raw: string,
  previous = "",
): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const previousDigits = previous.replace(/\D/g, "").slice(0, 8);

  let formatted = digits;
  if (digits.length > 4) {
    formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  if (digits.length > 6) {
    formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
  }

  const typingForward = digits.length > previousDigits.length;
  if (typingForward && (digits.length === 4 || digits.length === 6)) {
    formatted = `${formatted}-`;
  }

  return formatted;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function validateDateInput(
  value: string,
  options: ValidateDateInputOptions = {},
): string | null {
  const trimmed = value.trim();
  const {
    allowFuture = false,
    minYear = 1900,
    maxYear = new Date().getFullYear(),
    required = false,
    futureMessage = "Date cannot be in the future.",
  } = options;

  if (!trimmed) {
    return required ? "Date is required." : null;
  }

  if (!DATE_INPUT_PATTERN.test(trimmed)) {
    return "Use the format YYYY-MM-DD.";
  }

  const [yearStr = "", monthStr = "", dayStr = ""] = trimmed.split("-");

  if (yearStr.length > 0 && yearStr.length < 4 && trimmed.includes("-")) {
    return "Enter a four-digit year.";
  }

  if (yearStr.length === 4) {
    const year = Number(yearStr);
    if (Number.isNaN(year)) {
      return "Enter a valid year.";
    }
    if (year < minYear) {
      return `Year must be ${minYear} or later.`;
    }
    if (year > maxYear) {
      if (!allowFuture) {
        return futureMessage;
      }
    }
  }

  if (monthStr.length === 1 && Number(monthStr) > 1) {
    return "Enter a valid month (01–12).";
  }

  if (monthStr.length === 2) {
    const month = Number(monthStr);
    if (month < 1 || month > 12) {
      return "Enter a valid month (01–12).";
    }
  }

  if (dayStr.length === 1 && Number(dayStr) > 3) {
    return "Enter a valid day (01–31).";
  }

  if (dayStr.length === 2) {
    const day = Number(dayStr);
    if (day < 1 || day > 31) {
      return "Enter a valid day (01–31).";
    }
  }

  if (!COMPLETE_DATE_PATTERN.test(trimmed)) {
    return null;
  }

  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    const maxDay = daysInMonth(year, month);
    if (day > maxDay) {
      return `This month only has ${maxDay} days.`;
    }
    return "Enter a valid date.";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);

  if (!allowFuture && parsed > today) {
    return futureMessage;
  }

  if (year < minYear) {
    return `Year must be ${minYear} or later.`;
  }

  return null;
}
