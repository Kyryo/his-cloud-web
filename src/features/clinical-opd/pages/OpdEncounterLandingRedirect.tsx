"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { useWorkspaceRouting } from "@/features/clinical-opd/hooks/use-workspace-routing";
import {
  getDefaultWorkspaceTab,
  workspaceTabHref,
} from "@/features/clinical-workspace/utils/workspace-tabs";

/**
 * The bare encounter URL has no section of its own. It forwards to whichever
 * tab the user's clinical role starts on.
 */
export function OpdEncounterLandingRedirect() {
  const router = useRouter();
  const routing = useWorkspaceRouting();
  const { visitUuid, encounterUuid, visibleTabIds, capabilities, userRole } =
    useOpdEncounterWorkspace();
  const defaultTab = getDefaultWorkspaceTab(routing, capabilities, userRole);

  useEffect(() => {
    if (visibleTabIds.length === 0) {
      return;
    }
    router.replace(workspaceTabHref(routing, visitUuid, encounterUuid, defaultTab));
  }, [defaultTab, encounterUuid, router, routing, visibleTabIds, visitUuid]);

  return <OpdEncounterTabSkeleton rows={4} />;
}
