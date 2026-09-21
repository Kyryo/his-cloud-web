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
const ADULT_VITAL_RANGES: Record<string, { low: number; high: number }> = {
  temperature: { low: 36.1, high: 37.5 },
  pulse: { low: 60, high: 100 },
  bp_systolic: { low: 90, high: 140 },
  bp_diastolic: { low: 60, high: 90 },
  respiratory_rate: { low: 12, high: 20 },
  spo2: { low: 95, high: 100 },
};

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