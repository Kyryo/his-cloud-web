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
  });
});
