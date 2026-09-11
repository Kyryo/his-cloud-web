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
  tags: [] as string[],
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
    expect(filterButton).toHaveTextContent("Filters");
    expect(searchButton.className).toContain("border");
    expect(filterButton.className).not.toContain("bg-brand-primary");
  });

  it("renders active filter chips and allows removing a filter", () => {
    const onFiltersApply = vi.fn();

    render(
      <CustomerListToolbar
        search=""
        filters={{
          gender: "Female",
          activeStatus: "active",
          ordering: DEFAULT_CUSTOMER_ORDERING,
          tags: [],
        }}
        onSearchChange={vi.fn()}
        onSearchSubmit={vi.fn()}
        onClearSearch={vi.fn()}
        onFiltersApply={onFiltersApply}
      />,
    );

    expect(screen.getByText("Active filters:")).toBeInTheDocument();
    expect(screen.getByText("Gender: Female")).toBeInTheDocument();
    expect(screen.getByText("Status: active")).toBeInTheDocument();

    const genderChip = screen.getByRole("button", { name: /Gender: Female/i });
    fireEvent.click(genderChip);

    expect(onFiltersApply).toHaveBeenCalledWith({
      gender: "all",
      activeStatus: "active",
      ordering: DEFAULT_CUSTOMER_ORDERING,
      tags: [],
    });
  });

  it("clears all active filters when Clear all is clicked", () => {
    const onFiltersApply = vi.fn();

    render(
      <CustomerListToolbar
        search=""
        filters={{
          gender: "Male",
          activeStatus: "inactive",
          ordering: "first_name",
          tags: ["tag-1"],
        }}
        onSearchChange={vi.fn()}
        onSearchSubmit={vi.fn()}
        onClearSearch={vi.fn()}
        onFiltersApply={onFiltersApply}
      />,
    );

    const clearAllButton = screen.getByRole("button", { name: /Clear all/i });
    fireEvent.click(clearAllButton);

    expect(onFiltersApply).toHaveBeenCalledWith({
      gender: "all",
      activeStatus: "all",
      ordering: DEFAULT_CUSTOMER_ORDERING,
      tags: [],
    });
  });
});
