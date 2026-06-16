/**
 * Formats numbers with k/m suffixes for compact display (e.g. 1.2k, 3.4m).
 */
export function formatCompactNumber(value: number): string {
  const absolute = Math.abs(value);

  if (absolute >= 1_000_000) {
    const formatted = trimTrailingZero((value / 1_000_000).toFixed(1));
    return `${formatted}m`;
  }

  if (absolute >= 1_000) {
    const formatted = trimTrailingZero((value / 1_000).toFixed(1));
    return `${formatted}k`;
  }

  return String(Math.round(value));
}

/**
 * Parses numeric strings and formats them compactly for stat cards.
 */
export function formatCompactAmount(
  value: number | string | null | undefined,
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const parsed = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(parsed)) {
    return "—";
  }

  return formatCompactNumber(parsed);
}

function trimTrailingZero(value: string): string {
  return value.replace(/\.0$/, "");
}
