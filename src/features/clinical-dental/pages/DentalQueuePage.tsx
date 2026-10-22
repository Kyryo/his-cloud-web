"use client";

import { DENTAL_WORKSPACE_ROUTING } from "@/features/clinical-dental/constants/dental-workspace-routing";
import { ClinicalQueuePage } from "@/features/clinical-opd/pages/ClinicalQueuePage";

export function DentalQueuePage() {
  return <ClinicalQueuePage routing={DENTAL_WORKSPACE_ROUTING} />;
}
