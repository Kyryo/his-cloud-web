"use client";

import { OPD_WORKSPACE_ROUTING } from "@/features/clinical-opd/constants/opd-workspace-routing";
import { ClinicalQueuePage } from "@/features/clinical-opd/pages/ClinicalQueuePage";

export function OpdQueuePage() {
  return <ClinicalQueuePage routing={OPD_WORKSPACE_ROUTING} />;
}
