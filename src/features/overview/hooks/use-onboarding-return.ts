"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { isOnboardingReturn } from "@/features/overview/utils/onboarding-return";

export function useOnboardingReturn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromOnboarding = isOnboardingReturn(searchParams);

  function finishSetup() {
    if (fromOnboarding) {
      router.push(ROUTES.overview);
    }
  }

  return { fromOnboarding, finishSetup };
}
