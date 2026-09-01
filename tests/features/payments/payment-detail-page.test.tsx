import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PaymentDetailPage } from "@/features/payments/pages/PaymentDetailPage";

const fetchPayment = vi.fn();

vi.mock("@/features/app-shell/hooks/use-app-breadcrumb", () => ({
  useAppBreadcrumb: vi.fn(),
}));

vi.mock("@/features/payments/services/payments.service", () => ({
  fetchPayment: (...args: unknown[]) => fetchPayment(...args),
}));

afterEach(() => {
  cleanup();
});

describe("PaymentDetailPage", () => {
  it("shows a detail skeleton while the payment is loading", () => {
    fetchPayment.mockReturnValue(new Promise(() => undefined));

    render(<PaymentDetailPage paymentId="81" />);

    expect(screen.getByTestId("payment-detail-skeleton")).toBeInTheDocument();
  });
});
