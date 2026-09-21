import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CustomerDetailTabs } from "@/features/customers/components/detail/CustomerDetailTabs";
import type { Customer } from "@/features/customers/types/customer.types";

const CUSTOMER_ID = "57136727-9e05-4ae3-9146-149106022595";

const mockUsePathname = vi.fn(
  () => `/customers/${CUSTOMER_ID}/orders`,
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
  mockUsePathname.mockReturnValue(`/customers/${CUSTOMER_ID}/orders`);
});

describe("CustomerDetailTabs", () => {
  it("renders primary tab links and marks the active parallel route", () => {
    render(<CustomerDetailTabs customer={customer} showBenefitsTab={false} />);

    const orders = screen.getByRole("link", { name: "Sales Orders" });
    expect(orders).toHaveAttribute(
      "href",
      `/customers/${CUSTOMER_ID}/orders`,
    );
    expect(orders).toHaveAttribute("aria-current", "page");
    expect(orders.querySelector("svg")).toBeTruthy();

    expect(screen.getByRole("link", { name: "Summary" })).toHaveAttribute(
      "href",
      `/customers/${CUSTOMER_ID}`,
    );
    expect(screen.queryByRole("link", { name: "Invoices" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Benefits" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Relationships" })).toHaveAttribute(
      "href",
      `/customers/${CUSTOMER_ID}/relationships`,
    );
    expect(screen.getByTestId("customer-detail-tabs-more")).toBeInTheDocument();
  });

  it("keeps invoices, payments, visits, and address under More", () => {
    render(<CustomerDetailTabs customer={customer} showBenefitsTab={false} />);

    expect(screen.getByTestId("customer-detail-tabs-more")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Invoices" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Payments" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Visits" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Address" })).not.toBeInTheDocument();
  });

  it("includes the benefits tab when the client has a MASM payer", () => {
    render(<CustomerDetailTabs customer={customer} showBenefitsTab />);

    expect(screen.getByRole("link", { name: "Benefits" })).toHaveAttribute(
      "href",
      `/customers/${CUSTOMER_ID}/benefits`,
    );
  });
});
