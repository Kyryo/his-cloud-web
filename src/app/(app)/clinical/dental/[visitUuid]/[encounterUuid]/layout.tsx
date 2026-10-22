import type { ReactNode } from "react";

import { DentalEncounterWorkspacePage } from "@/features/clinical-dental/pages/DentalEncounterWorkspacePage";

type DentalEncounterLayoutProps = {
  children: ReactNode;
  params: Promise<{ visitUuid: string; encounterUuid: string }>;
};

export default async function DentalEncounterLayout({
  children,
  params,
}: DentalEncounterLayoutProps) {
  const { visitUuid, encounterUuid } = await params;

  return (
    <DentalEncounterWorkspacePage visitUuid={visitUuid} encounterUuid={encounterUuid}>
      {children}
    </DentalEncounterWorkspacePage>
  );
}
