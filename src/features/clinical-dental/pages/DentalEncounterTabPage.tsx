"use client";

import type { DentalEncounterTabId } from "@/features/clinical-dental/constants/dental-workspace-routing";
import { EncounterTabPage } from "@/features/clinical-opd/pages/OpdEncounterTabPage";

export function DentalEncounterTabPage({ tab }: { tab: DentalEncounterTabId }) {
  return <EncounterTabPage tab={tab} />;
}
