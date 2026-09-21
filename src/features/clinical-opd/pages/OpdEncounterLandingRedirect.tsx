"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import {
  getDefaultOpdEncounterTab,
  opdEncounterTabHref,
} from "@/features/clinical-opd/utils/opd-encounter-tabs";

/**
 * The bare encounter URL has no section of its own. It forwards to whichever
 * tab the user's clinical role starts on.
 */
export function OpdEncounterLandingRedirect() {
  const router = useRouter();
  const { visitUuid, encounterUuid, visibleTabIds, capabilities, userRole } =
    useOpdEncounterWorkspace();
  const defaultTab = getDefaultOpdEncounterTab(capabilities, userRole);

  useEffect(() => {
    if (visibleTabIds.length === 0) {
      return;
    }
    router.replace(opdEncounterTabHref(visitUuid, encounterUuid, defaultTab));
  }, [defaultTab, encounterUuid, router, visibleTabIds, visitUuid]);

  return <OpdEncounterTabSkeleton rows={4} />;
}
