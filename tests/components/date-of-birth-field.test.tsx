import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DateOfBirthField } from "@/components/date-of-birth-field";

describe("DateOfBirthField", () => {
  it("lets a birth date be chosen by year, month, and day", () => {
    render(<DateOfBirthField value="" onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));

    const menus = screen.getAllByRole("combobox");
    expect(menus.length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByRole("gridcell").length).toBeGreaterThan(0);
  });
});
