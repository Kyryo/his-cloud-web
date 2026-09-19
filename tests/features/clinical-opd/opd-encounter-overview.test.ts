import { describe, expect, it } from "vitest";

import { selectRecentOpdTimelineEvents } from "@/features/clinical-opd/utils/opd-encounter-overview";

describe("opd-encounter-overview", () => {
  it("keeps the five most recent timeline events", () => {
    const events = [1, 2, 3, 4, 5, 6].map((hour) => ({
      type: "observation",
      occurred_at: `2026-09-18T${String(hour).padStart(2, "0")}:00:00Z`,
      summary: `Event ${hour}`,
      actor: "Nurse",
      object_uuid: `evt-${hour}`,
    }));

    expect(
      selectRecentOpdTimelineEvents(events).map((event) => event.summary),
    ).toEqual(["Event 6", "Event 5", "Event 4", "Event 3", "Event 2"]);
  });
});
