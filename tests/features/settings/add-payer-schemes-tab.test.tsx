import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AddPayerDialog } from "@/features/settings/components/AddPayerDialog";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/features/settings/services/settings.service", () => ({
  createOrganizationPayer: vi.fn(),
  fetchOrganizationPayerSchemes: vi.fn().mockResolvedValue([]),
}));

afterEach(() => {
  cleanup();
});

describe("AddPayerDialog schemes", () => {
  it("shows an empty schemes tab and does not create a payer from invalid fields", async () => {
    render(
      <AddPayerDialog open onOpenChange={vi.fn()} onCreated={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Schemes" }));

    expect(screen.getByText("No schemes yet")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add scheme" }));

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(screen.queryByText("No schemes yet")).not.toBeInTheDocument();
  });
});
