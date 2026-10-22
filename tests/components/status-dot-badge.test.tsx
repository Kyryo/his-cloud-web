import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { StatusDotBadge } from "@/components/ui/status-dot-badge";
import { AppointmentStatusBadge } from "@/features/appointments/components/AppointmentStatusBadge";
import { CustomerVisitStatusBadge } from "@/features/customers/components/CustomerVisitStatusBadge";
import { ReferralStatusBadge } from "@/features/referrals/components/ReferralStatusBadge";

afterEach(() => {
  cleanup();
});

describe("StatusDotBadge", () => {
  it("renders every tone with a border and a status dot", () => {
    const tones = ["success", "primary", "info", "warning", "danger", "neutral"] as const;
    render(
      <div>
        {tones.map((tone) => (
          <StatusDotBadge key={tone} tone={tone}>
            {tone}
          </StatusDotBadge>
        ))}
      </div>,
    );

    for (const tone of tones) {
      const badge = screen.getByText(tone);
      expect(badge).toHaveAttribute("data-tone", tone);
      expect(badge.className).toContain("border");
      expect(badge.className).not.toContain("border-transparent");
      expect(badge.querySelector("span[aria-hidden='true']")).not.toBeNull();
    }
  });
});

describe("status badges built on StatusDotBadge", () => {
  it("keeps the clients visit status tones", () => {
    render(
      <div>
        <CustomerVisitStatusBadge status="active" />
        <CustomerVisitStatusBadge status="completed" />
        <CustomerVisitStatusBadge status="cancelled" />
        <CustomerVisitStatusBadge status="not_started" />
      </div>,
    );

    expect(screen.getByText("Active")).toHaveAttribute("data-tone", "success");
    expect(screen.getByText("Completed")).toHaveAttribute("data-tone", "primary");
    expect(screen.getByText("Cancelled")).toHaveAttribute("data-tone", "danger");
    expect(screen.getByText("Not started")).toHaveAttribute("data-tone", "neutral");
  });

  it("maps appointment statuses to tones", () => {
    render(
      <div>
        <AppointmentStatusBadge status="scheduled" />
        <AppointmentStatusBadge status="confirmed" />
        <AppointmentStatusBadge status="in_progress" />
        <AppointmentStatusBadge status="completed" />
        <AppointmentStatusBadge status="no_show" />
        <AppointmentStatusBadge status="rescheduled" />
      </div>,
    );

    expect(screen.getByText("Scheduled")).toHaveAttribute("data-tone", "neutral");
    expect(screen.getByText("Confirmed")).toHaveAttribute("data-tone", "info");
    expect(screen.getByText("In progress")).toHaveAttribute("data-tone", "success");
    expect(screen.getByText("Completed")).toHaveAttribute("data-tone", "primary");
    expect(screen.getByText("No show")).toHaveAttribute("data-tone", "danger");
    expect(screen.getByText("Rescheduled")).toHaveAttribute("data-tone", "warning");
  });

  it("maps referral statuses to tones", () => {
    render(
      <div>
        <ReferralStatusBadge status="SENT" />
        <ReferralStatusBadge status="IN_PROGRESS" />
        <ReferralStatusBadge status="REJECTED" />
      </div>,
    );

    expect(screen.getByText("Awaiting start")).toHaveAttribute("data-tone", "warning");
    expect(screen.getByText("In Progress")).toHaveAttribute("data-tone", "success");
    expect(screen.getByText("Rejected")).toHaveAttribute("data-tone", "danger");
  });
});
