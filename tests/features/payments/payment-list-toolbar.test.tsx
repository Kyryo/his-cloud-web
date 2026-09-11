import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PaymentListToolbar } from "@/features/payments/components/PaymentListToolbar";
import { DEFAULT_PAYMENT_LIST_FILTERS } from "@/features/payments/utils/payment-list-filters";

vi.mock("@/features/payments/components/PaymentFiltersSheet", () => ({
  PaymentFiltersSheet: ({ isLoading }: { isLoading?: boolean }) => (
    <button type="button" data-testid="payments-filters-button" disabled={isLoading}>
      Filters
    </button>
  ),
}));

afterEach(() => {
  cleanup();
});

describe("PaymentListToolbar", () => {
  it("reuses the shared search field, search button, and add filter button", () => {
    const onSearchSubmit = vi.fn();

    render(
      <PaymentListToolbar
        search="PAY-1"
        filters={DEFAULT_PAYMENT_LIST_FILTERS}
        onSearchChange={vi.fn()}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={vi.fn()}
        onFiltersApply={vi.fn()}
      />,
    );

    const search = screen.getByTestId("payments-search");
    const searchButton = screen.getByTestId("payments-search-submit");
    const filterButton = screen.getByTestId("payments-filters-button");

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
