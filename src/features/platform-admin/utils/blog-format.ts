const NUMBER_FORMAT = new Intl.NumberFormat(undefined);
const COMPACT_FORMAT = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 });
const DATE_FORMAT = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" });
const DATE_TIME_FORMAT = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatBlogNumber(value: number): string {
  return NUMBER_FORMAT.format(value);
}

export function formatBlogCompact(value: number): string {
  return COMPACT_FORMAT.format(value);
}

function parseDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatBlogDate(value?: string | null): string {
  const date = parseDate(value);
  return date ? DATE_FORMAT.format(date) : "—";
}

export function formatBlogDateTime(value?: string | null): string {
  const date = parseDate(value);
  return date ? DATE_TIME_FORMAT.format(date) : "—";
}

export function formatPercentChange(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function slugifyBlogTitle(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isScheduled(publishedAt?: string | null, now = new Date()): boolean {
  const date = parseDate(publishedAt);
  return Boolean(date && date.getTime() > now.getTime());
}
