"use client";

import { OpdEncounterTabs } from "@/features/clinical-opd/components/detail/OpdEncounterTabs";

export function OpdEncounterWorkspaceChrome() {
  return (
    <div
      className="min-w-0 overflow-y-hidden bg-white"
      data-testid="opd-encounter-workspace-chrome"
    >
      <OpdEncounterTabs borderless />
    </div>
  );
}
