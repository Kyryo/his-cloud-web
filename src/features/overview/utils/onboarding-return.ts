import { ROUTES } from "@/constants/routes";

export const ONBOARDING_RETURN_PARAM = "from";
export const ONBOARDING_RETURN_VALUE = "onboarding";

export function withOnboardingReturn(href: string): string {
  const url = new URL(href, "http://local");
  url.searchParams.set(ONBOARDING_RETURN_PARAM, ONBOARDING_RETURN_VALUE);
  return `${url.pathname}${url.search}`;
}

export function isOnboardingReturn(params: {
  get(name: string): string | null;
}): boolean {
  return params.get(ONBOARDING_RETURN_PARAM) === ONBOARDING_RETURN_VALUE;
}

export function onboardingOverviewHref(): string {
  return ROUTES.overview;
}
