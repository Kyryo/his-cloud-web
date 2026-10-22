"use client";

import { createContext, useContext } from "react";

import type {
  OpdChartSummary,
  OpdQueueEncounter,
} from "@/features/clinical-opd/types/clinical-opd.types";
import type { Customer } from "@/features/customers/types/customer.types";

type OpdEncounterWorkspaceContextValue = {
  visitUuid: string;
  encounterUuid: string;
  encounter: OpdQueueEncounter | null;
  customer: Customer | null;
  chartSummary: OpdChartSummary | null;
  capabilities: string[];
  /** Section ids of the current specialty the user may open. */
  visibleTabIds: string[];
  userRole: string | null;
  isChartLocked: boolean;
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
