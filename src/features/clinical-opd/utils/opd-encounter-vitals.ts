import type { EncounterObservation } from "@/features/clinical-opd/types/clinical-opd.types";
import { formatVisitElapsed } from "@/features/customers/utils/format-visit-elapsed";

function getLatestObservation(
  observations: EncounterObservation[],
  code: string,
): EncounterObservation | null {
  return (
    observations
      .filter((observation) => observation.definition_code === code)
      .sort(
        (left, right) =>
          new Date(right.recorded_at).getTime() -
          new Date(left.recorded_at).getTime(),
      )[0] ?? null
  );
}

function formatObservationValue(observation: EncounterObservation | null): string | null {
  if (!observation) {
    return null;
  }

  const value = observation.numeric_value ?? observation.text_value;
  if (!value) {
    return null;
  }

  return observation.unit ? `${value} ${observation.unit}` : value;
}

function latestRecordedAt(
  ...observations: Array<EncounterObservation | null>
): string | null {
  let latest: EncounterObservation | null = null;

  for (const observation of observations) {
    if (!observation) {
      continue;
    }
    if (
      !latest ||
      new Date(observation.recorded_at).getTime() >
        new Date(latest.recorded_at).getTime()
    ) {
      latest = observation;
    }
  }

  return latest?.recorded_at ?? null;
}

export function getLatestVitalDisplayValue(
  observations: EncounterObservation[],
  code: string,
): string | null {
  return formatObservationValue(getLatestObservation(observations, code));
}

export function formatLatestBloodPressure(
  observations: EncounterObservation[],
): string | null {
  const systolic = getLatestObservation(observations, "bp_systolic");
  const diastolic = getLatestObservation(observations, "bp_diastolic");

  if (!systolic && !diastolic) {
    return null;
  }

  const systolicValue = systolic?.numeric_value ?? systolic?.text_value ?? "—";
  const diastolicValue = diastolic?.numeric_value ?? diastolic?.text_value ?? "—";

  return `${systolicValue}/${diastolicValue} mmHg`;
}

export type OpdVitalStatus = "normal" | "high" | "low" | "unknown";

export type OpdEncounterVitalStat = {
  key: string;
  label: string;
  value: string | null;
  recordedAt: string | null;
  status: OpdVitalStatus;
};

/**
 * Adult reference ranges. A reading outside its range is surfaced to the
 * clinician; anything without a range here reads as `unknown`.
 */
export const ADULT_VITAL_RANGES: Record<string, { low: number; high: number }> = {
  temperature: { low: 36.1, high: 37.5 },
  pulse: { low: 60, high: 100 },
  bp_systolic: { low: 90, high: 140 },
  bp_diastolic: { low: 60, high: 90 },
  respiratory_rate: { low: 12, high: 20 },
  spo2: { low: 95, high: 100 },
  pain_score: { low: 0, high: 10 },
};

export function getVitalRange(
  code: string,
): { low: number; high: number } | null {
  return ADULT_VITAL_RANGES[code] ?? null;
}

/** Human-readable range for form labels, e.g. "36.1–37.5°C" or "≥95%". */
export function formatVitalRangeHint(
  code: string,
  unitLabel: string = "",
): string | null {
  const range = getVitalRange(code);
  if (!range) {
    return null;
  }

  const unit = unitLabel.trim();
  const attachUnit = (value: string) => {
    if (!unit) return value;
    // Symbols stick to the number; word units get a space.
    if (/^[%°/]/.test(unit) || unit.startsWith("°")) {
      return `${value}${unit}`;
    }
    return `${value} ${unit}`;
  };

  // SpO2 is typically discussed as a floor rather than a tight band.
  if (code === "spo2") {
    return attachUnit(`≥${range.low}`);
  }

  return attachUnit(`${range.low}–${range.high}`);
}

export function statusForNumericValue(
  code: string,
  raw: string,
): OpdVitalStatus {
  const range = getVitalRange(code);
  const trimmed = raw.trim();
  if (!range || !trimmed) {
    return "unknown";
  }

  const value = Number(trimmed);
  if (!Number.isFinite(value)) {
    return "unknown";
  }
  if (value < range.low) {
    return "low";
  }
  if (value > range.high) {
    return "high";
  }
  return "normal";
}

function numericValue(observation: EncounterObservation | null): number | null {
  if (!observation) {
    return null;
  }

  const parsed = Number(observation.numeric_value ?? observation.text_value);
  return Number.isFinite(parsed) ? parsed : null;
}

function statusFor(
  observation: EncounterObservation | null,
  code: string,
): OpdVitalStatus {
  const range = ADULT_VITAL_RANGES[code];
  const value = numericValue(observation);

  if (!range || value === null) {
    return "unknown";
  }
  if (value < range.low) {
    return "low";
  }
  if (value > range.high) {
    return "high";
  }
  return "normal";
}

/** Blood pressure reads as abnormal when either component is out of range. */
function bloodPressureStatus(
  systolic: EncounterObservation | null,
  diastolic: EncounterObservation | null,
): OpdVitalStatus {
  const parts = [
    statusFor(systolic, "bp_systolic"),
    statusFor(diastolic, "bp_diastolic"),
  ];

  if (parts.includes("high")) {
    return "high";
  }
  if (parts.includes("low")) {
    return "low";
  }
  if (parts.includes("normal")) {
    return "normal";
  }
  return "unknown";
}

