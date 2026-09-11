import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ActiveVisitsListToolbar } from "@/features/visits/components/ActiveVisitsListToolbar";
import { DEFAULT_ACTIVE_VISIT_FILTERS } from "@/features/visits/utils/visit-list-filters";

vi.mock("@/features/appointments/hooks/use-user-associated-clinics", () => ({
  useUserAssociatedClinics: () => ({
    clinics: [],
    primaryClinicUuid: undefined,
    hasAssignedClinic: false,
    isLoading: false,
    error: null,
  }),
}));

afterEach(() => {
  cleanup();
});

describe("ActiveVisitsListToolbar", () => {
  it("reuses the shared search field, search button, and add filter button", () => {
    const onSearchSubmit = vi.fn();

    render(
      <ActiveVisitsListToolbar
        search="jane"
        filters={DEFAULT_ACTIVE_VISIT_FILTERS}
        onSearchChange={vi.fn()}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={vi.fn()}
        onFiltersApply={vi.fn()}
      />,
    );

    const search = screen.getByTestId("active-visits-search");
    const searchButton = screen.getByTestId("active-visits-search-submit");
    const filterButton = screen.getByTestId("active-visits-filters-button");

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
