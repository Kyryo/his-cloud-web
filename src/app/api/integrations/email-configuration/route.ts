import { EMAIL_CONFIGURATION_API_PATHS } from "@/constants/email-configuration-api";
import { createTenantEmailConfigurationBodySchema } from "@/features/settings/schemas/email-configuration.schema";
import type { TenantEmailConfiguration } from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest, hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { parseJsonBody } from "@/lib/server/parse-json-body";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

function normalizeReplyTo(replyTo?: string) {
  const trimmed = replyTo?.trim();
  return trimmed ? trimmed : undefined;
}

export async function GET() {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const { data, meta } = await hmisApiRequestWithMeta<TenantEmailConfiguration[]>(
      `${EMAIL_CONFIGURATION_API_PATHS.list}?page_size=1`,
      { token: admin.accessToken },
    );

    return bffSuccess({
      configuration: data[0] ?? null,
      pagination: meta.pagination ?? null,
    });
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const parsed = await parseJsonBody(request, createTenantEmailConfigurationBodySchema);
    if ("error" in parsed) {
      return parsed.error;
    }

    const body = parsed.data;

    const configuration = await hmisApiRequest<TenantEmailConfiguration>(
      EMAIL_CONFIGURATION_API_PATHS.list,
      {
        method: "POST",
        token: admin.accessToken,
        body: {
          ...body,
          reply_to: normalizeReplyTo(body.reply_to),
        },
      },
    );

    return bffSuccess({ configuration }, 201);
  } catch (error) {
    return bffError(error);
  }
}
