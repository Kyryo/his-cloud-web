"use client";

import { createContext, useContext } from "react";

import type {
  LabOrder,
  LabSpecimen,
} from "@/features/laboratory/types/laboratory.types";

export type LabOrderDetailWorkspaceValue = {
  order: LabOrder;
  specimens: LabSpecimen[];
  refreshKey: number;
  onOrderUpdated: (order: LabOrder) => void;
  onSpecimensUpdated: (specimens: LabSpecimen[]) => void;
  onRefresh: () => void;
};

const LabOrderDetailWorkspaceContext =
  createContext<LabOrderDetailWorkspaceValue | null>(null);

export function LabOrderDetailWorkspaceProvider({
  value,
  children,
}: {
  value: LabOrderDetailWorkspaceValue;
  children: React.ReactNode;
}) {
  return (
    <LabOrderDetailWorkspaceContext.Provider value={value}>
      {children}
    </LabOrderDetailWorkspaceContext.Provider>
  );
}

export function useLabOrderDetailWorkspace() {
  const value = useContext(LabOrderDetailWorkspaceContext);
  if (!value) {
    throw new Error(
      "useLabOrderDetailWorkspace must be used within LabOrderDetailWorkspaceProvider",
    );
  }
  return value;
}
