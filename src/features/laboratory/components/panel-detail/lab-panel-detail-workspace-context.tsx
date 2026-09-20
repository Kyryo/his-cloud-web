"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { LabPanel } from "@/features/laboratory/types/laboratory-catalog.types";

type LabPanelDetailWorkspaceValue = {
  panel: LabPanel;
  refreshKey: number;
  onPanelUpdated: (panel: LabPanel) => void;
  onRefresh: () => void;
};

const LabPanelDetailWorkspaceContext =
  createContext<LabPanelDetailWorkspaceValue | null>(null);

export function LabPanelDetailWorkspaceProvider({
  value,
  children,
}: {
  value: LabPanelDetailWorkspaceValue;
  children: ReactNode;
}) {
  return (
    <LabPanelDetailWorkspaceContext.Provider value={value}>
      {children}
    </LabPanelDetailWorkspaceContext.Provider>
  );
}

export function useLabPanelDetailWorkspace(): LabPanelDetailWorkspaceValue {
  const value = useContext(LabPanelDetailWorkspaceContext);
  if (!value) {
    throw new Error(
      "useLabPanelDetailWorkspace must be used within LabPanelDetailWorkspaceProvider",
    );
  }
  return value;
}
