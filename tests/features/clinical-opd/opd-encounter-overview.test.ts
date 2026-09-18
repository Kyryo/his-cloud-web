import { describe, expect, it } from "vitest";

import {
  buildOpdOverviewContinueActions,
  buildOpdOverviewWorkItems,
  selectRecentOpdTimelineEvents,
} from "@/features/clinical-opd/utils/opd-encounter-overview";

describe("opd-encounter-overview", () => {
  it("builds work counts for visible tabs only", () => {
    expect(
      buildOpdOverviewWorkItems({
        observations: [
          {
            uuid: "obs-1",
            definition_code: "weight",
            definition_name: "Weight",
            numeric_value: "72",
            text_value: "",
            unit: "kg",
            recorded_at: "2026-09-18T10:00:00Z",
            recorded_by_name: "Nurse",
          },
        ],
        orders: [
          {
            uuid: "ord-1",
            item_type: "laboratory",
            item_type_display: "Laboratory",
            description: "FBC",
            clinical_quantity: "1",
            clinical_uom: "test",
            charge_quantity: "1",
            quantity: "1",
            status: "ORDERED",
            status_display: "Ordered",
            ordered_at: "2026-09-18T10:05:00Z",
            product: 1,
            product_uuid: "prod-1",
            created_by_name: "Dr. Banda",
            is_active: true,
          },
          {
            uuid: "ord-2",
            item_type: "laboratory",
            item_type_display: "Laboratory",
            description: "Cancelled",
            clinical_quantity: "1",
            clinical_uom: "test",
            charge_quantity: "1",
            quantity: "1",
            status: "CANCELLED",
            status_display: "Cancelled",
            ordered_at: "2026-09-18T10:06:00Z",
            product: 2,
            product_uuid: "prod-2",
            created_by_name: "Dr. Banda",
            is_active: false,
          },
        ],
        visibleTabIds: ["overview", "vital-signs", "orders"],
      }),
    ).toEqual([
      { key: "vital-signs", label: "Vitals", count: 1 },
      { key: "orders", label: "Orders", count: 1 },
    ]);
  });

  it("offers role-aware continue actions", () => {
    expect(
      buildOpdOverviewContinueActions({
        visitUuid: "visit-1",
        encounterUuid: "enc-1",
        visibleTabIds: ["overview", "vital-signs", "physical-examination"],
        capabilities: ["record_vitals", "record_physical_exam"],
        userRole: "physician",
      }).map((action) => action.href),
    ).toEqual([
      "/clinical/opd/visit-1/enc-1/vital-signs",
      "/clinical/opd/visit-1/enc-1/physical-examination",
    ]);
  });

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
