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
    let active = true;

    void (async () => {
      await initialize();
      if (!active || useSessionStore.getState().status !== "ready") {
        return;
      }

      // Signup stores the account before module groups exist. Reload used to
      // be the first time the shell read them. Refresh once the shell mounts.
      await useSessionStore.getState().refreshUser();
    })();

    return () => {
      active = false;
    };
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
