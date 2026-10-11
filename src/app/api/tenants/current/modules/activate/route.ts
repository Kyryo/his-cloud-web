import { NextResponse } from "next/server";

import { TENANTS_API_PATHS } from "@/constants/tenants-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

export async function POST(request: Request) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const body = (await request.json()) as { name?: string };
    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json(
        { message: "A module name is required." },
        { status: 400 },
      );
    }

    const result = await hmisApiRequest(TENANTS_API_PATHS.activateModule(admin.tenantUuid), {
      method: "POST",
      token: admin.accessToken,
      body: { name },
    });
    return bffSuccess(result);
  } catch (error) {
    return bffError(error);
  }
}
