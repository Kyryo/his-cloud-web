import { getValidAccessToken } from "@/lib/server/auth-cookies";
import { resolveSession } from "@/lib/server/session";
import type { User } from "@/features/auth/types/auth.types";
import {
  canAccessTherapyDiscipline,
  isTherapyDiscipline,
  THERAPY_PORTAL_GROUP,
} from "@/features/therapy/utils/therapy-access";
import type { TherapyDiscipline } from "@/features/therapy/types/therapy.types";

export type ServerTherapyDiscipline = TherapyDiscipline;

export function isServerTherapyDiscipline(
  value: string | null,
): value is ServerTherapyDiscipline {
  return value !== null && isTherapyDiscipline(value);
}

export async function requireTherapyAccess(
  discipline: ServerTherapyDiscipline,
): Promise<
  | { accessToken: string; user: User }
  | { error: string; status: 401 | 403 }
> {
  const session = await resolveSession();
  if (!session.authenticated || !session.user) {
    return { error: "Not authenticated.", status: 401 };
  }

  const enabledModules = session.user.enabled_modules ?? [];
  if (!enabledModules.includes(THERAPY_PORTAL_GROUP)) {
    return {
      error: "Therapy is not enabled for this workspace.",
      status: 403,
    };
  }

  if (!canAccessTherapyDiscipline(session.user.groups, discipline)) {
    return {
      error: "You do not have access to this therapy discipline.",
      status: 403,
    };
  }

  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return { error: "Not authenticated.", status: 401 };
  }

  return { accessToken, user: session.user };
}
