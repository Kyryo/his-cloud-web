import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CustomersPageHeader } from "@/features/customers/components/CustomersPageHeader";
import { DEFAULT_CUSTOMER_ORDERING } from "@/features/customers/utils/customer-list-filters";

afterEach(() => {
  cleanup();
});

const defaultFilters = {
  gender: "all" as const,
  activeStatus: "all" as const,
  ordering: DEFAULT_CUSTOMER_ORDERING,
  tags: [] as string[],
};

describe("CustomersPageHeader", () => {
  it("renders search, filters, and action buttons without a title block", () => {
    const onAddClient = vi.fn();
    const onSearchSubmit = vi.fn();

    render(
      <CustomersPageHeader
        search="test search"
        filters={defaultFilters}
        onSearchChange={vi.fn()}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={vi.fn()}
        onFiltersApply={vi.fn()}
        onAddClient={onAddClient}
      />,
    );

    // Title should not exist
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    expect(screen.queryByText("Manage client registrations")).not.toBeInTheDocument();

    // Search input and buttons should be in header
    expect(screen.getByTestId("customers-search")).toHaveValue("test search");
    expect(screen.getByTestId("customers-search-submit")).toBeInTheDocument();
    expect(screen.getByTestId("customers-filters-button")).toBeInTheDocument();

    // Action buttons
    expect(screen.queryByText("Active Queue")).not.toBeInTheDocument();
    expect(screen.queryByText("Appointments")).not.toBeInTheDocument();
    expect(screen.getByTestId("add-client-button")).toHaveTextContent(
      "Register client",
    );

    fireEvent.click(screen.getByTestId("add-client-button"));
    expect(onAddClient).toHaveBeenCalledTimes(1);
  });
});
