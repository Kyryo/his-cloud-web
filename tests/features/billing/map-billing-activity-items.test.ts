import { describe, expect, it } from "vitest";

import { mapBillingActivityItems } from "@/features/billing/utils/map-billing-activity-items";

describe("mapBillingActivityItems", () => {
  it("maps billing activity records to timeline items", () => {
    const items = mapBillingActivityItems([
      {
        id: 1,
        uuid: "11111111-1111-1111-1111-111111111111",
        occurred_at: "2026-01-01T10:00:00Z",
        action: "INVOICE_CREATED",
        action_display: "Invoice created",
        summary: "Invoice created",
        details: { invoice_name: "INV/00002" },
        actor_name: "Jane Admin",
        actor_email: "jane@example.com",
        related_object_type: "sales.Invoice",
        related_object_id: "2",
        related_object_uuid: "",
      },
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe("Invoice created");
    expect(items[0]?.summary).toContain("INV/00002");
    expect(items[0]?.createdByName).toBe("Jane Admin");
    expect(items[0]?.groupKey).toBe("INVOICE_CREATED");
    expect(items[0]?.tone).toBe("info");
  });

  it("titles sales order line split, merge, and payability events", () => {
    const items = mapBillingActivityItems([
      "ORDER_LINES_MOVED",
      "ORDER_SPLIT_CREATED",
      "ORDER_LINES_MERGED",
      "ORDER_LINE_PAYABILITY_CHANGED",
    ].map((action, index) => ({
      id: index + 1,
      uuid: `00000000-0000-0000-0000-00000000000${index + 1}`,
      occurred_at: "2026-01-01T10:00:00Z",
      action,
      action_display: action,
      summary: action,
      details: {},
      actor_name: "",
      actor_email: "",
      related_object_type: "sales.SalesOrder",
      related_object_id: "81",
      related_object_uuid: "",
    })));

    expect(items.map((item) => item.title)).toEqual([
      "Lines moved to a new sales order",
      "Sales order created from another order",
      "Line items merged",
      "Line payability changed",
    ]);
  });
});
