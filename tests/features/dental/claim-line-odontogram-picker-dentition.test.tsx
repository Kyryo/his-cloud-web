import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ClaimLineOdontogramPicker } from "@/features/dental/components/ClaimLineOdontogramPicker";
import { getPrimaryFdiToothNumbers } from "@/features/dental/lib/dental-dentition";

vi.mock("next/dynamic", () => ({
  default: () => {
    function MockOdontogram() {
      return <div data-testid="mock-odontogram" />;
    }
    return MockOdontogram;
  },
}));

afterEach(() => {
  cleanup();
});

describe("ClaimLineOdontogramPicker dentition toggle", () => {
  it("renders Permanent / Primary toggle and defaults to Permanent", () => {
    render(
      <ClaimLineOdontogramPicker
        value={[11]}
        onRequestAssign={vi.fn()}
        onRemoveTeeth={vi.fn()}
        onSelectAll={vi.fn()}
        onDeselectAll={vi.fn()}
      />,
    );

    expect(
      screen.getByTestId("claim-odontogram-dentition-toggle"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("claim-odontogram-dentition-adult")).toHaveTextContent(
      "Permanent",
    );
    expect(
      screen.getByTestId("claim-odontogram-dentition-children"),
    ).toHaveTextContent("Primary / Deciduous");
    expect(screen.getByTestId("claim-odontogram-dentition-adult")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByTestId("claim-odontogram-dentition-children"),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("infers Primary mode when only primary teeth are selected", () => {
    render(
      <ClaimLineOdontogramPicker
        value={[51, 61]}
        onRequestAssign={vi.fn()}
        onRemoveTeeth={vi.fn()}
        onSelectAll={vi.fn()}
        onDeselectAll={vi.fn()}
      />,
    );

    expect(
      screen.getByTestId("claim-odontogram-dentition-children"),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("passes primary FDI numbers when selecting all in Primary mode", () => {
    const onSelectAll = vi.fn();
    render(
      <ClaimLineOdontogramPicker
        value={[]}
        onRequestAssign={vi.fn()}
        onRemoveTeeth={vi.fn()}
        onSelectAll={onSelectAll}
        onDeselectAll={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId("claim-odontogram-dentition-children"));
    fireEvent.click(screen.getByTestId("claim-odontogram-select-all"));

    expect(onSelectAll).toHaveBeenCalledTimes(1);
    expect(onSelectAll).toHaveBeenCalledWith(getPrimaryFdiToothNumbers());
  });

  it("shows a note when the other dentition has selections", () => {
    render(
      <ClaimLineOdontogramPicker
        value={[11, 51]}
        onRequestAssign={vi.fn()}
        onRemoveTeeth={vi.fn()}
      />,
    );

    expect(
      screen.getByTestId("claim-odontogram-other-dentition-note"),
    ).toHaveTextContent("1 primary tooth also selected");
  });
});
