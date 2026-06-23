"use client";

import { useEffect, useState, type ReactNode } from "react";

import { PageLoader } from "@/components/page-loader";
import { checkSession } from "@/features/auth/services/auth.service";
import { handleSessionExpired } from "@/lib/handle-session-expired";

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      try {
        const session = await checkSession();
        if (session.authenticated) {
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        await handleSessionExpired();
      } catch {
        await handleSessionExpired();
      }
    }

    void verifyAuth();
  }, []);

  if (isLoading) {
    return <PageLoader fullScreen />;
  }

  return isAuthenticated ? <>{children}</> : null;
}
