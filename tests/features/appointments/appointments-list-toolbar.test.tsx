import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppointmentsListToolbar } from "@/features/appointments/components/AppointmentsListToolbar";
import { DEFAULT_APPOINTMENT_FILTERS } from "@/features/appointments/utils/appointment-list-filters";

vi.mock("@/features/appointments/components/AppointmentsFiltersSheet", () => ({
  AppointmentsFiltersSheet: ({ isLoading }: { isLoading?: boolean }) => (
    <button type="button" data-testid="appointments-filters-button" disabled={isLoading}>
      Add filter
    </button>
  ),
}));

afterEach(() => {
  cleanup();
});

describe("AppointmentsListToolbar", () => {
  it("reuses the shared search field, search button, and add filter button", () => {
    const onSearchSubmit = vi.fn();

    render(
      <AppointmentsListToolbar
        search="jane"
        filters={DEFAULT_APPOINTMENT_FILTERS}
        viewMode="list"
        onSearchChange={vi.fn()}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={vi.fn()}
        onFiltersApply={vi.fn()}
        onViewModeChange={vi.fn()}
      />,
    );

    const search = screen.getByTestId("appointments-search");
    const searchButton = screen.getByTestId("appointments-search-submit");
    const filterButton = screen.getByTestId("appointments-filters-button");

    expect(search.compareDocumentPosition(searchButton)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(searchButton.compareDocumentPosition(filterButton)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(searchButton).toHaveTextContent("Search");
    expect(filterButton).toHaveTextContent("Add filter");

    fireEvent.click(searchButton);
    expect(onSearchSubmit).toHaveBeenCalledTimes(1);
  });
});
