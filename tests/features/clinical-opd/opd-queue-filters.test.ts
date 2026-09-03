import { describe, expect, it } from "vitest";

import type { OpdQueueEncounter } from "@/features/clinical-opd/types/clinical-opd.types";
import {
  filterOpdQueueEncounters,
} from "@/features/clinical-opd/utils/opd-queue-list-filters";
import { computeOpdQueueStats } from "@/features/clinical-opd/utils/opd-queue-stats";

const sampleEncounters: OpdQueueEncounter[] = [
  {
    encounter_uuid: "enc-1",
    visit_uuid: "visit-1",
    customer_uuid: "cust-1",
    customer_name: "Jane Doe",
    department_name: "General OPD",
    status: "waiting",
    started_at: null,
    mode_of_payment: "cash",
    insurance_scheme_name: null,
  },
  {
    encounter_uuid: "enc-2",
    visit_uuid: "visit-2",
    customer_uuid: "cust-2",
    customer_name: "John Smith",
    department_name: "Specialist OPD",
    status: "in_progress",
    started_at: "2026-09-02T10:00:00Z",
    mode_of_payment: "insurance",
    insurance_scheme_name: "MASM Essential",
  },
];

describe("opd-queue-list-filters", () => {
  it("filters by search term and status", () => {
    expect(
      filterOpdQueueEncounters(sampleEncounters, "jane", {
        status: "all",
      }),
    ).toHaveLength(1);

    expect(
      filterOpdQueueEncounters(sampleEncounters, "", {
        status: "in_progress",
      }),
    ).toHaveLength(1);
  });
});

describe("opd-queue-stats", () => {
  it("computes queue summary counts", () => {
    expect(computeOpdQueueStats(sampleEncounters)).toEqual({
      total: 2,
      waiting: 1,
      in_progress: 1,
      completed: 0,
    });
  });
});
