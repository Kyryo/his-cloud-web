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

export type OpdEncounterVitalStat = {
  key: string;
  label: string;
  value: string | null;
  recordedAt: string | null;
  accentClassName: string;
};

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

  return [
    {
      key: "weight",
      label: "Weight",
      value: formatObservationValue(weight),
      recordedAt: latestRecordedAt(weight),
      accentClassName: "bg-indigo-500",
    },
    {
      key: "temperature",
      label: "Temperature",
      value: formatObservationValue(temperature),
      recordedAt: latestRecordedAt(temperature),
      accentClassName: "bg-amber-500",
    },
    {
      key: "heart-rate",
      label: "Heart rate",
      value: formatObservationValue(pulse),
      recordedAt: latestRecordedAt(pulse),
      accentClassName: "bg-rose-500",
    },
    {
      key: "blood-pressure",
      label: "Blood pressure",
      value: formatLatestBloodPressure(observations),
      recordedAt: latestRecordedAt(systolic, diastolic),
      accentClassName: "bg-blue-500",
    },
  ];
}