import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { InvoiceListToolbar } from "@/features/invoices/components/InvoiceListToolbar";
import { DEFAULT_INVOICE_LIST_FILTERS } from "@/features/invoices/utils/invoice-list-filters";

vi.mock("@/features/invoices/components/InvoiceFiltersSheet", () => ({
  InvoiceFiltersSheet: ({ isLoading }: { isLoading?: boolean }) => (
    <button type="button" data-testid="invoices-filters-button" disabled={isLoading}>
      Filters
    </button>
  ),
}));

afterEach(() => {
  cleanup();
});

describe("InvoiceListToolbar", () => {
  it("reuses the shared search field, search button, and add filter button", () => {
    const onSearchSubmit = vi.fn();

    render(
      <InvoiceListToolbar
        search="INV-1"
        filters={DEFAULT_INVOICE_LIST_FILTERS}
        onSearchChange={vi.fn()}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={vi.fn()}
        onFiltersApply={vi.fn()}
      />,
    );

    const search = screen.getByTestId("invoices-search");
    const searchButton = screen.getByTestId("invoices-search-submit");
    const filterButton = screen.getByTestId("invoices-filters-button");

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
