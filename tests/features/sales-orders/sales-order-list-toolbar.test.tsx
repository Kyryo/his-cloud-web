import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SalesOrderListToolbar } from "@/features/sales-orders/components/SalesOrderListToolbar";
import { DEFAULT_SALES_ORDER_LIST_FILTERS } from "@/features/sales-orders/utils/sales-order-list-filters";

vi.mock("@/features/sales-orders/components/SalesOrderFiltersSheet", () => ({
  SalesOrderFiltersSheet: ({ isLoading }: { isLoading?: boolean }) => (
    <button type="button" data-testid="sales-orders-filters-button" disabled={isLoading}>
      Filters
    </button>
  ),
}));

afterEach(() => {
  cleanup();
});

describe("SalesOrderListToolbar", () => {
  it("reuses the shared search field, search button, and add filter button", () => {
    const onSearchSubmit = vi.fn();

    render(
      <SalesOrderListToolbar
        search="S00081"
        filters={DEFAULT_SALES_ORDER_LIST_FILTERS}
        onSearchChange={vi.fn()}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={vi.fn()}
        onFiltersApply={vi.fn()}
      />,
    );

    const search = screen.getByTestId("sales-orders-search");
    const searchButton = screen.getByTestId("sales-orders-search-submit");
    const filterButton = screen.getByTestId("sales-orders-filters-button");

    expect(search.compareDocumentPosition(searchButton)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(searchButton.compareDocumentPosition(filterButton)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(searchButton).toHaveTextContent("Search");
    expect(filterButton).toHaveTextContent("Filters");

    fireEvent.click(searchButton);
    expect(onSearchSubmit).toHaveBeenCalledTimes(1);
  });
});
