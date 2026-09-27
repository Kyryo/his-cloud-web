import { describe, expect, it } from "vitest";

import type { EncounterClinicalOrder } from "@/features/clinical-opd/types/clinical-opd.types";
import {
  buildOpdActivityOrderStatusRows,
  formatOpdActivityOrderStatusLabel,
  opdActivityOrderStatusBadgeVariant,
} from "@/features/clinical-opd/utils/opd-activity-order-status";

function order(
  overrides: Partial<EncounterClinicalOrder> &
    Pick<EncounterClinicalOrder, "uuid" | "item_type" | "status">,
): EncounterClinicalOrder {
  return {
    item_type_display: overrides.item_type,
    description: "Hidden product name",
    clinical_quantity: "1",
    clinical_uom: "",
    charge_quantity: "1",
    quantity: "1",
    status_display: overrides.status,
    ordered_at: null,
    product: null,
    product_uuid: null,
    created_by_name: null,
    is_active: true,
    ...overrides,
  };
}

describe("buildOpdActivityOrderStatusRows", () => {
  it("returns empty when there are no orders", () => {
    expect(buildOpdActivityOrderStatusRows([])).toEqual([]);
  });

  it("uses lab LIS statuses for laboratory orders", () => {
    const rows = buildOpdActivityOrderStatusRows([
      order({
        uuid: "1",
        item_type: "LABORATORY",
        status: "ORDERED",
        lab_status: "IN_LAB",
        description: "CBC",
      }),
      order({
        uuid: "2",
        item_type: "LABORATORY",
        status: "ORDERED",
        lab_status: "PARTIAL",
        description: "Malaria smear",
      }),
      order({
        uuid: "3",
        item_type: "LABORATORY",
        status: "ORDERED",
        lab_status: "COMPLETED",
        description: "Glucose",
      }),
      order({
        uuid: "4",
        item_type: "LABORATORY",
        status: "ORDERED",
        lab_status: "COLLECTING",
        description: "UECs",
      }),
      order({
        uuid: "5",
        item_type: "RADIOLOGY",
        status: "ORDERED",
        description: "Chest X-ray",
      }),
    ]);

    expect(rows).toEqual([
      { key: "lab|collecting", label: "Lab orders", status: "collecting" },
      { key: "lab|in lab", label: "Lab orders", status: "in lab" },
      {
        key: "lab|partially submitted",
        label: "Lab orders",
        status: "partially submitted",
      },
      { key: "lab|released", label: "Lab orders", status: "released" },
      {
        key: "radiology|ordered",
        label: "Radiology orders",
        status: "ordered",
      },
    ]);
  });

  it("falls back to visit-order status when lab_status is missing", () => {
    const rows = buildOpdActivityOrderStatusRows([
      order({
        uuid: "1",
        item_type: "LABORATORY",
        status: "ORDERED",
        description: "CBC",
      }),
    ]);

    expect(rows).toEqual([
      { key: "lab|ordered", label: "Lab orders", status: "ordered" },
    ]);
  });

  it("shows referred status for cross-clinic lab referrals", () => {
    const rows = buildOpdActivityOrderStatusRows([
      order({
        uuid: "1",
        item_type: "LABORATORY",
        status: "REFERRED",
        lab_status: "CANCELLED",
        description: "CBC",
      }),
    ]);

    expect(rows).toEqual([
      { key: "lab|referred", label: "Lab orders", status: "referred" },
    ]);
  });
});

describe("opdActivityOrderStatusBadgeVariant", () => {
  it("maps workflow statuses to badge variants", () => {
    expect(opdActivityOrderStatusBadgeVariant("partially submitted")).toBe(
      "warning",
    );
    expect(opdActivityOrderStatusBadgeVariant("released")).toBe("success");
    expect(opdActivityOrderStatusBadgeVariant("cancelled")).toBe("destructive");
    expect(opdActivityOrderStatusBadgeVariant("ordered")).toBe("outline");
    expect(opdActivityOrderStatusBadgeVariant("in lab")).toBe("secondary");
  });

  it("title-cases status labels", () => {
    expect(formatOpdActivityOrderStatusLabel("in lab")).toBe("In lab");
    expect(formatOpdActivityOrderStatusLabel("partially submitted")).toBe(
      "Partially submitted",
    );
  });
});
