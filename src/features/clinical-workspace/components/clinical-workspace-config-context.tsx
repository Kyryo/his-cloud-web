"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import type { ClinicalWorkspaceConfig } from "@/features/clinical-workspace/types/clinical-workspace.types";

const ClinicalWorkspaceConfigContext =
  createContext<ClinicalWorkspaceConfig | null>(null);

export function ClinicalWorkspaceConfigProvider({
  config,
  children,
}: {
  config: ClinicalWorkspaceConfig;
  children: ReactNode;
}) {
  return (
    <ClinicalWorkspaceConfigContext.Provider value={config}>
      {children}
    </ClinicalWorkspaceConfigContext.Provider>
  );
}

/** The workspace config of the surrounding specialty, or null outside one. */
export function useOptionalClinicalWorkspaceConfig(): ClinicalWorkspaceConfig | null {
  return useContext(ClinicalWorkspaceConfigContext);
}

export function useClinicalWorkspaceConfig(): ClinicalWorkspaceConfig {
  const config = useOptionalClinicalWorkspaceConfig();
  if (!config) {
    throw new Error(
      "useClinicalWorkspaceConfig must be used within ClinicalWorkspaceConfigProvider",
    );
  }
  return config;
}
