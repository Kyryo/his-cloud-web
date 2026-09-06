"use client";

import type { ReactNode } from "react";

import type { User } from "@/features/auth/types/auth.types";
import { useSessionStore } from "@/state/session.store";

type UserContextValue = {
  userData: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
};

type UserProviderProps = {
  children: ReactNode;
  /** Kept for existing call sites. Session state lives in Zustand. */
  initialUser?: User | null;
};

export function UserProvider({ children }: UserProviderProps) {
  return children;
}

export function useUser(): UserContextValue {
  const userData = useSessionStore((state) => state.user);
  const status = useSessionStore((state) => state.status);
  const refreshUser = useSessionStore((state) => state.refreshUser);

  return {
    userData,
    isLoading: status === "idle" || status === "initializing",
    refreshUser,
  };
}
