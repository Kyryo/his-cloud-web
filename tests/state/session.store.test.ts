import { beforeEach, describe, expect, it, vi } from "vitest";

import type { User } from "@/features/auth/types/auth.types";
import { useSessionStore } from "@/state/session.store";
import { useWorkspaceStore } from "@/state/workspace.store";

vi.mock("@/features/auth/services/auth.service", () => ({
  bootstrapSession: vi.fn(),
  getCurrentUser: vi.fn(),
}));

import { bootstrapSession } from "@/features/auth/services/auth.service";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    name: "Ada Lovelace",
    url: "/users/1",
    email: "ada@example.com",
    permissions: {},
    is_admin: false,
    location: null,
    groups: ["Registration"],
    tenant: {
      id: 9,
      uuid: "tenant-9",
      name: "Sigma Clinic",
      code: "SIG",
      is_active: true,
    },
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
    ...overrides,
  };
}

describe("session.store", () => {
  beforeEach(() => {
    useSessionStore.getState().reset();
    vi.clearAllMocks();
  });

  it("hydrates the user once and keeps later initialize calls from refetching", async () => {
    const user = makeUser();
    vi.mocked(bootstrapSession).mockResolvedValue(user);

    await useSessionStore.getState().initialize();
    await useSessionStore.getState().initialize();

    expect(bootstrapSession).toHaveBeenCalledTimes(1);
    expect(useSessionStore.getState().status).toBe("ready");
    expect(useSessionStore.getState().user?.email).toBe("ada@example.com");
    expect(useWorkspaceStore.getState().activeClinicId).toBe(4);
  });

  it("marks the session unauthenticated when bootstrap returns no user", async () => {
    vi.mocked(bootstrapSession).mockResolvedValue(null);

    await useSessionStore.getState().initialize();

    expect(useSessionStore.getState()).toMatchObject({
      user: null,
      status: "unauthenticated",
    });
  });

  it("reset clears session and workspace state", () => {
    useSessionStore.getState().hydrate(makeUser());
    useWorkspaceStore.getState().setNavSectionOpen("Front Desk", true);

    useSessionStore.getState().reset();

    expect(useSessionStore.getState()).toMatchObject({
      user: null,
      status: "idle",
    });
    expect(useWorkspaceStore.getState().openNavSections).toEqual({});
    expect(useWorkspaceStore.getState().activeClinicId).toBeNull();
  });
});
