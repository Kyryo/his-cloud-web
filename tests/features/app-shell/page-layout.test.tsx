import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  DetailPageAsidePanelSection,
  DetailPageHeaderSection,
  DetailPageLayout,
  DetailPageTabsNavSection,
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageLayout,
  ListPageStatsSection,
  ListPageTableSection,
  ListPageToolbarSection,
} from "@/features/app-shell/components/page-layout";

describe("page-layout", () => {
  it("renders detail page layout sections", () => {
    render(
      <DetailPageLayout data-testid="detail-page">
        <DetailPageHeaderSection>Header</DetailPageHeaderSection>
        <DetailPageTabsNavSection aria-label="Sections">
          <button type="button">Tab</button>
        </DetailPageTabsNavSection>
        <DetailPageAsidePanelSection>Aside</DetailPageAsidePanelSection>
      </DetailPageLayout>,
    );

    expect(screen.getByTestId("detail-page")).toBeInTheDocument();
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Aside")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Sections" })).toBeInTheDocument();
  });

  it("renders list page layout sections", () => {
    render(
      <ListPageLayout data-testid="list-page">
        <ListPageHeaderSection>
          <ListPageHeaderTitleBlock title="Clients" description="Subtitle" />
        </ListPageHeaderSection>
        <ListPageStatsSection>Stats</ListPageStatsSection>
        <ListPageToolbarSection>Toolbar</ListPageToolbarSection>
        <ListPageTableSection>Table</ListPageTableSection>
      </ListPageLayout>,
    );

    expect(screen.getByTestId("list-page")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Clients" })).toBeInTheDocument();
    expect(screen.getByText("Subtitle")).toBeInTheDocument();
    expect(screen.getByText("Stats")).toBeInTheDocument();
    expect(screen.getByText("Toolbar")).toBeInTheDocument();
    expect(screen.getByText("Table")).toBeInTheDocument();
  });
});
