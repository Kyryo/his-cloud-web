"use client";

import { createContext, useContext } from "react";

import type { LabTestDefinition } from "@/features/laboratory/types/laboratory-catalog.types";

type LabTestDetailWorkspaceValue = {
  test: LabTestDefinition;
  refreshKey: number;
  onTestUpdated: (test: LabTestDefinition) => void;
  onRefresh: () => void;
};

const LabTestDetailWorkspaceContext =
  createContext<LabTestDetailWorkspaceValue | null>(null);

export function LabTestDetailWorkspaceProvider({
  value,
  children,
}: {
  value: LabTestDetailWorkspaceValue;
  children: React.ReactNode;
}) {
  return (
    <LabTestDetailWorkspaceContext.Provider value={value}>
      {children}
    </LabTestDetailWorkspaceContext.Provider>
  );
}

export function useLabTestDetailWorkspace(): LabTestDetailWorkspaceValue {
  const value = useContext(LabTestDetailWorkspaceContext);
  if (!value) {
    throw new Error(
      "useLabTestDetailWorkspace must be used within LabTestDetailWorkspaceProvider",
    );
  }
  return value;
}
