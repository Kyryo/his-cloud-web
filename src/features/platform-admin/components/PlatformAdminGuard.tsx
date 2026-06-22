"use client";

import { ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@/providers/user-provider";

export function PlatformAdminGuard({ children }: { children: ReactNode }) {
  const { userData, isLoading } = useUser();

  if (isLoading) {
    return null;
  }

  const isPlatformAdmin = Boolean(userData?.is_superuser && userData.tenant === null);
  if (!isPlatformAdmin) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
        <Alert variant="destructive">
          <ShieldAlert className="size-4" />
          <AlertTitle>Platform access required</AlertTitle>
          <AlertDescription>
            Sign in with a root platform administrator account that is not linked
            to a tenant.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return children;
}
