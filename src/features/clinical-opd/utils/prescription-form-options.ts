export const PRESCRIPTION_FREQUENCY_OPTIONS = [
  "Once a day",
  "Twice a day",
  "Thrice a day",
  "Four times a day",
  "Five times a day",
  "Every hour",
  "Every 2 hours",
  "Every 3 hours",
  "Every 4 hours",
  "Every 6 hours",
  "Every 8 hours",
  "Every 12 hours",
  "Once a week",
  "Twice a week",
  "Four days a week",
  "Five days a week",
  "Six days a week",
  "Once a month",
  "Quarterly",
] as const;

export const PRESCRIPTION_ROUTE_OPTIONS = [
  "Oral",
  "Intramuscular",
  "Intravenous",
  "Per vaginal",
  "Sub cutaneous",
  "Per rectum",
  "Sub lingual",
  "Nasogastric",
  "Intradermal",
  "Intraperitoneal",
  "Intrathecal",
  "Intraosseous",
  "Topical",
  "Nasal",
  "Inhalation",
] as const;

export const PRESCRIPTION_DURATION_UNIT_OPTIONS = [
  "Day",
  "Weeks",
  "Months",
] as const;

export const PRESCRIPTION_UOM_OPTIONS = [
  "Tablet",
  "Capsule",
  "ml",
  "mg",
  "g",
  "mcg",
  "Drop",
  "Sachet",
  "Ampoule",
  "Vial",
  "Tube",
  "Application",
  "Puff",
  "Spray",
  "Patch",
  "Suppository",
  "IU",
] as const;

/** How many doses per day each frequency option represents. */
export const PRESCRIPTION_FREQUENCY_DOSES_PER_DAY: Record<
  (typeof PRESCRIPTION_FREQUENCY_OPTIONS)[number],
  number
> = {
  "Once a day": 1,
  "Twice a day": 2,
  "Thrice a day": 3,
  "Four times a day": 4,
  "Five times a day": 5,
  "Every hour": 24,
  "Every 2 hours": 12,
  "Every 3 hours": 8,
  "Every 4 hours": 6,
  "Every 6 hours": 4,
  "Every 8 hours": 3,
  "Every 12 hours": 2,
  "Once a week": 1 / 7,
  "Twice a week": 2 / 7,
  "Four days a week": 4 / 7,
  "Five days a week": 5 / 7,
  "Six days a week": 6 / 7,
  "Once a month": 1 / 30,
  Quarterly: 1 / 90,
};

export type PrescriptionFrequency =
  (typeof PRESCRIPTION_FREQUENCY_OPTIONS)[number];
export type PrescriptionRoute = (typeof PRESCRIPTION_ROUTE_OPTIONS)[number];
export type PrescriptionDurationUnit =
  (typeof PRESCRIPTION_DURATION_UNIT_OPTIONS)[number];
export type PrescriptionUom = (typeof PRESCRIPTION_UOM_OPTIONS)[number];

export function formatPrescriptionDuration(
  value: string | undefined,
  unit: string | undefined,
): string | undefined {
  const trimmedValue = value?.trim() ?? "";
  const trimmedUnit = unit?.trim() ?? "";
  if (!trimmedValue || !trimmedUnit) {
    return undefined;
  }
  return `${trimmedValue} ${trimmedUnit}`;
}

/** Leading numeric quantity from a dose string (e.g. "2" or "5ml" → 2 / 5). */
export function parsePrescriptionDoseQuantity(
  dose: string | undefined,
): number {
  const match = dose?.trim().match(/^(\d+(?:\.\d+)?)/);
  if (!match) {
    return 1;
  }
  return Number(match[1]);
}

export function prescriptionDurationToDays(
  value: string | undefined,
  unit: string | undefined,
): number | null {
  const amount = Number(value?.trim() ?? "");
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }
  const normalized = unit?.trim() ?? "";
  if (normalized === "Day") {
    return amount;
  }
  if (normalized === "Weeks") {
    return amount * 7;
  }
  if (normalized === "Months") {
    return amount * 30;
  }
  return null;
}

/**
 * Amount prescribed ≈ dose × doses/day × duration(days).
 * Returns null when frequency or duration cannot be interpreted.
 */
export function calculatePrescribedQuantity(input: {
  dose?: string;
  frequency?: string;
  durationValue?: string;
  durationUnit?: string;
}): number | null {
  const dosesPerDay =
    PRESCRIPTION_FREQUENCY_DOSES_PER_DAY[
      input.frequency as PrescriptionFrequency
    ];
  const days = prescriptionDurationToDays(
    input.durationValue,
    input.durationUnit,
  );
  if (dosesPerDay == null || days == null) {
    return null;
  }
  const total =
    parsePrescriptionDoseQuantity(input.dose) * dosesPerDay * days;
  if (!Number.isFinite(total) || total <= 0) {
    return null;
  }
  return Math.round(total * 100) / 100;
}
