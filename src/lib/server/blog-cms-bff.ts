import { bffSuccess } from "@/lib/server/bff-response";
import { HmisApiError } from "@/lib/server/hmis-api";
import { requirePlatformAdmin } from "@/lib/server/require-platform-admin";

export async function withBlogCmsAuth() {
  const auth = await requirePlatformAdmin();
  if ("error" in auth) {
    return { error: auth.error as Response };
  }
  return {
    user: auth.user,
    accessToken: auth.accessToken,
    actorEmail: auth.user.email || auth.user.name || "platform-admin",
  };
}

export function blogCmsError(error: unknown, fallback = "Blog CMS request failed.") {
  if (error instanceof HmisApiError) {
    return bffSuccess({ message: error.message }, error.status || 500);
  }
  const message = error instanceof Error ? error.message : fallback;
  const status = message.includes("already exists") || message.includes("required")
    ? 400
    : 500;
  return bffSuccess({ message }, status);
}
