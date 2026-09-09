import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppointmentsCalendarSkeleton } from "@/features/appointments/components/AppointmentsCalendarSkeleton";

describe("AppointmentsCalendarSkeleton", () => {
  it("renders a month grid placeholder", () => {
    render(<AppointmentsCalendarSkeleton visibleMonth={new Date(2026, 8, 1)} />);

    expect(screen.getByTestId("appointments-calendar-skeleton")).toBeInTheDocument();
    expect(screen.getByText("September 2026")).toBeInTheDocument();
    expect(screen.getByText("Loading calendar")).toBeInTheDocument();
    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("Sat")).toBeInTheDocument();
  });
});
