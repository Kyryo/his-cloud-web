import { describe, expect, it } from "vitest";

import {
  countActiveVisitFilters,
  DEFAULT_ACTIVE_VISIT_FILTERS,
} from "@/features/visits/utils/visit-list-filters";

describe("visit-list-filters", () => {
  it("counts a clinic filter as active", () => {
    expect(countActiveVisitFilters(DEFAULT_ACTIVE_VISIT_FILTERS)).toBe(0);
    expect(
      countActiveVisitFilters({
        clinicUuid: "clinic-uuid",
      }),
    ).toBe(1);
  });
});
