"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { ModuleEmptyState } from "@/features/app-shell/components/ModuleEmptyState";
import { ListPageLayout } from "@/features/app-shell/components/page-layout";
import {
  isModuleEnabled,
  resolvePortalModuleForPath,
} from "@/features/app-shell/utils/module-entitlements";
import { useUser } from "@/providers/user-provider";

type ModuleAccessGateProps = {
  children: ReactNode;
};

export function ModuleAccessGate({ children }: ModuleAccessGateProps) {
  const pathname = usePathname();
  const { userData } = useUser();
  const moduleName = resolvePortalModuleForPath(pathname);

  if (moduleName && !isModuleEnabled(userData, moduleName)) {
    return (
      <ListPageLayout>
        <ModuleEmptyState
          featureName={moduleName}
          variant="unavailable"
          data-testid="module-unavailable-empty-state"
        />
      </ListPageLayout>
    );
  }

  return children;
}
