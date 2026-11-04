import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OhExamTypeDialog } from "@/features/occupational-health/components/OhExamTypeDialog";

afterEach(() => {
  cleanup();
});

describe("OhExamTypeDialog", () => {
  it("starts the examination with the chosen type", () => {
    const onConfirm = vi.fn();
    render(
      <OhExamTypeDialog open onOpenChange={vi.fn()} onConfirm={onConfirm} required />,
    );

    expect(screen.getByRole("button", { name: "Start examination" })).toBeDisabled();
    fireEvent.click(screen.getByTestId("oh-exam-type-option-periodic"));
    fireEvent.click(screen.getByTestId("oh-exam-type-confirm"));

    expect(onConfirm).toHaveBeenCalledWith("periodic");
  });

  it("keeps the current type selected when changing it", () => {
    const onConfirm = vi.fn();
    render(
      <OhExamTypeDialog
        open
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
        initialExamType="periodic"
      />,
    );

    expect(screen.getByTestId("oh-exam-type-option-periodic")).toBeChecked();
    fireEvent.click(screen.getByTestId("oh-exam-type-confirm"));
    expect(onConfirm).toHaveBeenCalledWith("periodic");
  });
});
