import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AppointmentsClinicianChip } from "@/features/appointments/components/AppointmentsClinicianChip";
import { getClinicianTone } from "@/features/appointments/utils/appointment-clinician-tones";

afterEach(() => {
  cleanup();
});

describe("AppointmentsClinicianChip", () => {
  it("shows a colored avatar and the clinician name", () => {
    render(<AppointmentsClinicianChip name="Dr. Vipin Vijayan" />);

    const tone = getClinicianTone("Dr. Vipin Vijayan");

    expect(screen.getByText("Dr. Vipin Vijayan")).toHaveClass(
      ...tone.name.split(" "),
    );
    expect(screen.getByText("DV")).toHaveClass(...tone.avatar.split(" "));
  });

  it("shows an unassigned avatar when no clinician is set", () => {
    render(<AppointmentsClinicianChip name={null} />);

    expect(screen.getByText("Unassigned")).toBeInTheDocument();
    expect(screen.getByText("?")).toBeInTheDocument();
  });
});
