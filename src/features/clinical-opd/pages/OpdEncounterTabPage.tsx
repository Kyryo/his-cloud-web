"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { OpdActivityTabPanel } from "@/features/clinical-opd/components/tabs/OpdActivityTabPanel";
import { OpdAllergiesTabPanel } from "@/features/clinical-opd/components/tabs/OpdAllergiesTabPanel";
import { OpdClientTabPanel } from "@/features/clinical-opd/components/tabs/OpdClientTabPanel";
import { OpdComplaintTabPanel } from "@/features/clinical-opd/components/tabs/OpdComplaintTabPanel";
import { OpdDiagnosesTabPanel } from "@/features/clinical-opd/components/tabs/OpdDiagnosesTabPanel";
import { OpdDispositionTabPanel } from "@/features/clinical-opd/components/tabs/OpdDispositionTabPanel";
import { OpdMedicationsTabPanel } from "@/features/clinical-opd/components/tabs/OpdMedicationsTabPanel";
import { OpdNotesTabPanel } from "@/features/clinical-opd/components/tabs/OpdNotesTabPanel";
import { OpdNursingTabPanel } from "@/features/clinical-opd/components/tabs/OpdNursingTabPanel";
import { OpdOrdersTabPanel } from "@/features/clinical-opd/components/tabs/OpdOrdersTabPanel";
import { OpdOverviewTabPanel } from "@/features/clinical-opd/components/tabs/OpdOverviewTabPanel";
import { OpdPhysicalExaminationTabPanel } from "@/features/clinical-opd/components/tabs/OpdPhysicalExaminationTabPanel";
import { OpdProblemsTabPanel } from "@/features/clinical-opd/components/tabs/OpdProblemsTabPanel";
import { OpdVitalSignsTabPanel } from "@/features/clinical-opd/components/tabs/OpdVitalSignsTabPanel";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import type { OpdEncounterTabId } from "@/features/clinical-opd/utils/opd-encounter-tabs";
import { opdEncounterTabHref } from "@/features/clinical-opd/utils/opd-encounter-tabs";

type OpdEncounterTabPageProps = {
  tab: OpdEncounterTabId;
};

export function OpdEncounterTabPage({ tab }: OpdEncounterTabPageProps) {
  const router = useRouter();
  const { visitUuid, encounterUuid, visibleTabIds } =
    useOpdEncounterWorkspace();

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
    case "nursing":
      return (
        <OpdNursingTabPanel
          visitUuid={visitUuid}
          encounterUuid={encounterUuid}
          isActive
        />
      );
    case "allergies":
      return (
        <OpdAllergiesTabPanel
          visitUuid={visitUuid}
          encounterUuid={encounterUuid}
          isActive
        />
      );
    case "complaint":
      return (
        <OpdComplaintTabPanel
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
    case "notes":
      return (
        <OpdNotesTabPanel
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
    case "problems":
      return (
        <OpdProblemsTabPanel
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
    case "disposition":
      return (
        <OpdDispositionTabPanel
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
    case "overview":
      return (
        <OpdOverviewTabPanel
          visitUuid={visitUuid}
          encounterUuid={encounterUuid}
          isActive
        />
      );
  }
}