export function splitVitalDisplay(value: string | null): {
  amount: string;
  unit: string | null;
} {
  if (!value) {
    return { amount: "Not recorded", unit: null };
  }

  const match = value.trim().match(/^(.*)\s+(\S+)$/);
  if (!match) {
    return { amount: value, unit: null };
  }

  return { amount: match[1], unit: match[2] };
}

export function formatVitalRecordedLabel(
  recordedAt: string | null,
): string | null {
  if (!recordedAt) {
    return null;
  }

  const elapsed = formatVisitElapsed(recordedAt);
  if (!elapsed) {
    return null;
  }

  return elapsed === "Just now" ? elapsed : `${elapsed} ago`;
}

export function buildOpdEncounterVitalStats(
  observations: EncounterObservation[],
): OpdEncounterVitalStat[] {
  const weight = getLatestObservation(observations, "weight");
  const temperature = getLatestObservation(observations, "temperature");
  const pulse = getLatestObservation(observations, "pulse");
  const systolic = getLatestObservation(observations, "bp_systolic");
  const diastolic = getLatestObservation(observations, "bp_diastolic");

  // Ordered the way a clinician scans them: cardiovascular first, weight last.
  return [
    {
      key: "blood-pressure",
      label: "Blood pressure",
      value: formatLatestBloodPressure(observations),
      recordedAt: latestRecordedAt(systolic, diastolic),
      status: bloodPressureStatus(systolic, diastolic),
    },
    {
      key: "heart-rate",
      label: "Heart rate",
      value: formatObservationValue(pulse),
      recordedAt: latestRecordedAt(pulse),
      status: statusFor(pulse, "pulse"),
    },
    {
      key: "temperature",
      label: "Temperature",
      value: formatObservationValue(temperature),
      recordedAt: latestRecordedAt(temperature),
      status: statusFor(temperature, "temperature"),
    },
    {
      key: "weight",
      label: "Weight",
      value: formatObservationValue(weight),
      recordedAt: latestRecordedAt(weight),
      status: "unknown",
    },
  ];
}

const SET_EXTRA_CODES: Array<{ code: string; label: string }> = [
  { code: "respiratory_rate", label: "Resp. rate" },
  { code: "spo2", label: "SpO₂" },
  { code: "height", label: "Height" },
  { code: "blood_glucose", label: "Glucose" },
  { code: "pain_score", label: "Pain" },
];

/**
 * Primary strip vitals plus secondary readings for a single capture set.
 * Empty values are omitted so cards stay compact.
 */
export function buildVitalSetStats(
  observations: EncounterObservation[],
): OpdEncounterVitalStat[] {
  const primary = buildOpdEncounterVitalStats(observations).filter(
    (stat) => stat.value != null,
  );
  const extras: OpdEncounterVitalStat[] = [];

  for (const { code, label } of SET_EXTRA_CODES) {
    const observation = getLatestObservation(observations, code);
    const value = formatObservationValue(observation);
    if (!value) continue;
    extras.push({
      key: code,
      label,
      value,
      recordedAt: latestRecordedAt(observation),
      status: statusFor(observation, code),
    });
  }

  return [...primary, ...extras];
}

/** Observations recorded within this window are treated as one nurse capture. */
export const VITAL_SET_WINDOW_MS = 120_000;

export type OpdVitalSet = {
  id: string;
  recordedAt: string;
  recordedByName: string | null;
  observations: EncounterObservation[];
};

/**
 * Groups flat encounter observations into capture sets (newest first).
 * A new set starts when the gap from the previous reading exceeds the window.
 */
export function groupObservationsIntoVitalSets(
  observations: EncounterObservation[],
  windowMs: number = VITAL_SET_WINDOW_MS,
): OpdVitalSet[] {
  const sorted = [...observations]
    .filter((observation) => observation.definition_code !== "bmi")
    .sort(
      (left, right) =>
        new Date(right.recorded_at).getTime() -
        new Date(left.recorded_at).getTime(),
    );

  if (sorted.length === 0) {
    return [];
  }

  const sets: OpdVitalSet[] = [];
  let current: EncounterObservation[] = [sorted[0]];

  for (let index = 1; index < sorted.length; index += 1) {
    const observation = sorted[index];
    const previous = current[current.length - 1];
    const gap =
      new Date(previous.recorded_at).getTime() -
      new Date(observation.recorded_at).getTime();

    if (gap > windowMs) {
      sets.push(toVitalSet(current));
      current = [observation];
    } else {
      current.push(observation);
    }
  }

  sets.push(toVitalSet(current));
  return sets;
}

function toVitalSet(observations: EncounterObservation[]): OpdVitalSet {
  const newest = observations[0];
  return {
    id: newest.uuid,
    recordedAt: newest.recorded_at,
    recordedByName: newest.recorded_by_name,
    observations,
  };
}

/** Most recent moment any of the strip vitals were taken. */
export function latestVitalRecordedAt(
  stats: OpdEncounterVitalStat[],
): string | null {
  let latest: string | null = null;

  for (const stat of stats) {
    if (!stat.recordedAt) {
      continue;
    }
    if (!latest || new Date(stat.recordedAt).getTime() > new Date(latest).getTime()) {
      latest = stat.recordedAt;
    }
  }

  return latest;
}