"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { OpdActivityTabPanel } from "@/features/clinical-opd/components/tabs/OpdActivityTabPanel";
import { OpdClientTabPanel } from "@/features/clinical-opd/components/tabs/OpdClientTabPanel";
import { OpdDiagnosesTabPanel } from "@/features/clinical-opd/components/tabs/OpdDiagnosesTabPanel";
import { OpdMedicationsTabPanel } from "@/features/clinical-opd/components/tabs/OpdMedicationsTabPanel";
import { OpdOrdersTabPanel } from "@/features/clinical-opd/components/tabs/OpdOrdersTabPanel";
import { OpdPhysicalExaminationTabPanel } from "@/features/clinical-opd/components/tabs/OpdPhysicalExaminationTabPanel";
import { OpdVitalSignsTabPanel } from "@/features/clinical-opd/components/tabs/OpdVitalSignsTabPanel";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import type { OpdEncounterTabId } from "@/features/clinical-opd/utils/opd-encounter-tabs";
import { opdEncounterTabHref } from "@/features/clinical-opd/utils/opd-encounter-tabs";

type OpdEncounterTabPageProps = {
  tab: OpdEncounterTabId;
};

export function OpdEncounterTabPage({ tab }: OpdEncounterTabPageProps) {
  const router = useRouter();
  const { visitUuid, encounterUuid, visibleTabIds } = useOpdEncounterWorkspace();

  const canViewTab = visibleTabIds.includes(tab);

  useEffect(() => {
    if (canViewTab || visibleTabIds.length === 0) {
      return;
    }

    router.replace(
      opdEncounterTabHref(visitUuid, encounterUuid, visibleTabIds[0]),
    );
  }, [canViewTab, encounterUuid, router, visitUuid, visibleTabIds]);

  if (!canViewTab) {
    return null;
  }

  switch (tab) {
    case "vital-signs":
      return (
        <OpdVitalSignsTabPanel
          visitUuid={visitUuid}
          encounterUuid={encounterUuid}
          isActive
        />
      );
    case "physical-examination":
      return (
        <OpdPhysicalExaminationTabPanel
          visitUuid={visitUuid}
          encounterUuid={encounterUuid}
          isActive
        />
      );
    case "orders":
      return (
        <OpdOrdersTabPanel
          visitUuid={visitUuid}
          encounterUuid={encounterUuid}
          isActive
        />
      );
    case "diagnoses":
      return (
        <OpdDiagnosesTabPanel
          visitUuid={visitUuid}
          encounterUuid={encounterUuid}
          isActive
        />
      );
    case "medications":
      return (
        <OpdMedicationsTabPanel
          visitUuid={visitUuid}
          encounterUuid={encounterUuid}
          isActive
        />
      );
    case "activity":
      return (
        <OpdActivityTabPanel
          visitUuid={visitUuid}
          encounterUuid={encounterUuid}
          isActive
        />
      );
    case "client":
      return <OpdClientTabPanel isActive />;
  }
}
