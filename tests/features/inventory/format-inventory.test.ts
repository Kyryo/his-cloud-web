import { describe, expect, it } from "vitest";

import {
  formatDisplayDate,
  formatDisplayDateTime,
  formatDocumentTypeLabel,
  formatInternalOrderStatusLabel,
  formatInventoryAmount,
  formatPurchaseStatusLabel,
  formatStockAdjustmentStatusLabel,
} from "@/features/inventory/utils/format-inventory";
import { buildInventoryQuery } from "@/features/inventory/utils/inventory-query";

describe("format-inventory", () => {
  it("formats purchase status labels", () => {
    expect(formatPurchaseStatusLabel("DRAFT")).toBe("Draft");
    expect(formatPurchaseStatusLabel("CONFIRMED")).toBe("Confirmed");
  });

  it("formats internal order status labels", () => {
    expect(formatInternalOrderStatusLabel("DISPATCHED")).toBe("Dispatched");
    expect(formatInternalOrderStatusLabel("RECEIVED")).toBe("Received");
  });

  it("formats stock adjustment status labels", () => {
    expect(formatStockAdjustmentStatusLabel("APPLIED")).toBe("Applied");
  });

  it("formats document type labels", () => {
    expect(formatDocumentTypeLabel("PURCHASE_ORDER")).toBe("Purchase order");
  });

  it("formats inventory amounts", () => {
    expect(formatInventoryAmount("1250.5", "KES")).toContain("KES");
    expect(formatInventoryAmount(null)).toBe("—");
  });

  it("formats date-only values without inventing a local clock time", () => {
    expect(formatDisplayDate("2026-07-19")).toMatch(/Jul/);
    expect(formatDisplayDateTime("2026-07-19")).toBe(formatDisplayDate("2026-07-19"));
    expect(formatDisplayDateTime("2026-07-19")).not.toMatch(/02:00|2:00/);
  });

  it("formats full timestamps with local clock time", () => {
    const formatted = formatDisplayDateTime("2026-07-19T14:35:00Z");
    expect(formatted).toMatch(/Jul/);
    expect(formatted).toMatch(/\d/);
  });
});

describe("inventory-query", () => {
  it("builds query strings from filters", () => {
    expect(
      buildInventoryQuery({
        page: 2,
        pageSize: 50,
        search: "PO-001",
        status: "SUBMITTED",
        receiving_location: 4,
      }),
    ).toBe("?page=2&page_size=50&search=PO-001&status=SUBMITTED&receiving_location=4");
  });

  it("returns empty string when no filters are provided", () => {
    expect(buildInventoryQuery({})).toBe("");
  });
});
