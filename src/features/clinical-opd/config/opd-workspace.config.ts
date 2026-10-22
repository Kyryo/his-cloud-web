import type { ComponentType } from "react";

import { OpdActivityTabPanel } from "@/features/clinical-opd/components/tabs/OpdActivityTabPanel";
import { OpdAllergiesTabPanel } from "@/features/clinical-opd/components/tabs/OpdAllergiesTabPanel";
import { OpdClientTabPanel } from "@/features/clinical-opd/components/tabs/OpdClientTabPanel";
import { OpdComplaintTabPanel } from "@/features/clinical-opd/components/tabs/OpdComplaintTabPanel";
import { OpdDiagnosesTabPanel } from "@/features/clinical-opd/components/tabs/OpdDiagnosesTabPanel";
import { OpdDispositionTabPanel } from "@/features/clinical-opd/components/tabs/OpdDispositionTabPanel";
import { OpdInvestigationResultsTabPanel } from "@/features/clinical-opd/components/tabs/OpdInvestigationResultsTabPanel";
import { OpdMedicationsTabPanel } from "@/features/clinical-opd/components/tabs/OpdMedicationsTabPanel";
import { OpdNotesTabPanel } from "@/features/clinical-opd/components/tabs/OpdNotesTabPanel";
import { OpdNursingTabPanel } from "@/features/clinical-opd/components/tabs/OpdNursingTabPanel";
import { OpdOrdersTabPanel } from "@/features/clinical-opd/components/tabs/OpdOrdersTabPanel";
import { OpdOverviewTabPanel } from "@/features/clinical-opd/components/tabs/OpdOverviewTabPanel";
import { OpdPhysicalExaminationTabPanel } from "@/features/clinical-opd/components/tabs/OpdPhysicalExaminationTabPanel";
import { OpdProblemsTabPanel } from "@/features/clinical-opd/components/tabs/OpdProblemsTabPanel";
import { OpdVitalSignsTabPanel } from "@/features/clinical-opd/components/tabs/OpdVitalSignsTabPanel";
import {
  OPD_WORKSPACE_ROUTING,
  type OpdEncounterTabId,
} from "@/features/clinical-opd/constants/opd-workspace-routing";
import type {
  ClinicalWorkspaceConfig,
  ClinicalWorkspacePanelProps,
} from "@/features/clinical-workspace/types/clinical-workspace.types";

/** Shared clinical section panels, reused by every specialty workspace. */
export const SHARED_CLINICAL_PANELS = {
  activity: OpdActivityTabPanel,
  "vital-signs": OpdVitalSignsTabPanel,
  nursing: OpdNursingTabPanel,
  allergies: OpdAllergiesTabPanel,
  complaint: OpdComplaintTabPanel,
  "physical-examination": OpdPhysicalExaminationTabPanel,
  notes: OpdNotesTabPanel,
  orders: OpdOrdersTabPanel,
  "investigation-results": OpdInvestigationResultsTabPanel,
  diagnoses: OpdDiagnosesTabPanel,
  problems: OpdProblemsTabPanel,
  medications: OpdMedicationsTabPanel,
  disposition: OpdDispositionTabPanel,
  client: OpdClientTabPanel,
  overview: OpdOverviewTabPanel,
} as const satisfies Record<
  OpdEncounterTabId,
  ComponentType<ClinicalWorkspacePanelProps>
>;

export const OPD_WORKSPACE_CONFIG: ClinicalWorkspaceConfig<OpdEncounterTabId> = {
  ...OPD_WORKSPACE_ROUTING,
  panels: SHARED_CLINICAL_PANELS,
};
