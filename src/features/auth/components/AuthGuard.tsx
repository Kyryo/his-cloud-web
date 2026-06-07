"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { PageLoader } from "@/components/page-loader";
import { ROUTES } from "@/constants/routes";
import { checkSession } from "@/features/auth/services/auth.service";

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      try {
        const session = await checkSession();
        if (session.authenticated) {
          setIsAuthenticated(true);
        } else {
          router.replace(ROUTES.auth);
        }
      } catch {
        router.replace(ROUTES.auth);
      } finally {
        setIsLoading(false);
      }
    }

    void verifyAuth();
  }, [router]);

  if (isLoading) {
    return <PageLoader fullScreen />;
  }

  return isAuthenticated ? <>{children}</> : null;
}
