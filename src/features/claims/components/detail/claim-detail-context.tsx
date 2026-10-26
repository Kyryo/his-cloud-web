"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { ClaimDetail } from "@/features/claims/types/claims.types";

type ClaimDetailContextValue = {
  claimId: string;
  claim: ClaimDetail;
  onClaimUpdated: (claim: ClaimDetail) => void;
  requestSubmit: () => void;
};

const ClaimDetailContext = createContext<ClaimDetailContextValue | null>(null);

export function ClaimDetailProvider({
  value,
  children,
}: {
  value: ClaimDetailContextValue;
  children: ReactNode;
}) {
  return (
    <ClaimDetailContext.Provider value={value}>{children}</ClaimDetailContext.Provider>
  );
}

export function useClaimDetail(): ClaimDetailContextValue {
  const context = useContext(ClaimDetailContext);
  if (!context) {
    throw new Error("useClaimDetail must be used inside the claim detail layout.");
  }
  return context;
}
