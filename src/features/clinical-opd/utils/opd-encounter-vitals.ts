import type { EncounterObservation } from "@/features/clinical-opd/types/clinical-opd.types";

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
  accentClassName: string;
};

export function buildOpdEncounterVitalStats(
  observations: EncounterObservation[],
): OpdEncounterVitalStat[] {
  return [
    {
      key: "weight",
      label: "Weight",
      value: getLatestVitalDisplayValue(observations, "weight"),
      accentClassName: "bg-indigo-500",
    },
    {
      key: "temperature",
      label: "Temperature",
      value: getLatestVitalDisplayValue(observations, "temperature"),
      accentClassName: "bg-amber-500",
    },
    {
      key: "heart-rate",
      label: "Heart rate",
      value: getLatestVitalDisplayValue(observations, "pulse"),
      accentClassName: "bg-rose-500",
    },
    {
      key: "blood-pressure",
      label: "Blood pressure",
      value: formatLatestBloodPressure(observations),
      accentClassName: "bg-blue-500",
    },
  ];
}
