/**
 * Formats numbers with K/M suffixes for compact display (e.g. 1.2K, 3.4M).
 */
export function formatCompactNumber(value: number): string {
  const absolute = Math.abs(value);

  if (absolute >= 1_000_000) {
    const formatted = trimTrailingZero((value / 1_000_000).toFixed(1));
    return `${formatted}M`;
  }

  if (absolute >= 1_000) {
    const formatted = trimTrailingZero((value / 1_000).toFixed(1));
    return `${formatted}K`;
  }

  return String(Math.round(value));
}

function trimTrailingZero(value: string): string {
  return value.replace(/\.0$/, "");
}
