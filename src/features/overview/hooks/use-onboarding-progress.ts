"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchOnboardingProgress,
  setOnboardingDismissed,
  type OnboardingProgress,
} from "@/features/auth/services/onboarding.service";
import {
  overviewSetupMode,
  type OverviewSetupMode,
} from "@/features/overview/utils/overview-setup";

export const ONBOARDING_PROGRESS_QUERY_KEY = ["onboarding-progress"] as const;

export function useOnboardingProgress(isAdmin: boolean) {
  const queryClient = useQueryClient();
  const progress = useQuery({
    queryKey: ONBOARDING_PROGRESS_QUERY_KEY,
    queryFn: fetchOnboardingProgress,
    enabled: isAdmin,
    retry: false,
    refetchOnMount: "always",
  });

  const mode: OverviewSetupMode | "pending" =
    !isAdmin || progress.isError
      ? "hidden"
      : progress.isPending
        ? "pending"
        : overviewSetupMode(progress.data);

  async function setDismissed(dismissed: boolean): Promise<OnboardingProgress> {
    const previous = queryClient.getQueryData<OnboardingProgress>(
      ONBOARDING_PROGRESS_QUERY_KEY,
    );
    if (previous) {
      queryClient.setQueryData<OnboardingProgress>(ONBOARDING_PROGRESS_QUERY_KEY, {
        ...previous,
        dismissed_at: dismissed ? new Date().toISOString() : null,
      });
    }

    try {
      const next = await setOnboardingDismissed(dismissed);
      queryClient.setQueryData(ONBOARDING_PROGRESS_QUERY_KEY, next);
      return next;
    } catch (error) {
      if (previous) {
        queryClient.setQueryData(ONBOARDING_PROGRESS_QUERY_KEY, previous);
      }
      throw error;
    }
  }

  return { progress, mode, setDismissed };
}
