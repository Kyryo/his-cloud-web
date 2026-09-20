import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  DetailPageAsidePanelSection,
  DetailPageHeaderSection,
  DetailPageLayout,
  DetailPageNotFound,
  DetailPageTabsSection,
  DetailPageTabsNavSection,
  DetailPageTitle,
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageLayout,
  ListPageStatsSection,
  ListPageTableSection,
  ListPageToolbarSection,
  PAGE_TITLE_CLASS,
} from "@/features/app-shell/components/page-layout";

describe("page-layout", () => {
  it("renders detail page layout sections", () => {
    render(
      <DetailPageLayout data-testid="detail-page">
        <DetailPageHeaderSection>Header</DetailPageHeaderSection>
        <DetailPageTabsSection data-testid="detail-tabs">
          <DetailPageTabsNavSection aria-label="Sections">
            <button type="button">Tab</button>
          </DetailPageTabsNavSection>
        </DetailPageTabsSection>
        <DetailPageAsidePanelSection>Aside</DetailPageAsidePanelSection>
      </DetailPageLayout>,
    );

    const detailPage = screen.getByTestId("detail-page");
    expect(detailPage).toBeInTheDocument();
    expect(detailPage).toHaveAttribute("data-page-surface", "card");
    expect(detailPage.firstElementChild).toHaveClass(
      "overflow-hidden",
      "rounded-xl",
      "border-dash-border",
    );
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByTestId("detail-tabs")).toHaveClass("bg-white");
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

    const listPage = screen.getByTestId("list-page");
    expect(listPage).toBeInTheDocument();
    expect(listPage).toHaveClass("px-4", "md:px-6", "space-y-3");
    const listTitle = screen.getByRole("heading", { name: "Clients" });
    expect(listTitle).toBeInTheDocument();
    expect(listTitle).toHaveClass(...PAGE_TITLE_CLASS.split(" "));
    expect(screen.getByText("Subtitle")).toBeInTheDocument();
    expect(screen.getByText("Stats")).toBeInTheDocument();
    expect(screen.getByText("Toolbar")).toBeInTheDocument();
    expect(screen.getByText("Table")).toBeInTheDocument();
  });

  it("uses the same title size on list and detail pages", () => {
    render(
      <>
        <ListPageHeaderTitleBlock title="List title" />
        <DetailPageTitle>Detail title</DetailPageTitle>
      </>,
    );

    const listTitle = screen.getByRole("heading", { name: "List title" });
    const detailTitle = screen.getByRole("heading", { name: "Detail title" });
    const sharedClasses = PAGE_TITLE_CLASS.split(" ");

    expect(listTitle).toHaveClass(...sharedClasses);
    expect(detailTitle).toHaveClass(...sharedClasses);
  });

  it("renders not-found titles on the shared page title scale", () => {
    render(
      <DetailPageNotFound title="Invoice not found" message="Could not load." />,
    );

    expect(screen.getByRole("heading", { name: "Invoice not found" })).toHaveClass(
      "text-xl",
      "font-semibold",
      "tracking-tight",
    );
  });
});
