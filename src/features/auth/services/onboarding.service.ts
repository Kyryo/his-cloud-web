import { BFF_ONBOARDING_ROUTES } from "@/constants/api";
import { bffRequest } from "@/lib/bff-client";

export type ModuleGroupChoice = {
  name: string;
  selected: boolean;
};

export async function fetchOnboardingModules(): Promise<ModuleGroupChoice[]> {
  return bffRequest<ModuleGroupChoice[]>(BFF_ONBOARDING_ROUTES.modules);
}

export type OnboardingProgress = {
  status: "in_progress" | "completed";
  tenant_name: string;
  dismissed_at: string | null;
  completed_at: string | null;
  completed_steps: {
    clinic?: boolean;
    departments?: boolean;
    modules?: boolean;
    consultation_services?: boolean;
    catalog?: boolean;
    catalog_product?: boolean;
    catalog_pricelist?: boolean;
    insurance_payer?: boolean;
    insurance?: boolean;
    invites?: boolean;
  };
};

export async function fetchOnboardingProgress(): Promise<OnboardingProgress> {
  return bffRequest<OnboardingProgress>(BFF_ONBOARDING_ROUTES.progress);
}

export async function setOnboardingDismissed(
  dismissed: boolean,
): Promise<OnboardingProgress> {
  return bffRequest<OnboardingProgress>(BFF_ONBOARDING_ROUTES.dismiss, {
    method: "POST",
    body: { dismissed },
  });
}

export async function configureOnboardingModules(
  groups: string[],
): Promise<unknown> {
  return bffRequest(BFF_ONBOARDING_ROUTES.modules, {
    method: "POST",
    body: { groups },
  });
}
