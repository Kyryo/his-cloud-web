import { NextResponse } from "next/server";

import { USER_ASSOCIATIONS_API_PATHS } from "@/constants/user-associations-api";
import type { UserDepartmentMembership } from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseUserId(raw: string): number | null {
  const userId = Number.parseInt(raw, 10);
  return Number.isFinite(userId) && userId > 0 ? userId : null;
}

function invalidUserResponse() {
  return NextResponse.json({ message: "Invalid user id." }, { status: 400 });
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }
    const userId = parseUserId((await context.params).id);
    if (userId === null) {
      return invalidUserResponse();
    }

    const results = await hmisApiRequest<UserDepartmentMembership[]>(
      USER_ASSOCIATIONS_API_PATHS.userDepartments(userId),
      { token: admin.accessToken },
    );
    return bffSuccess({ results });
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }
    const userId = parseUserId((await context.params).id);
    if (userId === null) {
      return invalidUserResponse();
    }

    const body = (await request.json()) as { department_uuid?: unknown };
    if (typeof body.department_uuid !== "string" || !body.department_uuid) {
      return NextResponse.json(
        { message: "Department is required." },
        { status: 400 },
      );
    }

    const membership = await hmisApiRequest<UserDepartmentMembership>(
      USER_ASSOCIATIONS_API_PATHS.userDepartments(userId),
      {
        method: "POST",
        token: admin.accessToken,
        body: { department_uuid: body.department_uuid },
      },
    );
    return bffSuccess(membership, 201);
  } catch (error) {
    return bffError(error);
  }
}
