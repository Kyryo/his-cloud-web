import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TeamSwitcher } from "@/components/team-switcher";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ROUTES } from "@/constants/routes";
import { useWorkspaceStore } from "@/state/workspace.store";

const mockUserData = {
  id: 1,
  name: "Dr. Gregory House",
  email: "house@ppth.org",
  is_admin: true,
  is_superuser: false,
  tenant: {
    id: 10,
    uuid: "tenant-10",
    name: "Princeton-Plainsboro",
    code: "PPTH",
    is_active: true,
  },
  clinics: [
    {
      id: 101,
      clinic: 1,
      clinic_name: "Diagnostics Department",
      clinic_code: "DIAG",
      tenant_name: "Princeton-Plainsboro",
      role: "Department Head",
      is_primary: true,
      is_active: true,
    },
    {
      id: 102,
      clinic: 2,
      clinic_name: "Walk-in Clinic",
      clinic_code: "WALK",
      tenant_name: "Princeton-Plainsboro",
      role: "Physician",
      is_primary: false,
      is_active: true,
    },
  ],
  primary_clinic: {
    id: 1,
    name: "Diagnostics Department",
    code: "DIAG",
    tenant_name: "Princeton-Plainsboro",
  },
};

vi.mock("@/providers/user-provider", () => ({
  useUser: () => ({
    userData: mockUserData,
    isLoading: false,
    refreshUser: vi.fn(),
  }),
}));

vi.mock("@/features/settings/services/settings.service", () => ({
  fetchOrganizationBranding: vi.fn().mockResolvedValue({
    branding_logo_url: "",
    branding_primary_color: "",
    branding_secondary_color: "",
    branding_accent_color: "",
  }),
}));

function renderTeamSwitcher() {
  return render(
    <SidebarProvider>
      <TeamSwitcher />
    </SidebarProvider>,
  );
}

describe("TeamSwitcher", () => {
  beforeEach(() => {
    useWorkspaceStore.getState().reset();
    useWorkspaceStore.getState().hydrateFromUser(mockUserData as never);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the tenant name and active clinic in the trigger", () => {
    renderTeamSwitcher();

    const trigger = screen.getByTestId("sidebar-team-switcher-trigger");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("Princeton-Plainsboro");
    expect(trigger).toHaveTextContent("Diagnostics Department");
    expect(trigger).toHaveTextContent("PP");
  });

  it("opens a clinic list and organization settings link", () => {
    renderTeamSwitcher();

    fireEvent.click(screen.getByTestId("sidebar-team-switcher-trigger"));

    const popover = screen.getByTestId("sidebar-team-switcher-popover");
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveTextContent("Diagnostics Department");
    expect(popover).toHaveTextContent("Walk-in Clinic");
    expect(screen.getByRole("link", { name: "Organization settings" })).toHaveAttribute(
      "href",
      ROUTES.settingsOrganization,
    );
  });

  it("switches the active clinic when a clinic option is clicked", () => {
    renderTeamSwitcher();

    fireEvent.click(screen.getByTestId("sidebar-team-switcher-trigger"));
    fireEvent.click(screen.getByTestId("clinic-option-2"));

    expect(useWorkspaceStore.getState().activeClinicId).toBe(2);
  });
});
