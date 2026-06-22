import { ONBOARDING_API_PATHS } from "@/constants/onboarding-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type ModuleGroupChoice = {
  name: string;
  selected: boolean;
};

type ConfigureModulesBody = {
  groups?: string[];
};

export async function GET() {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const data = await hmisApiRequest<ModuleGroupChoice[]>(
      ONBOARDING_API_PATHS.modules,
      { token: auth.accessToken },
    );

    return bffSuccess(data, 200);
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const body = (await request.json()) as ConfigureModulesBody;
    if (!body.groups || body.groups.length === 0) {
      return bffSuccess({ message: "At least one module group is required." }, 400);
    }

    const data = await hmisApiRequest<unknown>(ONBOARDING_API_PATHS.modules, {
      method: "POST",
      token: auth.accessToken,
      body: { groups: body.groups },
    });

    return bffSuccess(data, 201);
  } catch (error) {
    return bffError(error);
  }
}
