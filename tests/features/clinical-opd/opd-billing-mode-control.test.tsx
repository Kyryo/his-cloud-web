import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OpdEncounterBillingModeControl } from "@/features/clinical-opd/components/detail/OpdEncounterBillingModeControl";

const fetchVisitEncounters = vi.fn();
const changeVisitEncounterBillingMode = vi.fn();
const toast = vi.fn();

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast }),
}));

vi.mock("@/features/visits/services/visits.service", () => ({
  fetchVisitEncounters: (...args: unknown[]) => fetchVisitEncounters(...args),
  changeVisitEncounterBillingMode: (...args: unknown[]) =>
    changeVisitEncounterBillingMode(...args),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("OpdEncounterBillingModeControl", () => {
  beforeEach(() => {
    fetchVisitEncounters.mockResolvedValue([
      {
        uuid: "enc-1",
        status: "in_progress",
        billing_mode: "shared_visit",
        department_name: "OPD",
      },
    ]);
    changeVisitEncounterBillingMode.mockResolvedValue({
      uuid: "enc-1",
      status: "in_progress",
      billing_mode: "separate_department",
      department_name: "OPD",
    });
  });

  it("shows current billing mode and confirms before saving a change", async () => {
    render(
      <OpdEncounterBillingModeControl
        visitUuid="visit-1"
        encounterUuid="enc-1"
      />,
    );

    expect(
      await screen.findByText("One bill for this visit"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("opd-change-billing-mode"));
    fireEvent.click(
      screen.getByTestId("opd-billing-mode-option-separate_department"),
    );
    fireEvent.click(screen.getByTestId("opd-billing-mode-save"));

    expect(
      await screen.findByText("Change billing mode?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Charge lines for this department encounter will move/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("opd-billing-mode-confirm"));

    await waitFor(() => {
      expect(changeVisitEncounterBillingMode).toHaveBeenCalledWith(
        "visit-1",
        "enc-1",
        { billing_mode: "separate_department" },
      );
    });
  });
});
