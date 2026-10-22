import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DentalChart } from "@/features/clinical-dental/components/DentalChart";
import type { DentalChartFinding } from "@/features/clinical-dental/types/clinical-dental.types";
import { dentalArches, toothName } from "@/features/clinical-dental/utils/dental-arches";
import type { DentitionMode } from "@/features/dental/lib/dental-dentition";

function finding(overrides: Partial<DentalChartFinding>): DentalChartFinding {
  return {
    uuid: "f-1",
    tooth_number: 36,
    surfaces: [],
    condition: "caries",
    condition_display: "Caries",
    status: "active",
    notes: "",
    recorded_at: "2026-10-01T09:00:00Z",
    recorded_by_name: "Dr Molar",
    encounter_uuid: "enc-1",
    visit_uuid: "visit-1",
    visit_date: "2026-10-01T09:00:00Z",
    resolved_at: null,
    resolved_in_encounter_uuid: null,
    ...overrides,
  };
}

function ChartHarness({
  findings,
  onSelect,
}: {
  findings: DentalChartFinding[];
  onSelect: (tooth: number) => void;
}) {
  const [mode, setMode] = useState<DentitionMode>("adult");
  return (
    <DentalChart
      findings={findings}
      mode={mode}
      onModeChange={setMode}
      selectedTooth={null}
      onSelectTooth={onSelect}
    />
  );
}

afterEach(() => {
  cleanup();
});

describe("DentalChart", () => {
  it("renders 32 permanent teeth in FDI order facing the patient", () => {
    render(<ChartHarness findings={[]} onSelect={vi.fn()} />);

    const upper = screen.getByRole("group", { name: "Upper arch" });
    const teeth = Array.from(upper.querySelectorAll("button")).map((button) =>
      Number(button.textContent?.match(/^\d+/)?.[0]),
    );
    expect(teeth).toEqual(dentalArches("adult").upper);
    expect(teeth[0]).toBe(18);
    expect(teeth[15]).toBe(28);
    expect(screen.getAllByTestId(/^dental-tooth-/)).toHaveLength(32);
  });

  it("switches to the 20 primary teeth", () => {
    render(<ChartHarness findings={[]} onSelect={vi.fn()} />);

    fireEvent.click(screen.getByTestId("dental-chart-mode-children"));

    expect(screen.getAllByTestId(/^dental-tooth-/)).toHaveLength(20);
    expect(screen.getByTestId("dental-tooth-55")).toBeInTheDocument();
    expect(screen.getByTestId("dental-chart-mode-children")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("colours teeth by their highest-priority condition and lists surfaces", () => {
    render(
      <ChartHarness
        findings={[
          finding({ uuid: "a", tooth_number: 36, condition: "restoration", surfaces: ["O"] }),
          finding({ uuid: "b", tooth_number: 36, condition: "caries", surfaces: ["M"] }),
          finding({ uuid: "c", tooth_number: 11, condition: "missing" }),
        ]}
        onSelect={vi.fn()}
      />,
    );

    const molar = screen.getByTestId("dental-tooth-36");
    expect(molar).toHaveAttribute("data-condition", "caries");
    expect(molar).toHaveTextContent("OM");
    expect(molar).toHaveAccessibleName(
      `${toothName(36)} (36): Restoration, Caries`,
    );
    expect(screen.getByTestId("dental-tooth-11")).toHaveAttribute(
      "data-condition",
      "missing",
    );
    expect(screen.getByTestId("dental-tooth-21")).toHaveAttribute(
      "data-condition",
      "sound",
    );
    expect(screen.getByTestId("dental-chart-legend")).toHaveTextContent("Root canal");
  });

  it("selects a tooth on click and moves focus with the arrow keys", () => {
    const onSelect = vi.fn();
    render(<ChartHarness findings={[]} onSelect={onSelect} />);

    const tooth11 = screen.getByTestId("dental-tooth-11");
    fireEvent.click(tooth11);
    expect(onSelect).toHaveBeenCalledWith(11);

    tooth11.focus();
    fireEvent.keyDown(tooth11, { key: "ArrowRight" });
    expect(screen.getByTestId("dental-tooth-21")).toHaveFocus();

    fireEvent.keyDown(screen.getByTestId("dental-tooth-21"), { key: "ArrowDown" });
    expect(screen.getByTestId("dental-tooth-31")).toHaveFocus();

    fireEvent.keyDown(screen.getByTestId("dental-tooth-31"), { key: "Home" });
    expect(screen.getByTestId("dental-tooth-48")).toHaveFocus();
  });
});
