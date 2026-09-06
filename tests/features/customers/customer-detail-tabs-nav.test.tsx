import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CustomerDetailTabs } from "@/features/customers/components/detail/CustomerDetailTabs";
import type { Customer } from "@/features/customers/types/customer.types";

const CUSTOMER_ID = "57136727-9e05-4ae3-9146-149106022595";

const mockUsePathname = vi.fn(
  () => `/customers/${CUSTOMER_ID}/invoices`,
);

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

const customer = {
  uuid: CUSTOMER_ID,
  first_name: "Ada",
  last_name: "Banda",
} as Customer;

afterEach(() => {
  cleanup();
});

describe("CustomerDetailTabs", () => {
  it("renders tab links and marks the active parallel route", () => {
    render(<CustomerDetailTabs customer={customer} showBenefitsTab={false} />);

    const invoices = screen.getByRole("link", { name: "Invoices" });
    expect(invoices).toHaveAttribute(
      "href",
      `/customers/${CUSTOMER_ID}/invoices`,
    );
    expect(invoices).toHaveAttribute("aria-current", "page");
    expect(invoices.querySelector("svg")).toBeTruthy();

    expect(screen.getByRole("link", { name: "Summary" })).toHaveAttribute(
      "href",
      `/customers/${CUSTOMER_ID}`,
    );
    expect(screen.queryByRole("link", { name: "Benefits" })).not.toBeInTheDocument();
  });

  it("includes the benefits tab when the client has a MASM payer", () => {
    render(<CustomerDetailTabs customer={customer} showBenefitsTab />);

    expect(screen.getByRole("link", { name: "Benefits" })).toHaveAttribute(
      "href",
      `/customers/${CUSTOMER_ID}/benefits`,
    );
  });
});
