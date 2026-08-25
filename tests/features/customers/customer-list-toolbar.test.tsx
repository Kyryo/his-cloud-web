import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CustomerListToolbar } from "@/features/customers/components/CustomerListToolbar";
import { DEFAULT_CUSTOMER_ORDERING } from "@/features/customers/utils/customer-list-filters";

afterEach(() => {
  cleanup();
});

const defaultFilters = {
  gender: "all" as const,
  activeStatus: "all" as const,
  ordering: DEFAULT_CUSTOMER_ORDERING,
};

describe("CustomerListToolbar", () => {
  it("runs search when the search button is clicked", () => {
    const onSearchSubmit = vi.fn();

    render(
      <CustomerListToolbar
        search="jane"
        filters={defaultFilters}
        onSearchChange={vi.fn()}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={vi.fn()}
        onFiltersApply={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId("customers-search-submit"));
    expect(onSearchSubmit).toHaveBeenCalledTimes(1);
  });

  it("places search before add filter and keeps both as secondary actions", () => {
    render(
      <CustomerListToolbar
        search=""
        filters={defaultFilters}
        onSearchChange={vi.fn()}
        onSearchSubmit={vi.fn()}
        onClearSearch={vi.fn()}
        onFiltersApply={vi.fn()}
      />,
    );

    const search = screen.getByTestId("customers-search");
    const searchButton = screen.getByTestId("customers-search-submit");
    const filterButton = screen.getByTestId("customers-filters-button");

    expect(search.compareDocumentPosition(searchButton)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(searchButton.compareDocumentPosition(filterButton)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(searchButton).toHaveTextContent("Search");
    expect(filterButton).toHaveTextContent("Add filter");
    expect(searchButton.className).toContain("border");
    expect(filterButton.className).not.toContain("bg-brand-primary");
  });
});
