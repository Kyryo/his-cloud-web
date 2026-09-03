import type { ReactNode } from "react";

import { OpdEncounterWorkspacePage } from "@/features/clinical-opd/pages/OpdEncounterWorkspacePage";

type OpdEncounterLayoutProps = {
  children: ReactNode;
  params: Promise<{ visitUuid: string; encounterUuid: string }>;
};

export default async function OpdEncounterLayout({
  children,
  params,
}: OpdEncounterLayoutProps) {
  const { visitUuid, encounterUuid } = await params;

  return (
    <OpdEncounterWorkspacePage
      visitUuid={visitUuid}
      encounterUuid={encounterUuid}
    >
      {children}
    </OpdEncounterWorkspacePage>
  );
}
