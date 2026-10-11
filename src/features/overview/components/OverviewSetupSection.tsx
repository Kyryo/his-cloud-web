"use client";

import { useEffect } from "react";

import { OverviewSetupGuide } from "@/features/overview/components/OverviewSetupGuide";
import { SetupCompleteDialog } from "@/features/overview/components/SetupCompleteDialog";
import { useOnboardingProgress } from "@/features/overview/hooks/use-onboarding-progress";
import type { OverviewSetupMode } from "@/features/overview/utils/overview-setup";

type OverviewSetupSectionProps = {
  isAdmin: boolean;
  present?: boolean;
  onMode: (mode: OverviewSetupMode | "pending") => void;
};

export function OverviewSetupSection({
  isAdmin,
  present = true,
  onMode,
}: OverviewSetupSectionProps) {
  const { progress, mode, setDismissed } = useOnboardingProgress(isAdmin);

  useEffect(() => {
    onMode(mode);
  }, [mode, onMode]);

  if (!present || !isAdmin || !progress.data || mode === "hidden" || mode === "resume") {
    return null;
  }

  if (mode === "ready") {
    return (
      <SetupCompleteDialog
        clinicName={progress.data.tenant_name}
        completedAt={progress.data.completed_at}
      />
    );
  }

  return (
    <OverviewSetupGuide
      progress={progress.data}
      onDismiss={(dismissed) => {
        void setDismissed(dismissed);
      }}
    />
  );
}
