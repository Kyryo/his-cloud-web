import { NextResponse } from "next/server";

import { TAGS_API_PATHS } from "@/constants/tags-api";
import type { Tag, UpdateTagPayload } from "@/features/tags/types/tag.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const { uuid } = await context.params;
    const body = (await request.json()) as UpdateTagPayload;

    if (body.name !== undefined && !body.name.trim()) {
      return NextResponse.json({ message: "Name cannot be empty." }, { status: 400 });
    }

    const tag = await hmisApiRequest<Tag>(TAGS_API_PATHS.detail(uuid), {
      method: "PATCH",
      token: admin.accessToken,
      body,
    });

    return bffSuccess(tag);
  } catch (error) {
    return bffError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const { uuid } = await context.params;
    await hmisApiRequest<null>(TAGS_API_PATHS.detail(uuid), {
      method: "DELETE",
      token: admin.accessToken,
    });

    return bffSuccess(null, 204);
  } catch (error) {
    return bffError(error);
  }
}
