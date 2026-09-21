import { describe, expect, it } from "vitest";

import type { OpdQueueEncounter } from "@/features/clinical-opd/types/clinical-opd.types";
import { computeOpdQueueStats } from "@/features/clinical-opd/utils/opd-queue-stats";
import {
  formatAllergySeverity,
  formatOpdQueueClientMeta,
  formatQueueVitalsSnapshot,
  formatWaitingMinutes,
  groupOpdQueueByStage,
  resolveOpdQueueStage,
} from "@/features/clinical-opd/utils/opd-queue-stage";

const sampleEncounters: OpdQueueEncounter[] = [
  {
    encounter_uuid: "enc-1",
    visit_uuid: "visit-1",
    visit_status: "active",
    customer_uuid: "cust-1",
    customer_name: "Jane Doe",
    department_name: "General OPD",
    status: "waiting",
    started_at: null,
    mode_of_payment: "cash",
    insurance_scheme_name: null,
    queue_stage: "registered",
    waiting_minutes: 12,
    latest_vitals: [],
    allergy_count: 0,
  },
  {
    encounter_uuid: "enc-2",
    visit_uuid: "visit-2",
    visit_status: "active",
    customer_uuid: "cust-2",
    customer_name: "John Smith",
    department_name: "Specialist OPD",
    status: "waiting",
    started_at: "2026-09-02T10:00:00Z",
    mode_of_payment: "insurance",
    insurance_scheme_name: "MASM Essential",
    queue_stage: "triaged",
    triaged_at: "2026-09-02T10:05:00Z",
    waiting_minutes: 8,
    latest_vitals: [
      {
        code: "temp",
        name: "Temperature",
        numeric_value: "36.8",
        text_value: "36.8",
        unit: "C",
      },
    ],
    allergy_count: 1,
    highest_allergy_severity: "severe",
  },
  {
    encounter_uuid: "enc-3",
    visit_uuid: "visit-3",
    visit_status: "active",
    customer_uuid: "cust-3",
    customer_name: "Amina Banda",
    department_name: "General OPD",
    status: "in_progress",
    started_at: "2026-09-02T10:20:00Z",
    mode_of_payment: "cash",
    insurance_scheme_name: null,
    queue_stage: "with_clinician",
  },
];

describe("opd-queue-stats", () => {
  it("counts by queue stage", () => {
    expect(computeOpdQueueStats(sampleEncounters)).toEqual({
      total: 3,
      registered: 1,
      triaged: 1,
      with_clinician: 1,
      completed: 0,
    });
  });
});

describe("opd-queue-stage", () => {
  it("never invents a triaged encounter status", () => {
    expect(
      resolveOpdQueueStage({
        status: "waiting",
        queue_stage: null,
        triaged_at: "2026-09-18T10:00:00Z",
      }),
    ).toBe("triaged");
    expect(
      resolveOpdQueueStage({
        status: "waiting",
        queue_stage: "registered",
        triaged_at: null,
      }),
    ).toBe("registered");
  });

  it("formats wait, vitals, and allergy row fields", () => {
    expect(formatWaitingMinutes(12)).toBe("12 min");
    expect(formatWaitingMinutes(60)).toBe("1 hr");
    expect(formatWaitingMinutes(75)).toBe("1 hr 15 min");
    expect(formatWaitingMinutes(60 * 24)).toBe("1 day");
    expect(formatWaitingMinutes(60 * 24 * 45)).toBe("1 mo");
    expect(formatWaitingMinutes(60 * 24 * 30 * 14)).toBe("1 yr");
    expect(
      formatQueueVitalsSnapshot([
        {
          code: "temp",
          name: "Temperature",
          numeric_value: "36.8",
          text_value: "36.8",
          unit: "C",
        },
      ]),
    ).toBe("36.8 C");
    expect(formatAllergySeverity("life_threatening", 2)).toBe(
      "life threatening · 2",
    );
  });

  it("formats client meta as ID · age · gender", () => {
    expect(
      formatOpdQueueClientMeta({
        customer_identifier: "CLI-1",
        customer_dob: "1990-01-15",
        customer_gender: "Female",
      }),
    ).toMatch(/^CLI-1 · .+ · Female$/);
  });

  it("groups encounters by queue stage and hides empty closed stages", () => {
    const groups = groupOpdQueueByStage(sampleEncounters);
    expect(groups.map((group) => group.stage)).toEqual([
      "registered",
      "triaged",
      "with_clinician",
    ]);
    expect(groups[0]?.encounters.map((item) => item.customer_name)).toEqual([
      "Jane Doe",
    ]);
    expect(groups[1]?.encounters.map((item) => item.customer_name)).toEqual([
      "John Smith",
    ]);
    expect(groups[2]?.encounters.map((item) => item.customer_name)).toEqual([
      "Amina Banda",
    ]);
  });
});