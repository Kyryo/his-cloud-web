import { format, isValid, parseISO } from "date-fns";

import type {
  FitnessAssessment,
  FitnessCertificate,
} from "@/features/occupational-health/types";

export function humanizeOhCode(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }
  const words = value.replace(/_/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function formatOhDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }
  const parsed = parseISO(value);
  return isValid(parsed) ? format(parsed, "d MMM yyyy") : value;
}

export function formatOhDateRange(
  from: string | null | undefined,
  to: string | null | undefined,
): string {
  return to
    ? `${formatOhDate(from)} – ${formatOhDate(to)}`
    : `From ${formatOhDate(from)}`;
}

/** ISO timestamps compare correctly as strings; missing dates sort last. */
export function newestFirst<T>(
  items: readonly T[],
  getDate: (item: T) => string | null | undefined,
): T[] {
  return [...items].sort((a, b) =>
    (getDate(b) ?? "").localeCompare(getDate(a) ?? ""),
  );
}

export function todayIsoDate(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function latestFitnessAssessment(
  assessments: FitnessAssessment[],
): FitnessAssessment | null {
  let latest: FitnessAssessment | null = null;
  for (const item of assessments) {
    if (!latest || item.assessed_at > latest.assessed_at) {
      latest = item;
    }
  }
  return latest;
}

export function isCertificateInForce(certificate: FitnessCertificate): boolean {
  return certificate.status === "issued" || certificate.status === "amended";
}

/** Most recently signed certificate that has not been withdrawn. */
export function currentFitnessCertificate(
  certificates: FitnessCertificate[],
): FitnessCertificate | null {
  let current: FitnessCertificate | null = null;
  for (const item of certificates) {
    if (!isCertificateInForce(item)) {
      continue;
    }
    if (!current || (item.signed_at ?? "") > (current.signed_at ?? "")) {
      current = item;
    }
  }
  return current;
}
