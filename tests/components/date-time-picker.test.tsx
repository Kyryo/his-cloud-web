import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DateTimePicker } from "@/components/ui/date-time-picker";
import { formatDateTimePickerLabel } from "@/lib/date-time-local";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

beforeEach(() => {
  vi.useRealTimers();
});

function DateTimePickerHarness({
  initialValue = "2026-09-18T15:47",
}: {
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);
  return <DateTimePicker value={value} onChange={setValue} data-testid="picker" />;
}

describe("DateTimePicker", () => {
  it("shows a readable trigger instead of a native datetime input", () => {
    render(<DateTimePickerHarness />);

    expect(screen.getByTestId("picker")).toHaveTextContent("18 Sep 2026, 15:47");
    expect(document.querySelector("input[type='datetime-local']")).toBeNull();
  });

  it("opens a calendar and time list, then applies Now", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 18, 16, 5));

    render(<DateTimePickerHarness />);

    fireEvent.click(screen.getByTestId("picker"));

    expect(screen.getByText("Time")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "15 hours" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "47 minutes" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Now" }));

    expect(screen.getByTestId("picker")).toHaveTextContent(
      formatDateTimePickerLabel(new Date(2026, 8, 18, 16, 5)),
    );
  });
});
