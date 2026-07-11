import { describe, expect, it } from "vitest";

import type { VisitEncounter } from "@/features/visits/types/visit.types";
import {
  encounterHasRecordedProgress,
  getOpenEncounters,
  predictEncounterCloseAction,
} from "@/features/visits/utils/visit-encounter-close";

function encounter(
  partial: Partial<VisitEncounter> & Pick<VisitEncounter, "uuid">,
): VisitEncounter {
  return {
    id: 1,
    visit: "visit-1",
    department: "dept-1",
    department_name: "OPD",
    department_type: "opd",
    location: null,
    location_name: null,
    clinician: null,
    clinician_name: null,
    status: "waiting",
    started_at: null,
    ended_at: null,
    notes: "",
    is_active: true,
    created_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...partial,
  };
}

describe("visit-encounter-close", () => {
  it("finds open encounters", () => {
    const encounters = [
      encounter({ uuid: "a", status: "waiting" }),
      encounter({ uuid: "b", status: "completed" }),
      encounter({ uuid: "c", status: "in_progress" }),
    ];

    expect(getOpenEncounters(encounters)).toHaveLength(2);
  });

  it("predicts complete when progress exists", () => {
    expect(
      predictEncounterCloseAction(
        encounter({ uuid: "a", status: "in_progress" }),
      ),
    ).toBe("complete");
    expect(
      predictEncounterCloseAction(
        encounter({ uuid: "b", notes: "Reviewed patient" }),
      ),
    ).toBe("complete");
    expect(
      predictEncounterCloseAction(encounter({ uuid: "c", clinician: 9 })),
    ).toBe("complete");
  });

  it("predicts cancel for untouched waiting encounters", () => {
    expect(
      predictEncounterCloseAction(encounter({ uuid: "a", status: "waiting" })),
    ).toBe("cancel");
    expect(
      encounterHasRecordedProgress(encounter({ uuid: "a", status: "waiting" })),
    ).toBe(false);
  });
});
