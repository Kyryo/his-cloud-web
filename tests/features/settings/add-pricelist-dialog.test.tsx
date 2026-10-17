import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AddPricelistDialog } from "@/features/settings/components/AddPricelistDialog";

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/features/overview/hooks/use-onboarding-return", () => ({
  useOnboardingReturn: () => ({ finishSetup: vi.fn() }),
}));

afterEach(() => {
  cleanup();
});

describe("AddPricelistDialog", () => {
  it("shows the fields without a header icon or section cards", () => {
    render(
      <AddPricelistDialog open onOpenChange={vi.fn()} onCreated={vi.fn()} />,
    );

    const dialog = screen.getByTestId("add-pricelist-dialog");
    expect(screen.getByRole("heading", { name: "Add pricelist" })).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(dialog.querySelector("svg.lucide-receipt")).toBeNull();
    expect(dialog.querySelector("section")).toBeNull();
    expect(screen.queryByText("Details")).not.toBeInTheDocument();
    expect(screen.queryByText("Availability")).not.toBeInTheDocument();
  });
});
