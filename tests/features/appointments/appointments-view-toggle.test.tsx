import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppointmentsViewToggle } from "@/features/appointments/components/AppointmentsViewToggle";

afterEach(() => {
  cleanup();
});

describe("AppointmentsViewToggle", () => {
  it("offers table, board, and calendar views", () => {
    const onViewModeChange = vi.fn();

    render(
      <AppointmentsViewToggle
        viewMode="list"
        onViewModeChange={onViewModeChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /board/i }));
    expect(onViewModeChange).toHaveBeenCalledWith("board");

    fireEvent.click(screen.getByRole("button", { name: /calendar/i }));
    expect(onViewModeChange).toHaveBeenCalledWith("calendar");
  });
});
