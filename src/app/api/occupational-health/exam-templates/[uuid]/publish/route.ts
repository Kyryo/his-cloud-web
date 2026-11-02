import { OCCUPATIONAL_HEALTH_API_PATHS } from "@/constants/occupational-health-api";
import { ohProxyPostHandler } from "@/lib/server/occupational-health-bff";

type RouteContext = { params: Promise<{ uuid: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { uuid } = await context.params;
  return ohProxyPostHandler(
    OCCUPATIONAL_HEALTH_API_PATHS.ohExamTemplatePublish(uuid),
    request,
    200,
  );
}
