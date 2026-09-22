import { describe, expect, it } from "vitest";

import type { EncounterLabResult } from "@/features/clinical-opd/types/clinical-opd.types";
import {
  groupEncounterLabResults,
  labResultGroupToVitalReadings,
} from "@/features/clinical-opd/utils/opd-lab-result-readings";

describe("groupEncounterLabResults", () => {
  it("groups panel tests under the ordered product title", () => {
    const results: EncounterLabResult[] = [
      {
        order_uuid: "o1",
        item_uuid: "i-hct",
        visit_order_uuid: "vo-fbc",
        ordered_name: "Full blood count",
        panel_uuid: "panel-1",
        panel_code: "FBC",
        panel_name: "Full blood count",
        test_code: "HCT",
        test_name: "Hematocrit",
        released_at: "2026-09-22T10:00:00Z",
        released_by_name: "Lab Tech",
        analytes: [
          {
            code: "HCT",
            name: "Hematocrit",
            value_text: "",
            value_numeric: "42",
            unit: "%",
            flag: "NORMAL",
          },
        ],
      },
      {
        order_uuid: "o1",
        item_uuid: "i-hgb",
        visit_order_uuid: "vo-fbc",
        ordered_name: "Full blood count",
        panel_uuid: "panel-1",
        panel_code: "FBC",
        panel_name: "Full blood count",
        test_code: "HGB",
        test_name: "Hemoglobin",
        released_at: "2026-09-22T10:05:00Z",
        released_by_name: "Lab Supervisor",
        analytes: [
          {
            code: "HGB",
            name: "Hemoglobin",
            value_text: "",
            value_numeric: "13.2",
            unit: "g/dL",
            flag: "NORMAL",
          },
        ],
      },
    ];

    const groups = groupEncounterLabResults(results);
    expect(groups).toHaveLength(1);
    expect(groups[0].title).toBe("Full blood count");
    expect(groups[0].results).toHaveLength(2);
    expect(groups[0].releasedByName).toBe("Lab Supervisor");

    const readings = labResultGroupToVitalReadings(groups[0]);
    expect(readings.map((row) => row.label)).toEqual([
      "Hematocrit",
      "Hemoglobin",
    ]);
    expect(readings[0].value).toBe("42 %");
    expect(readings[1].value).toBe("13.2 g/dL");
  });

  it("keeps standalone ordered tests in their own group", () => {
    const results: EncounterLabResult[] = [
      {
        order_uuid: "o1",
        item_uuid: "i-glu",
        visit_order_uuid: "vo-glu",
        ordered_name: "Blood glucose",
        panel_uuid: null,
        panel_code: null,
        panel_name: null,
        test_code: "GLU",
        test_name: "Blood glucose",
        released_at: "2026-09-22T11:00:00Z",
        analytes: [
          {
            code: "GLU",
            name: "Glucose",
            value_text: "",
            value_numeric: "5.1",
            unit: "mmol/L",
            flag: "NORMAL",
          },
        ],
      },
    ];

    const groups = groupEncounterLabResults(results);
    expect(groups).toHaveLength(1);
    expect(groups[0].title).toBe("Blood glucose");
    expect(labResultGroupToVitalReadings(groups[0])[0].label).toBe(
      "Blood glucose",
    );
  });
});
