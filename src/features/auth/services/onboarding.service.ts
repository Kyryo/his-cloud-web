import { BFF_ONBOARDING_ROUTES } from "@/constants/api";
import { bffRequest } from "@/lib/bff-client";

export type ModuleGroupChoice = {
  name: string;
  selected: boolean;
};

export async function fetchOnboardingModules(): Promise<ModuleGroupChoice[]> {
  return bffRequest<ModuleGroupChoice[]>(BFF_ONBOARDING_ROUTES.modules);
}

export async function configureOnboardingModules(
  groups: string[],
): Promise<unknown> {
  return bffRequest(BFF_ONBOARDING_ROUTES.modules, {
    method: "POST",
    body: { groups },
  });
}
