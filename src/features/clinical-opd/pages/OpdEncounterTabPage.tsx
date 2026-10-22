"use client";

import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { OPD_WORKSPACE_CONFIG } from "@/features/clinical-opd/config/opd-workspace.config";
import type { OpdEncounterTabId } from "@/features/clinical-opd/utils/opd-encounter-tabs";
import { ClinicalEncounterTabRouter } from "@/features/clinical-workspace/components/ClinicalEncounterTabRouter";
import { useOptionalClinicalWorkspaceConfig } from "@/features/clinical-workspace/components/clinical-workspace-config-context";

type EncounterTabPageProps = {
  tab: string;
};

/** Renders one section of the surrounding specialty encounter workspace. */
export function EncounterTabPage({ tab }: EncounterTabPageProps) {
  const { visitUuid, encounterUuid, visibleTabIds } = useOpdEncounterWorkspace();
  const config = useOptionalClinicalWorkspaceConfig() ?? OPD_WORKSPACE_CONFIG;

  return (
    <ClinicalEncounterTabRouter
      config={config}
      tab={tab}
      visitUuid={visitUuid}
      encounterUuid={encounterUuid}
      visibleTabIds={visibleTabIds}
    />
  );
}

type OpdEncounterTabPageProps = {
  tab: OpdEncounterTabId;
};

export function OpdEncounterTabPage({ tab }: OpdEncounterTabPageProps) {
  return <EncounterTabPage tab={tab} />;
}
