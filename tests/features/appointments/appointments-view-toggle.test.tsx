import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import { AppointmentsViewToggle } from "@/features/appointments/components/AppointmentsViewToggle";

afterEach(() => {
  cleanup();
});

describe("AppointmentsViewToggle", () => {
  it("links table, board, and calendar views", () => {
    render(<AppointmentsViewToggle viewMode="list" />);

    expect(screen.getByRole("link", { name: /table/i })).toHaveAttribute(
      "href",
      ROUTES.appointments,
    );
    expect(screen.getByRole("link", { name: /board/i })).toHaveAttribute(
      "href",
      ROUTES.appointmentsBoard,
    );
    expect(screen.getByRole("link", { name: /calendar/i })).toHaveAttribute(
      "href",
      ROUTES.appointmentsCalendar,
    );
    expect(screen.getByRole("link", { name: /table/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
