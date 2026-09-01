import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AppointmentSummaryStatsCards } from "@/features/appointments/components/AppointmentSummaryStatsCards";
import { ClaimSummaryStatsCards } from "@/features/claims/components/ClaimSummaryStatsCards";
import { RemittanceSummaryStatsCards } from "@/features/claims/components/RemittanceSummaryStatsCards";
import { InvoiceSummaryStatsCards } from "@/features/invoices/components/InvoiceSummaryStatsCards";
import { PaymentSummaryStatsCards } from "@/features/payments/components/PaymentSummaryStatsCards";
import { SalesOrderSummaryStatsCards } from "@/features/sales-orders/components/SalesOrderSummaryStatsCards";
import { VisitQueueSummaryCards } from "@/features/visits/components/VisitQueueSummaryCards";

afterEach(() => {
  cleanup();
});

describe("list page summary stat cards", () => {
  it("renders appointment card labels", () => {
    render(
      <AppointmentSummaryStatsCards
        stats={{
          todays_appointments: 3,
          upcoming_appointments: 8,
          in_progress: 1,
          cancelled_today: 0,
        }}
      />,
    );

    expect(screen.getByTestId("appointment-summary-stats")).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Upcoming")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("Cancelled today")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders visit queue card labels", () => {
    render(
      <VisitQueueSummaryCards
        stats={{
          todays_visits: 4,
          todays_active_visits: 2,
          todays_completed_visits: 1,
          total_visits: 12,
        }}
      />,
    );

    expect(screen.getByTestId("visit-queue-summary-stats")).toBeInTheDocument();
    expect(screen.getByText("Today's visits")).toBeInTheDocument();
    expect(screen.getByText("Today's active")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("renders sales order card labels and amounts", () => {
    render(
      <SalesOrderSummaryStatsCards
        stats={{
          all: { count: 4, total: "165.00" },
          open: { count: 1, total: "40.00" },
          confirmed: { count: 2, total: "100.00" },
          cancelled: { count: 1, total: "25.00" },
        }}
      />,
    );

    expect(screen.getByTestId("sales-order-summary-stats")).toBeInTheDocument();
    expect(screen.getByText("All orders")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });

  it("renders invoice card labels", () => {
    render(
      <InvoiceSummaryStatsCards
        stats={{
          all: { count: 3, total: "230.00" },
          paid: { count: 1, total: "50.00" },
          not_paid: { count: 1, total: "80.00" },
          partially_paid: { count: 1, total: "100.00" },
        }}
      />,
    );

    expect(screen.getByTestId("invoice-summary-stats")).toBeInTheDocument();
    expect(screen.getByText("All invoices")).toBeInTheDocument();
    expect(screen.getByText("Paid")).toBeInTheDocument();
    expect(screen.getByText("Unpaid")).toBeInTheDocument();
    expect(screen.getByText("Partially paid")).toBeInTheDocument();
  });

  it("renders payment card labels", () => {
    render(
      <PaymentSummaryStatsCards
        stats={{
          all: { count: 3, total: "85.00" },
          posted: { count: 1, total: "60.00" },
          draft: { count: 1, total: "15.00" },
          cancelled: { count: 1, total: "10.00" },
        }}
      />,
    );

    expect(screen.getByTestId("payment-summary-stats")).toBeInTheDocument();
    expect(screen.getByText("All payments")).toBeInTheDocument();
    expect(screen.getByText("Posted")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });

  it("renders claim card labels", () => {
    render(
      <ClaimSummaryStatsCards
        stats={{
          all: { count: 4, total: "450.00" },
          draft: { count: 2, total: "200.00" },
          submitted: { count: 1, total: "100.00" },
          approved: { count: 1, total: "150.00" },
        }}
      />,
    );

    expect(screen.getByTestId("claim-summary-stats")).toBeInTheDocument();
    expect(screen.getByText("All claims")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Submitted")).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  it("renders remittance card labels", () => {
    render(
      <RemittanceSummaryStatsCards
        stats={{
          all: { count: 4, total: "1200.00" },
          in_progress: { count: 1, total: "0.00" },
          processed: { count: 2, total: "900.00" },
          needs_review: { count: 1, total: "300.00" },
        }}
      />,
    );

    expect(screen.getByTestId("remittance-summary-stats")).toBeInTheDocument();
    expect(screen.getByText("All remittances")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("Processed")).toBeInTheDocument();
    expect(screen.getByText("Needs review")).toBeInTheDocument();
  });
});
