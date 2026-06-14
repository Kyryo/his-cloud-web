import { getValidAccessToken } from "@/lib/server/auth-cookies";
import { resolveSession } from "@/lib/server/session";
import type { User } from "@/features/auth/types/auth.types";

const THERAPY_GROUPS = {
  speech: "Speech",
  physio: "Physio",
  occupational: "Occupational",
} as const;

export type ServerTherapyDiscipline = keyof typeof THERAPY_GROUPS;

export function isServerTherapyDiscipline(
  value: string | null,
): value is ServerTherapyDiscipline {
  return value !== null && Object.hasOwn(THERAPY_GROUPS, value);
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

  if (!session.user.groups.includes(THERAPY_GROUPS[discipline])) {
    return {
      error: `You must belong to the ${THERAPY_GROUPS[discipline]} group.`,
      status: 403,
    };
  }

  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return { error: "Not authenticated.", status: 401 };
  }

  return { accessToken, user: session.user };
}
