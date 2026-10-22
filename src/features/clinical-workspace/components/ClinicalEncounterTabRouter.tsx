"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import type { ClinicalWorkspaceConfig } from "@/features/clinical-workspace/types/clinical-workspace.types";
import { workspaceTabHref } from "@/features/clinical-workspace/utils/workspace-tabs";

type ClinicalEncounterTabRouterProps = {
  config: ClinicalWorkspaceConfig;
  tab: string;
  visitUuid: string;
  encounterUuid: string;
  visibleTabIds: readonly string[];
};

/**
 * Renders the specialty panel for `tab`, or forwards to the first section the
 * user may open when the tab is hidden for their role.
 */
export function ClinicalEncounterTabRouter({
  config,
  tab,
  visitUuid,
  encounterUuid,
  visibleTabIds,
}: ClinicalEncounterTabRouterProps) {
  const router = useRouter();
  const canViewTab = visibleTabIds.includes(tab);

  useEffect(() => {
    if (canViewTab || visibleTabIds.length === 0) {
      return;
    }
    router.replace(
      workspaceTabHref(config, visitUuid, encounterUuid, visibleTabIds[0]),
    );
  }, [canViewTab, config, encounterUuid, router, visitUuid, visibleTabIds]);

  if (!canViewTab) {
    return null;
  }

  const Panel = config.panels[tab];
  if (!Panel) {
    return null;
  }
  return <Panel visitUuid={visitUuid} encounterUuid={encounterUuid} isActive />;
}
