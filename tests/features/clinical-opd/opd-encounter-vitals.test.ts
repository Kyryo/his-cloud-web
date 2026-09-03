import { describe, expect, it } from "vitest";

import {
  buildOpdEncounterVitalStats,
  formatLatestBloodPressure,
  getLatestVitalDisplayValue,
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

  it("builds compact physician vital stats", () => {
    const stats = buildOpdEncounterVitalStats(observations);
    expect(stats.map((stat) => stat.label)).toEqual([
      "Weight",
      "Temperature",
      "Heart rate",
      "Blood pressure",
    ]);
    expect(stats[3].value).toBe("120/80 mmHg");
  });
});
