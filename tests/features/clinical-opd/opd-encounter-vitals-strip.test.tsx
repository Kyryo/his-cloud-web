import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { OpdEncounterVitalsStatsStrip } from "@/features/clinical-opd/components/detail/OpdEncounterVitalsStatsStrip";
import type { EncounterObservation } from "@/features/clinical-opd/types/clinical-opd.types";

function observation(
  code: string,
  value: string,
  unit: string,
): EncounterObservation {
  return {
    uuid: `obs-${code}`,
    definition_code: code,
    definition_name: code,
    numeric_value: value,
    text_value: "",
    unit,
    recorded_at: "2026-09-02T09:05:00Z",
    recorded_by_name: "Nurse",
  };
}

afterEach(() => {
  cleanup();
});

describe("OpdEncounterVitalsStatsStrip", () => {
  it("shows every vital with its label", () => {
    render(
      <OpdEncounterVitalsStatsStrip
        observations={[observation("pulse", "82", "bpm")]}
      />,
    );

    expect(screen.getByText("Blood pressure")).toBeInTheDocument();
    expect(screen.getByText("Heart rate")).toBeInTheDocument();
    expect(screen.getByText("Temperature")).toBeInTheDocument();
    expect(screen.getByText("Weight")).toBeInTheDocument();
    expect(screen.getByText("82")).toBeInTheDocument();
  });

  it("flags an out-of-range reading with a direction indicator", () => {
    render(
      <OpdEncounterVitalsStatsStrip
        observations={[
          observation("pulse", "124", "bpm"),
          observation("temperature", "35.0", "C"),
        ]}
      />,
    );

    expect(screen.getByLabelText("Above expected range")).toBeInTheDocument();
    expect(screen.getByLabelText("Below expected range")).toBeInTheDocument();
  });

  it("leaves an in-range reading unflagged", () => {
    render(
      <OpdEncounterVitalsStatsStrip
        observations={[observation("pulse", "82", "bpm")]}
      />,
    );

    expect(screen.queryByLabelText("Above expected range")).toBeNull();
    expect(screen.queryByLabelText("Below expected range")).toBeNull();
  });

  it("reports when the vitals were taken", () => {
    render(
      <OpdEncounterVitalsStatsStrip
        observations={[observation("pulse", "82", "bpm")]}
      />,
    );

    expect(
      screen.getByTestId("opd-encounter-vitals-taken-at"),
    ).toBeInTheDocument();
  });

  it("renders nothing about timing when no vitals are recorded", () => {
    render(<OpdEncounterVitalsStatsStrip observations={[]} />);

    expect(screen.queryByTestId("opd-encounter-vitals-taken-at")).toBeNull();
    expect(screen.getAllByText("—")).toHaveLength(4);
  });
});
