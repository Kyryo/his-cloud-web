import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatsCard1, StatsCard1Grid } from "@/components/stats-card1";
import { ListPageToolbarSkeleton } from "@/features/app-shell/components/page-layout";

describe("list page summary cards and toolbar skeleton", () => {
  it("shows a value skeleton while a stats card is loading", () => {
    render(
      <StatsCard1Grid data-testid="stats-grid">
        <StatsCard1 title="Total clients" icon="users" isLoading value="12" />
      </StatsCard1Grid>,
    );

    expect(screen.getByTestId("stats-grid")).toBeInTheDocument();
    expect(screen.getByText("Total clients")).toBeInTheDocument();
    expect(screen.queryByText("12")).not.toBeInTheDocument();
    expect(screen.getByText("Total clients").closest("[aria-busy='true']")).toBeTruthy();
  });

  it("renders search, action, and filter skeletons", () => {
    render(<ListPageToolbarSkeleton />);

    expect(screen.getByTestId("list-page-toolbar-skeleton")).toBeInTheDocument();
  });
});
