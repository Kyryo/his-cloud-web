import { describe, expect, it } from "vitest";

import { opdEncounterFromVisit } from "@/features/clinical-opd/utils/opd-encounter-from-visit";
import type { VisitDetail } from "@/features/visits/types/visit.types";

const visit = {
  uuid: "visit-1",
  status: "completed",
  customer: "cust-1",
  customer_name: "Jane Doe",
  customer_identifier: "MRN-1",
  clinic_name: "City Clinic",
  mode_of_payment: "cash",
  insurance_scheme_name: null,
  encounters: [
    {
      uuid: "enc-1",
      department_name: "OPD",
      status: "completed",
      started_at: "2026-09-18T10:00:00Z",
    },
  ],
} as unknown as VisitDetail;

describe("opdEncounterFromVisit", () => {
  it("loads a completed encounter from the visit when it is not on the queue", () => {
    const encounter = opdEncounterFromVisit(visit, "enc-1");

    expect(encounter).toMatchObject({
      encounter_uuid: "enc-1",
      visit_uuid: "visit-1",
      customer_name: "Jane Doe",
      status: "completed",
      queue_stage: null,
    });
  });
});
