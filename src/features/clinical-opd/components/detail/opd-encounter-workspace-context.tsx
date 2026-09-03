"use client";

import { createContext, useContext } from "react";

import type { OpdQueueEncounter } from "@/features/clinical-opd/types/clinical-opd.types";
import type { OpdEncounterTabId } from "@/features/clinical-opd/utils/opd-encounter-tabs";
import type { Customer } from "@/features/customers/types/customer.types";

type OpdEncounterWorkspaceContextValue = {
  visitUuid: string;
  encounterUuid: string;
  encounter: OpdQueueEncounter | null;
  customer: Customer | null;
  capabilities: string[];
  visibleTabIds: OpdEncounterTabId[];
  userRole: string | null;
};

const OpdEncounterWorkspaceContext =
  createContext<OpdEncounterWorkspaceContextValue | null>(null);

export function OpdEncounterWorkspaceProvider({
  value,
  children,
}: {
  value: OpdEncounterWorkspaceContextValue;
  children: React.ReactNode;
}) {
  return (
    <OpdEncounterWorkspaceContext.Provider value={value}>
      {children}
    </OpdEncounterWorkspaceContext.Provider>
  );
}

export function useOpdEncounterWorkspace() {
  const context = useContext(OpdEncounterWorkspaceContext);
  if (!context) {
    throw new Error(
      "useOpdEncounterWorkspace must be used within OpdEncounterWorkspaceProvider",
    );
  }
  return context;
}
