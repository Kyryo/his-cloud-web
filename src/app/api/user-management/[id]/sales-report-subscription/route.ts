import { SALES_REPORT_SUBSCRIPTION_API_PATHS } from "@/constants/sales-report-subscription-api";
import { adminUpdateSalesReportSubscriptionBodySchema } from "@/features/notifications/schemas/sales-report-subscription.schema";
import type { SalesReportSubscription } from "@/features/notifications/types/sales-report-subscription.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { parseJsonBody } from "@/lib/server/parse-json-body";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseUserId(id: string): number | null {
  const userId = Number.parseInt(id, 10);
  return Number.isFinite(userId) ? userId : null;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const { id } = await context.params;
    const userId = parseUserId(id);
    if (userId === null) {
      return bffSuccess({ message: "Invalid user id." }, 400);
    }

    const data = await hmisApiRequest<{ subscription: SalesReportSubscription }>(
      SALES_REPORT_SUBSCRIPTION_API_PATHS.user(userId),
      { token: admin.accessToken },
    );

    return bffSuccess({ subscription: data.subscription });
  } catch (error) {
    return bffError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const { id } = await context.params;
    const userId = parseUserId(id);
    if (userId === null) {
      return bffSuccess({ message: "Invalid user id." }, 400);
    }

    const parsed = await parseJsonBody(
      request,
      adminUpdateSalesReportSubscriptionBodySchema,
    );
    if ("error" in parsed) {
      return parsed.error;
    }

    const data = await hmisApiRequest<{ subscription: SalesReportSubscription }>(
      SALES_REPORT_SUBSCRIPTION_API_PATHS.user(userId),
      {
        method: "PATCH",
        token: admin.accessToken,
        body: parsed.data,
      },
    );

    return bffSuccess({ subscription: data.subscription });
  } catch (error) {
    return bffError(error);
  }
}
