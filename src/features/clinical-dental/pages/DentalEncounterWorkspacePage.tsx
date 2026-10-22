"use client";

import type { ReactNode } from "react";

import { DENTAL_WORKSPACE_CONFIG } from "@/features/clinical-dental/config/dental-workspace.config";
import { OpdEncounterWorkspacePage } from "@/features/clinical-opd/pages/OpdEncounterWorkspacePage";

type DentalEncounterWorkspacePageProps = {
  visitUuid: string;
  encounterUuid: string;
  children: ReactNode;
};

export function DentalEncounterWorkspacePage({
  visitUuid,
  encounterUuid,
  children,
}: DentalEncounterWorkspacePageProps) {
  return (
    <OpdEncounterWorkspacePage
      visitUuid={visitUuid}
      encounterUuid={encounterUuid}
      config={DENTAL_WORKSPACE_CONFIG}
    >
      {children}
    </OpdEncounterWorkspacePage>
  );
}
