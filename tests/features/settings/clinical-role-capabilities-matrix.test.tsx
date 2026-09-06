import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ClinicalRoleCapabilitiesMatrix } from "@/features/settings/components/ClinicalRoleCapabilitiesMatrix";

afterEach(() => {
  cleanup();
});

describe("ClinicalRoleCapabilitiesMatrix", () => {
  it("compares nurse and physician access in one row", () => {
    render(
      <ClinicalRoleCapabilitiesMatrix
        capabilities={[
          {
            key: "view_activity_tab",
            label: "Activity",
            description: "Visit timeline and recent events",
          },
        ]}
        entries={[
          {
            uuid: "1",
            user_role: "nurse",
            capability: "view_activity_tab",
          },
        ]}
        updatingKey={null}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByRole("columnheader", { name: "Nurses" })).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Physicians" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Visit timeline and recent events")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Nurses: Activity" })).toBeChecked();
    expect(
      screen.getByRole("switch", { name: "Physicians: Activity" }),
    ).not.toBeChecked();
  });

  it("notifies when a role toggle changes", () => {
    const onToggle = vi.fn();

    render(
      <ClinicalRoleCapabilitiesMatrix
        capabilities={[
          {
            key: "view_activity_tab",
            label: "Activity",
            description: "Visit timeline and recent events",
          },
        ]}
        entries={[]}
        updatingKey={null}
        onToggle={onToggle}
      />,
    );

    fireEvent.click(screen.getByRole("switch", { name: "Physicians: Activity" }));

    expect(onToggle).toHaveBeenCalledWith("physician", "view_activity_tab", true);
  });
});
