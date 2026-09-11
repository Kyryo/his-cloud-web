import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ListPageFilterButton,
  ListPageSearchToolbar,
} from "@/features/app-shell/components/page-layout";

afterEach(() => {
  cleanup();
});

describe("ListPageSearchToolbar", () => {
  it("renders search field, search button, and filter control", () => {
    const onSearchSubmit = vi.fn();

    render(
      <ListPageSearchToolbar
        search="jane"
        placeholder="Search..."
        searchTestId="shared-search"
        searchSubmitTestId="shared-search-submit"
        isLoading={false}
        onSearchChange={vi.fn()}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={vi.fn()}
        filter={
          <ListPageFilterButton
            activeCount={2}
            onClick={vi.fn()}
            data-testid="shared-filters-button"
          />
        }
      />,
    );

    const search = screen.getByTestId("shared-search");
    const searchButton = screen.getByTestId("shared-search-submit");
    const filterButton = screen.getByTestId("shared-filters-button");

    expect(search.compareDocumentPosition(searchButton)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(searchButton.compareDocumentPosition(filterButton)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(searchButton).toHaveTextContent("Search");
    expect(filterButton).toHaveTextContent("Filters");
    expect(filterButton).toHaveTextContent("2");
    expect(filterButton.className).not.toContain("bg-brand-primary");

    fireEvent.click(searchButton);
    expect(onSearchSubmit).toHaveBeenCalledTimes(1);
  });
});
