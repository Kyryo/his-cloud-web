import { describe, expect, it } from "vitest";

import {
  buildOpdEncounterVitalStats,
  formatLatestBloodPressure,
  getLatestVitalDisplayValue,
  latestVitalRecordedAt,
  splitVitalDisplay,
} from "@/features/clinical-opd/utils/opd-encounter-vitals";
import type { EncounterObservation } from "@/features/clinical-opd/types/clinical-opd.types";

const observations: EncounterObservation[] = [
  {
    uuid: "obs-1",
    definition_code: "weight",
    definition_name: "Weight",
    numeric_value: "72.5",
    text_value: "",
    unit: "kg",
    recorded_at: "2026-09-02T09:00:00Z",
    recorded_by_name: "Nurse",
  },
  {
    uuid: "obs-2",
    definition_code: "temperature",
    definition_name: "Temperature",
    numeric_value: "37.1",
    text_value: "",
    unit: "C",
    recorded_at: "2026-09-02T09:05:00Z",
    recorded_by_name: "Nurse",
  },
  {
    uuid: "obs-3",
    definition_code: "pulse",
    definition_name: "Pulse",
    numeric_value: "82",
    text_value: "",
    unit: "bpm",
    recorded_at: "2026-09-02T09:05:00Z",
    recorded_by_name: "Nurse",
  },
  {
    uuid: "obs-4",
    definition_code: "bp_systolic",
    definition_name: "Blood pressure (systolic)",
    numeric_value: "120",
    text_value: "",
    unit: "mmHg",
    recorded_at: "2026-09-02T09:05:00Z",
    recorded_by_name: "Nurse",
  },
  {
    uuid: "obs-5",
    definition_code: "bp_diastolic",
    definition_name: "Blood pressure (diastolic)",
    numeric_value: "80",
    text_value: "",
    unit: "mmHg",
    recorded_at: "2026-09-02T09:05:00Z",
    recorded_by_name: "Nurse",
  },
];

describe("opd-encounter-vitals", () => {
  it("formats latest vital values", () => {
    expect(getLatestVitalDisplayValue(observations, "weight")).toBe("72.5 kg");
    expect(getLatestVitalDisplayValue(observations, "temperature")).toBe("37.1 C");
    expect(getLatestVitalDisplayValue(observations, "pulse")).toBe("82 bpm");
    expect(formatLatestBloodPressure(observations)).toBe("120/80 mmHg");
  });

  it("builds compact physician vital stats in scan order", () => {
    const stats = buildOpdEncounterVitalStats(observations);
    expect(stats.map((stat) => stat.label)).toEqual([
      "Blood pressure",
      "Heart rate",
      "Temperature",
      "Weight",
    ]);
    expect(stats[0].value).toBe("120/80 mmHg");
  });

  it("reports when each stat was recorded", () => {
    const stats = buildOpdEncounterVitalStats(observations);

    expect(stats[0].recordedAt).toBe("2026-09-02T09:05:00Z");
    expect(stats[3].recordedAt).toBe("2026-09-02T09:00:00Z");
  });

  it("reports the most recent time any strip vital was taken", () => {
    expect(
      latestVitalRecordedAt(buildOpdEncounterVitalStats(observations)),
    ).toBe("2026-09-02T09:05:00Z");
    expect(latestVitalRecordedAt(buildOpdEncounterVitalStats([]))).toBeNull();
  });

  it("marks in-range readings as normal", () => {
    const stats = buildOpdEncounterVitalStats(observations);

    expect(stats.map((stat) => stat.status)).toEqual([
      "normal",
      "normal",
      "normal",
      // Weight has no reference range to compare against.
      "unknown",
    ]);
  });

  it("flags readings outside the adult reference range", () => {
    const abnormal = observations.map((observation) => {
      if (observation.definition_code === "pulse") {
        return { ...observation, numeric_value: "124" };
      }
      if (observation.definition_code === "temperature") {
        return { ...observation, numeric_value: "35.2" };
      }
      if (observation.definition_code === "bp_systolic") {
        return { ...observation, numeric_value: "165" };
      }
      return observation;
    });

    const byKey = new Map(
      buildOpdEncounterVitalStats(abnormal).map((stat) => [stat.key, stat.status]),
    );

    expect(byKey.get("blood-pressure")).toBe("high");
    expect(byKey.get("heart-rate")).toBe("high");
    expect(byKey.get("temperature")).toBe("low");
  });

  it("leaves missing vitals empty and unflagged", () => {
    const stats = buildOpdEncounterVitalStats([]);

    expect(stats.every((stat) => stat.value === null)).toBe(true);
    expect(stats.every((stat) => stat.recordedAt === null)).toBe(true);
    expect(stats.every((stat) => stat.status === "unknown")).toBe(true);
  });

  it("splits a vital amount from its unit", () => {
    expect(splitVitalDisplay("72.5 kg")).toEqual({
      amount: "72.5",
      unit: "kg",
    });
    expect(splitVitalDisplay("120/80 mmHg")).toEqual({
      amount: "120/80",
      unit: "mmHg",
    });
    expect(splitVitalDisplay(null)).toEqual({
      amount: "Not recorded",
      unit: null,
    });
  });
});
