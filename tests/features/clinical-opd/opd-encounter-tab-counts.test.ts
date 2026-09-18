import { describe, expect, it } from "vitest";

import { buildOpdEncounterTabCounts } from "@/features/clinical-opd/utils/opd-encounter-tab-counts";
import type {
  EncounterClinicalOrder,
  EncounterObservation,
  EncounterPrescription,
} from "@/features/clinical-opd/types/clinical-opd.types";

function observation(uuid: string): EncounterObservation {
  return {
    uuid,
    definition_code: "weight",
    definition_name: "Weight",
    numeric_value: "70",
    text_value: "",
    unit: "kg",
    recorded_at: "2026-09-02T09:00:00Z",
    recorded_by_name: "Nurse",
  };
}

function order(
  uuid: string,
  overrides: Partial<EncounterClinicalOrder> = {},
): EncounterClinicalOrder {
  return {
    uuid,
    item_type: "LABORATORY",
    item_type_display: "Laboratory",
    description: "CBC",
    clinical_quantity: "1",
    clinical_uom: "Test",
    charge_quantity: "1",
    quantity: "1",
    status: "ORDERED",
    status_display: "Ordered",
    ordered_at: "2026-09-02T09:10:00Z",
    product: 1,
    product_uuid: "prod-1",
    created_by_name: "Dr. Ada",
    is_active: true,
    ...overrides,
  };
}

function prescription(
  uuid: string,
  status = "draft",
): EncounterPrescription {
  return {
    uuid,
    product_uuid: "prod-2",
    product_name: "Paracetamol",
    dose: "500mg",
    route: "PO",
    frequency: "TDS",
    duration: "5 days",
    quantity: "15",
    clinical_uom: "Tablet",
    charge_quantity: "15",
    instructions: "",
    is_prn: false,
    clinical_notes: "",
    status,
    visit_order_uuid: null,
    prescribed_by_name: "Dr. Ada",
  };
}

describe("buildOpdEncounterTabCounts", () => {
  it("counts records the tabs actually list", () => {
    const counts = buildOpdEncounterTabCounts({
      observations: [observation("obs-1"), observation("obs-2")],
      orders: [order("order-1"), order("order-2")],
      prescriptions: [prescription("rx-1")],
    });

    expect(counts).toEqual({
      "vital-signs": 2,
      orders: 2,
      medications: 1,
    });
  });

  it("excludes cancelled and inactive records", () => {
    const counts = buildOpdEncounterTabCounts({
      orders: [
        order("order-1", { status: "CANCELLED" }),
        order("order-2", { is_active: false }),
      ],
      prescriptions: [prescription("rx-1", "cancelled")],
    });

    expect(counts).toEqual({});
  });

  it("omits counts while data is still loading", () => {
    expect(buildOpdEncounterTabCounts({})).toEqual({});
  });
});
