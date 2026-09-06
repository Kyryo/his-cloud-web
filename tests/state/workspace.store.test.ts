import { beforeEach, describe, expect, it, vi } from "vitest";

import type { User } from "@/features/auth/types/auth.types";
import { useWorkspaceStore } from "@/state/workspace.store";

vi.mock("@/features/app-shell/utils/active-clinic", () => ({
  readActiveClinicId: vi.fn(() => null),
  writeActiveClinicId: vi.fn(),
}));

import { writeActiveClinicId } from "@/features/app-shell/utils/active-clinic";

function makeUser(): User {
  return {
    id: 1,
    name: "Ada Lovelace",
    url: "/users/1",
    email: "ada@example.com",
    permissions: {},
    is_admin: false,
    location: null,
    groups: [],
    tenant: null,
    clinics: [
      {
        id: 11,
        clinic: 4,
        clinic_name: "Main",
        clinic_code: "MAIN",
        tenant_name: "Sigma Clinic",
        role: "clinician",
        is_primary: true,
        is_active: true,
      },
      {
        id: 12,
        clinic: 7,
        clinic_name: "Annex",
        clinic_code: "ANX",
        tenant_name: "Sigma Clinic",
        role: "clinician",
        is_primary: false,
        is_active: true,
      },
    ],
    locations: null,
    primary_clinic: {
      id: 4,
      name: "Main",
      code: "MAIN",
      tenant: 9,
      tenant_name: "Sigma Clinic",
      is_active: true,
    },
    primary_location: null,
  };
}

describe("workspace.store", () => {
  beforeEach(() => {
    useWorkspaceStore.getState().reset();
    vi.clearAllMocks();
  });

  it("keeps an explicit clinic selection across later user hydrations", () => {
    const user = makeUser();
    useWorkspaceStore.getState().hydrateFromUser(user);
    useWorkspaceStore.getState().setActiveClinicId(7);

    useWorkspaceStore.getState().hydrateFromUser(user);

    expect(useWorkspaceStore.getState().activeClinicId).toBe(7);
    expect(writeActiveClinicId).toHaveBeenCalledWith(7);
  });

  it("persists nav section open state independently of route changes", () => {
    useWorkspaceStore.getState().setNavSectionOpen("Billing", true);
    useWorkspaceStore.getState().setNavSectionOpen("Front Desk", false);

    expect(useWorkspaceStore.getState().openNavSections).toEqual({
      Billing: true,
      "Front Desk": false,
    });
  });
});
