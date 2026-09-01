import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { CustomerSummaryStatsCards } from "@/features/customers/components/CustomerSummaryStats";

describe("CustomerSummaryStatsCards", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders cardless summary statistics correctly", () => {
    render(
      <CustomerSummaryStatsCards
        stats={{
          totalClients: 1250,
          newThisMonth: 125,
          maleCount: 600,
          femaleCount: 650,
          otherCount: 0,
          averageAge: 34,
        }}
        isLoading={false}
      />,
    );

    expect(screen.getByText("Total clients")).toBeInTheDocument();
    expect(screen.getByText("1.3k")).toBeInTheDocument();
    expect(screen.getByText("New this month")).toBeInTheDocument();
    expect(screen.getByText("125")).toBeInTheDocument();
    expect(screen.getByText("+10% of directory")).toBeInTheDocument();
    expect(screen.getByText("Male / Female")).toBeInTheDocument();
    expect(screen.getByText("600 / 650")).toBeInTheDocument();
    expect(screen.getByText("Average age")).toBeInTheDocument();
    expect(screen.getByText("34 yrs")).toBeInTheDocument();
  });

  it("renders loading skeleton states when loading", () => {
    const { container } = render(
      <CustomerSummaryStatsCards stats={null} isLoading={true} />,
    );

    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });
});
