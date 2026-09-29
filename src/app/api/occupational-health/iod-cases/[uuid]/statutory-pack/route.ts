import { OCCUPATIONAL_HEALTH_API_PATHS } from "@/constants/occupational-health-api";
import { ohStatutoryPackHandler } from "@/lib/server/occupational-health-bff";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { uuid } = await context.params;
  return ohStatutoryPackHandler(
    OCCUPATIONAL_HEALTH_API_PATHS.iodCaseStatutoryPack(uuid),
  );
}
