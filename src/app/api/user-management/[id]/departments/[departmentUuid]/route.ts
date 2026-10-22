import { NextResponse } from "next/server";

import { USER_ASSOCIATIONS_API_PATHS } from "@/constants/user-associations-api";
import { bffError, bffNoContent } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

type RouteContext = {
  params: Promise<{ id: string; departmentUuid: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }
    const { id, departmentUuid } = await context.params;
    const userId = Number.parseInt(id, 10);
    if (!Number.isFinite(userId) || userId <= 0) {
      return NextResponse.json({ message: "Invalid user id." }, { status: 400 });
    }

    await hmisApiRequest<unknown>(
      USER_ASSOCIATIONS_API_PATHS.userDepartmentDetail(userId, departmentUuid),
      { method: "DELETE", token: admin.accessToken },
    );
    return bffNoContent();
  } catch (error) {
    return bffError(error);
  }
}
