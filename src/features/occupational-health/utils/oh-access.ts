import type { User } from "@/features/auth/types/auth.types";
import { isModuleEnabled } from "@/features/app-shell/utils/module-entitlements";

/** Match API IsOccupationalHealthUser: module + (group or tenant admin). */
export function canAccessOccupationalHealth(
  user: Pick<User, "groups" | "enabled_modules" | "is_admin"> | null | undefined,
): boolean {
  if (!isModuleEnabled(user, "OccupationalHealth")) {
    return false;
  }
  if (user?.is_admin) {
    return true;
  }
  return (user?.groups ?? []).includes("OccupationalHealth");
}
