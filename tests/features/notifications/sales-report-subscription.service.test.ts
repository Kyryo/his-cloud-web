import { describe, expect, it, vi } from "vitest";

import {
  blockUserSalesReports,
  fetchSalesReportSubscription,
  fetchUserSalesReportSubscription,
  unblockUserSalesReports,
  unsubscribeFromSalesReports,
  updateSalesReportSubscription,
  updateUserSalesReportSubscription,
} from "@/features/notifications/services/sales-report-subscription.service";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

describe("sales-report-subscription.service", () => {
  it("fetches the current subscription", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      subscription: {
        daily_enabled: true,
        weekly_enabled: false,
        monthly_enabled: false,
        is_active: true,
        updated_at: "2026-07-10T00:00:00Z",
      },
    });

    const subscription = await fetchSalesReportSubscription();

    expect(bffRequest).toHaveBeenCalledWith("/api/account/sales-report-subscription");
    expect(subscription.daily_enabled).toBe(true);
  });

  it("updates subscription preferences", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      subscription: {
        daily_enabled: false,
        weekly_enabled: true,
        monthly_enabled: false,
        is_active: true,
        updated_at: "2026-07-10T00:00:00Z",
      },
    });

    const subscription = await updateSalesReportSubscription({
      weekly_enabled: true,
      daily_enabled: false,
    });

    expect(bffRequest).toHaveBeenCalledWith("/api/account/sales-report-subscription", {
      method: "PATCH",
      body: { weekly_enabled: true, daily_enabled: false },
    });
    expect(subscription.weekly_enabled).toBe(true);
  });

  it("unsubscribes using a token", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      subscription: {
        daily_enabled: false,
        weekly_enabled: false,
        monthly_enabled: false,
        is_active: false,
        updated_at: "2026-07-10T00:00:00Z",
      },
      message: "You have been unsubscribed from sales report emails.",
    });

    const response = await unsubscribeFromSalesReports({
      token: "00000000-0000-0000-0000-000000000001",
    });

    expect(bffRequest).toHaveBeenCalledWith("/api/public/sales-reports/unsubscribe", {
      method: "POST",
      body: { token: "00000000-0000-0000-0000-000000000001" },
    });
    expect(response.message).toContain("unsubscribed");
  });

  it("fetches a user's subscription for admin management", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      subscription: {
        daily_enabled: true,
        weekly_enabled: false,
        monthly_enabled: false,
        is_active: true,
        is_blocked: false,
        updated_at: "2026-07-10T00:00:00Z",
      },
    });

    const subscription = await fetchUserSalesReportSubscription(42);

    expect(bffRequest).toHaveBeenCalledWith(
      "/api/user-management/42/sales-report-subscription",
    );
    expect(subscription.is_blocked).toBe(false);
  });

  it("updates a user's subscription for admin management", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      subscription: {
        daily_enabled: false,
        weekly_enabled: true,
        monthly_enabled: false,
        is_active: true,
        is_blocked: false,
        updated_at: "2026-07-10T00:00:00Z",
      },
    });

    const subscription = await updateUserSalesReportSubscription(42, {
      weekly_enabled: true,
    });

    expect(bffRequest).toHaveBeenCalledWith(
      "/api/user-management/42/sales-report-subscription",
      { method: "PATCH", body: { weekly_enabled: true } },
    );
    expect(subscription.weekly_enabled).toBe(true);
  });

  it("blocks and unblocks a user's report delivery", async () => {
    vi.mocked(bffRequest).mockReset();
    vi.mocked(bffRequest)
      .mockResolvedValueOnce({
        subscription: {
          daily_enabled: true,
          weekly_enabled: false,
          monthly_enabled: false,
          is_active: true,
          is_blocked: true,
          updated_at: "2026-07-10T00:00:00Z",
        },
      })
      .mockResolvedValueOnce({
        subscription: {
          daily_enabled: true,
          weekly_enabled: false,
          monthly_enabled: false,
          is_active: true,
          is_blocked: false,
          updated_at: "2026-07-10T00:00:00Z",
        },
      });

    const blocked = await blockUserSalesReports(42);
    const unblocked = await unblockUserSalesReports(42);

    expect(bffRequest).toHaveBeenNthCalledWith(
      1,
      "/api/user-management/42/sales-report-subscription/block",
      { method: "POST" },
    );
    expect(bffRequest).toHaveBeenNthCalledWith(
      2,
      "/api/user-management/42/sales-report-subscription/unblock",
      { method: "POST" },
    );
    expect(blocked.is_blocked).toBe(true);
    expect(unblocked.is_blocked).toBe(false);
  });
});
