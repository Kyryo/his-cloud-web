import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { financeFixture } from "./fixtures/finance.fixture";

vi.mock("@/features/platform-admin/components/overview/OverviewEChart", () => ({
  OverviewEChart: ({ ariaLabel }: { ariaLabel: string }) => (
    <div role="img" aria-label={ariaLabel} />
  ),
  verticalGradient: () => "gradient",
}));

const { PlatformAdminFinanceView } =
  await import("@/features/platform-admin/components/finance/PlatformAdminFinanceView");
const { FinanceEntrySheet } =
  await import("@/features/platform-admin/components/finance/FinanceEntrySheet");
const { FinanceErrorState } =
  await import("@/features/platform-admin/components/finance/FinanceStates");

afterEach(cleanup);

describe("PlatformAdminFinanceView", () => {
  it("renders stats, chart and history from records", () => {
    render(
      <PlatformAdminFinanceView records={financeFixture} onRecord={() => {}} />,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Finance" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Revenue this month")).toBeInTheDocument();
    expect(
      screen.getByText("Cash balance", { selector: "dt" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Revenue versus costs by month" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByTestId("overview-sparkline").length,
    ).toBeGreaterThanOrEqual(3);
    // 12 visible rows + header row
    expect(screen.getAllByRole("row")).toHaveLength(13);
    expect(
      screen.getByRole("button", { name: /show more/i }),
    ).toBeInTheDocument();
  });

  it("filters history and opens the entry sheet", () => {
    const onRecord = vi.fn();
    render(
      <PlatformAdminFinanceView records={financeFixture} onRecord={onRecord} />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Cash 12" }));
    expect(screen.getAllByRole("row")).toHaveLength(13);
    expect(screen.queryByText("AWS + Cloudflare")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /record entry/i }));
    expect(onRecord).toHaveBeenCalledWith("payment");
  });

  it("shows empty states without records", () => {
    render(
      <PlatformAdminFinanceView
        records={{ payments: [], costs: [], cash: [] }}
        onRecord={() => {}}
      />,
    );
    expect(screen.getByText("No payments or costs yet")).toBeInTheDocument();
    expect(screen.getByText("Record a cash balance")).toBeInTheDocument();
    expect(screen.queryAllByTestId("overview-sparkline")).toHaveLength(0);
  });

  it("shows an error state with retry", () => {
    const onRetry = vi.fn();
    render(<FinanceErrorState message="Network down" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalled();
  });
});

describe("FinanceEntrySheet", () => {
  it("validates and submits a cash balance", async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    render(
      <FinanceEntrySheet
        open
        onOpenChange={() => {}}
        kind="cash"
        onKindChange={() => {}}
        tenants={[]}
        tenantsLoading={false}
        isSubmitting={false}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Record balance" }));
    expect(await screen.findByText("Enter a balance")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Balance"), {
      target: { value: "2500.75" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Record balance" }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        kind: "cash",
        payload: expect.objectContaining({ amount: "2500.75" }),
      }),
    );
  });

  it("requires a tenant for payments", async () => {
    render(
      <FinanceEntrySheet
        open
        onOpenChange={() => {}}
        kind="payment"
        onKindChange={() => {}}
        tenants={[]}
        tenantsLoading={false}
        isSubmitting={false}
        onSubmit={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Record payment" }));
    expect(await screen.findByText("Select a tenant")).toBeInTheDocument();
    expect(screen.getByText("Enter an amount")).toBeInTheDocument();
  });
});
