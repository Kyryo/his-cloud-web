import { describe, expect, it, vi } from "vitest";

import {
  fetchAppointmentsReportSubscription,
  unsubscribeFromAppointmentsReports,
  updateAppointmentsReportSubscription,
} from "@/features/notifications/services/appointments-report-subscription.service";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

describe("appointments-report-subscription.service", () => {
  it("fetches the current subscription", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      subscription: {
        daily_enabled: true,
        is_active: true,
        is_blocked: false,
        updated_at: "2026-08-10T00:00:00Z",
      },
    });

    const subscription = await fetchAppointmentsReportSubscription();

    expect(bffRequest).toHaveBeenCalledWith(
      "/api/account/appointments-report-subscription",
    );
    expect(subscription.daily_enabled).toBe(true);
  });

  it("updates subscription preferences", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      subscription: {
        daily_enabled: false,
        is_active: true,
        is_blocked: false,
        updated_at: "2026-08-10T00:00:00Z",
      },
    });

    const subscription = await updateAppointmentsReportSubscription({
      daily_enabled: false,
    });

    expect(bffRequest).toHaveBeenCalledWith(
      "/api/account/appointments-report-subscription",
      {
        method: "PATCH",
        body: { daily_enabled: false },
      },
    );
    expect(subscription.daily_enabled).toBe(false);
  });

  it("unsubscribes using a token", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      subscription: {
        daily_enabled: false,
        is_active: false,
        is_blocked: false,
        updated_at: "2026-08-10T00:00:00Z",
      },
      message: "You have been unsubscribed from appointments report emails.",
    });

    const response = await unsubscribeFromAppointmentsReports({
      token: "11111111-1111-1111-1111-111111111111",
    });

    expect(bffRequest).toHaveBeenCalledWith(
      "/api/public/appointments-reports/unsubscribe",
      {
        method: "POST",
        body: { token: "11111111-1111-1111-1111-111111111111" },
      },
    );
    expect(response.message).toContain("unsubscribed");
  });
});
