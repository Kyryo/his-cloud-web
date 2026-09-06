"use client";

import { useEffect, type ReactNode } from "react";

import { AppInitializationScreen } from "@/features/app-shell/components/AppInitializationScreen";
import { handleSessionExpired } from "@/lib/handle-session-expired";
import { useSessionStore } from "@/state/session.store";

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const status = useSessionStore((state) => state.status);
  const user = useSessionStore((state) => state.user);
  const initialize = useSessionStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (status !== "unauthenticated") {
      return;
    }

    void handleSessionExpired();
  }, [status]);

  if (status === "ready" && user) {
    return children;
  }

  return <AppInitializationScreen />;
}
