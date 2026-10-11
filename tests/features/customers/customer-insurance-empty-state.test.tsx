import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CustomerInsuranceEmptyState } from "@/features/customers/components/CustomerInsuranceEmptyState";

describe("CustomerInsuranceEmptyState", () => {
  afterEach(() => {
    cleanup();
  });

  it("points the clinic to add a payer when no schemes exist", () => {
    render(<CustomerInsuranceEmptyState />);

    expect(
      screen.getByRole("heading", { name: "Set up insurance (or payers) first" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Your organization has no insurance schemes configured yet. Set up insurance schemes before you can add insurance for this client.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Add insurance" })).toHaveAttribute(
      "href",
      "/settings/finance-operations?add=payer",
    );
  });
});
