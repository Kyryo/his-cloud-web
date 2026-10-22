import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DentalHistoryTabPanel } from "@/features/clinical-dental/components/DentalHistoryTabPanel";
import type { DentalHistoryEncounter } from "@/features/clinical-dental/types/clinical-dental.types";

const state = vi.hoisted(() => ({ visits: [] as DentalHistoryEncounter[] }));

vi.mock("@/features/clinical-dental/hooks/use-clinical-dental", () => ({
  useDentalHistory: () => ({
    data: state.visits,
    isLoading: false,
    isError: false,
  }),
}));

afterEach(() => {
  cleanup();
  state.visits = [];
});

describe("DentalHistoryTabPanel", () => {
  it("lists earlier dental visits with findings and procedures", () => {
    state.visits = [
      {
        encounter_uuid: "enc-0",
        visit_uuid: "visit-0",
        visit_date: "2026-09-01T09:00:00Z",
        status: "completed",
        started_at: "2026-09-01T09:00:00Z",
        department_name: "Dental",
        clinic_name: "Main",
        clinician_name: "Dr Molar",
        chart_findings: [
          {
            uuid: "f-1",
            tooth_number: 26,
            surfaces: ["D"],
            condition: "caries",
            condition_display: "Caries",
            status: "resolved",
            notes: "",
            recorded_at: "2026-09-01T09:10:00Z",
            recorded_by_name: "Dr Molar",
            encounter_uuid: "enc-0",
            visit_uuid: "visit-0",
            visit_date: null,
            resolved_at: null,
            resolved_in_encounter_uuid: null,
          },
        ],
        procedures: [
          {
            uuid: "t-1",
            product_uuid: null,
            procedure_name: "Scaling",
            procedure_code: "",
            tooth_numbers: [],
            surfaces: [],
            treatment_status: "completed",
            treatment_date: "2026-09-01",
            notes: "",
            materials_used: "",
            diagnosis: "",
            performed_by_name: null,
            provider_name: "",
            actual_cost: null,
            visit_order_uuid: null,
            plan_item_uuid: null,
            encounter_uuid: "enc-0",
            created_at: "2026-09-01T09:30:00Z",
          },
        ],
      },
    ];
    render(<DentalHistoryTabPanel visitUuid="visit-1" encounterUuid="enc-1" isActive />);

    const visit = screen.getByTestId("dental-history-visit");
    expect(visit).toHaveTextContent("Dental · Main · Dr Molar");
    expect(visit).toHaveTextContent("Tooth 26 · Caries · D");
    expect(visit).toHaveTextContent("Scaling");
    expect(visit).toHaveTextContent("Whole mouth");
  });

  it("explains when there are no earlier dental visits", () => {
    render(<DentalHistoryTabPanel visitUuid="visit-1" encounterUuid="enc-1" isActive />);

    expect(screen.getByText("No earlier dental visits")).toBeInTheDocument();
  });
});
