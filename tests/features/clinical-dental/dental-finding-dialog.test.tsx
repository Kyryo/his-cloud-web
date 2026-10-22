import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DentalFindingDialog } from "@/features/clinical-dental/components/DentalFindingDialog";

const mutateAsync = vi.hoisted(() => vi.fn());
const toast = vi.hoisted(() => vi.fn());

vi.mock("@/features/clinical-dental/hooks/use-clinical-dental", () => ({
  useCreateDentalFinding: () => ({ mutateAsync, isPending: false }),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("DentalFindingDialog", () => {
  it("records the selected tooth with surfaces and notes", async () => {
    mutateAsync.mockResolvedValue({ uuid: "f-1" });
    const onOpenChange = vi.fn();
    render(
      <DentalFindingDialog
        visitUuid="visit-1"
        encounterUuid="enc-1"
        toothNumber={36}
        open
        onOpenChange={onOpenChange}
      />,
    );

    expect(screen.getByTestId("dental-finding-dialog")).toHaveTextContent(
      "Lower left first molar (tooth 36)",
    );
    fireEvent.click(screen.getByTestId("dental-finding-surface-O"));
    fireEvent.click(screen.getByTestId("dental-finding-surface-M"));
    fireEvent.change(screen.getByTestId("dental-finding-notes"), {
      target: { value: "Deep occlusal lesion" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Record finding" }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        tooth_number: 36,
        condition: "caries",
        surfaces: ["O", "M"],
        notes: "Deep occlusal lesion",
      }),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "success", title: "Finding recorded" }),
    );
  });

  it("keeps the dialog open and reports API errors", async () => {
    mutateAsync.mockRejectedValue(new Error("boom"));
    const onOpenChange = vi.fn();
    render(
      <DentalFindingDialog
        visitUuid="visit-1"
        encounterUuid="enc-1"
        toothNumber={11}
        open
        onOpenChange={onOpenChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Record finding" }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: "error" }),
      ),
    );
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
