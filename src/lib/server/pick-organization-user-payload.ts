import type { UpdateOrganizationUserPayload } from "@/features/settings/types/settings.types";

const UPDATABLE_FIELDS = [
  "name",
  "email",
  "password",
  "user_role",
  "is_admin",
] as const satisfies ReadonlyArray<keyof UpdateOrganizationUserPayload>;

export function pickOrganizationUserPayload(
  body: UpdateOrganizationUserPayload,
): UpdateOrganizationUserPayload {
  const payload: UpdateOrganizationUserPayload = {};

  for (const field of UPDATABLE_FIELDS) {
    if (!(field in body)) {
      continue;
    }

    const value = body[field];
    if (field === "is_admin") {
      if (typeof value === "boolean") {
        payload.is_admin = value;
      }
      continue;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (field === "password" && trimmed === "") {
        continue;
      }
      if (field === "user_role") {
        payload.user_role = trimmed as UpdateOrganizationUserPayload["user_role"];
      } else {
        payload[field] = trimmed;
      }
    }
  }

  return payload;
}
