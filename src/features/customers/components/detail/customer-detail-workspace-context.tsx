"use client";

import { createContext, useContext } from "react";

import type { Customer } from "@/features/customers/types/customer.types";
import type { Tag } from "@/features/tags/types/tag.types";

export type CustomerDetailWorkspaceValue = {
  customer: Customer;
  hasMasemPayer: boolean;
  isInsuranceReady: boolean;
  visitsRefreshKey: number;
  billingRefreshKey: number;
  onUpdateClick: () => void;
  onVisitChanged: () => void;
  onOpeningBalanceUpdated: (customer: Customer) => void;
  onBillingUpdated: () => void;
  onTagsUpdated: (tags: Tag[]) => void;
};

const CustomerDetailWorkspaceContext =
  createContext<CustomerDetailWorkspaceValue | null>(null);

export function CustomerDetailWorkspaceProvider({
  value,
  children,
}: {
  value: CustomerDetailWorkspaceValue;
  children: React.ReactNode;
}) {
  return (
    <CustomerDetailWorkspaceContext.Provider value={value}>
      {children}
    </CustomerDetailWorkspaceContext.Provider>
  );
}

export function useCustomerDetailWorkspace() {
  const value = useContext(CustomerDetailWorkspaceContext);
  if (!value) {
    throw new Error(
      "useCustomerDetailWorkspace must be used within CustomerDetailWorkspaceProvider",
    );
  }
  return value;
}
