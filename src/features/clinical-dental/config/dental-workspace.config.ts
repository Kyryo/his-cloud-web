import { DentalChartTabPanel } from "@/features/clinical-dental/components/DentalChartTabPanel";
import { DentalNotesTabPanel } from "@/features/clinical-dental/components/DentalNotesTabPanel";
import { DentalProceduresHistorySection } from "@/features/clinical-dental/components/DentalHistorySections";
import { DentalHistoryTabPanel } from "@/features/clinical-dental/components/DentalHistoryTabPanel";
import { DentalTreatmentPlanTabPanel } from "@/features/clinical-dental/components/DentalTreatmentPlanTabPanel";
import { DentalTreatmentTabPanel } from "@/features/clinical-dental/components/DentalTreatmentTabPanel";
import {
  DENTAL_HISTORY_ALLOWED_SECTIONS,
  DENTAL_HISTORY_SECTION_IDS,
  DENTAL_WORKSPACE_ROUTING,
  type DentalEncounterTabId,
} from "@/features/clinical-dental/constants/dental-workspace-routing";
import { SHARED_CLINICAL_PANELS } from "@/features/clinical-opd/config/opd-workspace.config";
import type { ClinicalWorkspaceConfig } from "@/features/clinical-workspace/types/clinical-workspace.types";

export const DENTAL_WORKSPACE_CONFIG: ClinicalWorkspaceConfig<DentalEncounterTabId> = {
  ...DENTAL_WORKSPACE_ROUTING,
  panels: {
    overview: SHARED_CLINICAL_PANELS.overview,
    activity: SHARED_CLINICAL_PANELS.activity,
    complaint: SHARED_CLINICAL_PANELS.complaint,
    notes: DentalNotesTabPanel,
    orders: SHARED_CLINICAL_PANELS.orders,
    treatment: DentalTreatmentTabPanel,
    medications: SHARED_CLINICAL_PANELS.medications,
    "physical-examination": SHARED_CLINICAL_PANELS["physical-examination"],
    "dental-chart": DentalChartTabPanel,
    "treatment-plan": DentalTreatmentPlanTabPanel,
    diagnoses: SHARED_CLINICAL_PANELS.diagnoses,
    "vital-signs": SHARED_CLINICAL_PANELS["vital-signs"],
    allergies: SHARED_CLINICAL_PANELS.allergies,
    "dental-history": DentalHistoryTabPanel,
    disposition: SHARED_CLINICAL_PANELS.disposition,
    client: SHARED_CLINICAL_PANELS.client,
  },
  historyAllowedSections: DENTAL_HISTORY_ALLOWED_SECTIONS,
  historySections: [
    {
      id: DENTAL_HISTORY_SECTION_IDS.procedures,
      label: "Treatment",
      Component: DentalProceduresHistorySection,
    },
  ],
};
