import type { User } from "@/features/auth/types/auth.types";
import { readActiveClinicId } from "@/features/app-shell/utils/active-clinic";

export type UserClinic = NonNullable<User["clinics"]>[number];

export function getActiveClinics(user: User | null): UserClinic[] {
  return (user?.clinics ?? []).filter((clinic) => clinic.is_active);
}

export function resolveInitialClinicId(user: User | null): number | null {
  const clinics = getActiveClinics(user);
  if (clinics.length === 0) {
    return user?.primary_clinic?.id ?? null;
  }

  if (typeof window !== "undefined") {
    const storedId = readActiveClinicId();
    if (storedId && clinics.some((clinic) => clinic.clinic === storedId)) {
      return storedId;
    }
  }

  const primary = clinics.find((clinic) => clinic.is_primary);
  return primary?.clinic ?? clinics[0]?.clinic ?? user?.primary_clinic?.id ?? null;
}
