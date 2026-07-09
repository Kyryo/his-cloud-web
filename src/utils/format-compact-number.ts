/**
 * Formats numbers with k/m suffixes for compact display (e.g. 1.2k, 3.4m).
 */
export function formatCompactNumber(value: number): string {
  const absolute = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absolute >= 1_000_000_000) {
    const formatted = trimTrailingZero((absolute / 1_000_000_000).toFixed(1));
    return `${sign}${formatted}B`;
  }

  if (absolute >= 1_000_000) {
    const formatted = trimTrailingZero((absolute / 1_000_000).toFixed(1));
    return `${sign}${formatted}M`;
  }

  if (absolute >= 1_000) {
    const formatted = trimTrailingZero((absolute / 1_000).toFixed(1));
    return `${sign}${formatted}k`;
  }

  return String(Math.round(value));
}

/**
 * Formats currency values compactly with an optional prefix (e.g. MWK 1.5M).
 */
export function formatCompactCurrency(
  value: number | string | null | undefined,
  currency = "MWK",
): string {
  const compact = formatCompactAmount(value);
  if (compact === "—") {
    return compact;
  }
  return `${currency} ${compact}`;
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
