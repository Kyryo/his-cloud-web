import { cleanup, render, screen } from "@testing-library/react";
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
  it("uses a search field without a Search button", () => {
    render(
      <AppointmentsListToolbar
        search="jane"
        filters={DEFAULT_APPOINTMENT_FILTERS}
        viewMode="list"
        onSearchChange={vi.fn()}
        onSearchSubmit={vi.fn()}
        onClearSearch={vi.fn()}
        onFiltersApply={vi.fn()}
      />,
    );

    const search = screen.getByTestId("appointments-search");
    const filterButton = screen.getByTestId("appointments-filters-button");

    expect(search).toHaveAttribute(
      "placeholder",
      "Name, ID, phone, clinic, or department",
    );
    expect(screen.queryByTestId("appointments-search-submit")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Search" })).not.toBeInTheDocument();
    expect(search.compareDocumentPosition(filterButton)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(filterButton).toHaveTextContent("Add filter");
    expect(screen.getByRole("link", { name: /board/i })).toBeInTheDocument();
  });
});
