import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CreateCustomerDialog } from "@/features/customers/components/CreateCustomerDialog";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/features/customers/services/insurance-schemes.service", () => ({
  fetchInsuranceSchemes: vi.fn().mockResolvedValue([]),
}));

afterEach(() => {
  cleanup();
});

describe("CreateCustomerDialog registration tabs", () => {
  it("offers personal, insurance, and what's next", () => {
    render(
      <CreateCustomerDialog open onOpenChange={vi.fn()} onCreated={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "Personal" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Insurance" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "What's next?" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Address" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Notes" })).not.toBeInTheDocument();
  });
});
