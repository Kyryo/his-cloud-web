import { describe, expect, it, vi } from "vitest";

import type { User } from "@/features/auth/types/auth.types";
import {
  getActiveClinics,
  resolveInitialClinicId,
} from "@/features/app-shell/utils/workspace-clinics";

vi.mock("@/features/app-shell/utils/active-clinic", () => ({
  readActiveClinicId: vi.fn(() => 7),
  writeActiveClinicId: vi.fn(),
}));

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

describe("workspace-clinics", () => {
  it("prefers the stored clinic when it is still assigned", () => {
    expect(resolveInitialClinicId(makeUser())).toBe(7);
  });

  it("ignores inactive clinic associations", () => {
    const user = makeUser();
    user.clinics = (user.clinics ?? []).map((clinic) =>
      clinic.clinic === 7 ? { ...clinic, is_active: false } : clinic,
    );

    expect(getActiveClinics(user).map((clinic) => clinic.clinic)).toEqual([4]);
  });
});
