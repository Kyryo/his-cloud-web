import { EMAIL_CONFIGURATION_API_PATHS } from "@/constants/email-configuration-api";
import { updateTenantEmailConfigurationBodySchema } from "@/features/settings/schemas/email-configuration.schema";
import type { TenantEmailConfiguration } from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { parseJsonBody } from "@/lib/server/parse-json-body";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function normalizeReplyTo(replyTo?: string) {
  const trimmed = replyTo?.trim();
  return trimmed ? trimmed : undefined;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const { id } = await context.params;
    const parsed = await parseJsonBody(request, updateTenantEmailConfigurationBodySchema);
    if ("error" in parsed) {
      return parsed.error;
    }

    const body = parsed.data;

    const configuration = await hmisApiRequest<TenantEmailConfiguration>(
      EMAIL_CONFIGURATION_API_PATHS.detail(id),
      {
        method: "PATCH",
        token: admin.accessToken,
        body: {
          ...body,
          ...(body.reply_to !== undefined
            ? { reply_to: normalizeReplyTo(body.reply_to) }
            : {}),
        },
      },
    );

    return bffSuccess({ configuration });
  } catch (error) {
    return bffError(error);
  }
}
