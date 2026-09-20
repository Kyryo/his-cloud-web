/**
 * Helpers for laboratory analyte result entry (input filtering + ref checks).
 */

export function formatAnalyteReferenceRange(
  refLow: string | number | null | undefined,
  refHigh: string | number | null | undefined,
): string | null {
  const low =
    refLow === null || refLow === undefined || refLow === ""
      ? null
      : String(refLow);
  const high =
    refHigh === null || refHigh === undefined || refHigh === ""
      ? null
      : String(refHigh);

  if (low == null && high == null) {
    return null;
  }
  if (low != null && high != null) {
    return `${low} – ${high}`;
  }
  if (low != null) {
    return `≥ ${low}`;
  }
  return `≤ ${high}`;
}

export function isNumericOutOfReferenceRange(
  value: string,
  refLow: string | number | null | undefined,
  refHigh: string | number | null | undefined,
): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "-" || trimmed === "." || trimmed === "-.") {
    return false;
  }
  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric)) {
    return false;
  }

  const low =
    refLow === null || refLow === undefined || refLow === ""
      ? null
      : Number(refLow);
  const high =
    refHigh === null || refHigh === undefined || refHigh === ""
      ? null
      : Number(refHigh);

  if (low != null && Number.isFinite(low) && numeric < low) {
    return true;
  }
  if (high != null && Number.isFinite(high) && numeric > high) {
    return true;
  }
  return false;
}

/**
 * Keep only characters valid for the analyte's numeric precision.
 * - integer (precision 0): digits and optional leading minus
 * - decimal: digits, one dot, optional leading minus, capped fractional digits
 */
export function sanitizeAnalyteNumericInput(
  raw: string,
  decimalPrecision: number | null | undefined,
): string {
  let next = raw.replace(/[^\d.-]/g, "");

  const hasLeadingMinus = next.startsWith("-");
  next = next.replace(/-/g, "");
  if (hasLeadingMinus) {
    next = `-${next}`;
  }

  const isInteger = decimalPrecision === 0;
  if (isInteger) {
    next = next.replace(/\./g, "");
    if (next.startsWith("-")) {
      return `-${next.slice(1).replace(/\D/g, "")}`;
    }
    return next.replace(/\D/g, "");
  }

  const minus = next.startsWith("-") ? "-" : "";
  const unsigned = minus ? next.slice(1) : next;
  const firstDot = unsigned.indexOf(".");
  if (firstDot === -1) {
    return `${minus}${unsigned.replace(/\D/g, "")}`;
  }

  const whole = unsigned.slice(0, firstDot).replace(/\D/g, "");
  let fraction = unsigned
    .slice(firstDot + 1)
    .replace(/\./g, "")
    .replace(/\D/g, "");
  if (
    typeof decimalPrecision === "number" &&
    decimalPrecision > 0 &&
    fraction.length > decimalPrecision
  ) {
    fraction = fraction.slice(0, decimalPrecision);
  }
  return `${minus}${whole}.${fraction}`;
}
