"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { ModuleEmptyStatePage } from "@/features/app-shell/components/ModuleEmptyState";
import {
  isModuleEnabled,
  portalModuleDisplayName,
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
    const label = portalModuleDisplayName(moduleName);
    return (
      <ModuleEmptyStatePage
        featureName={label}
        pageDescription={`Upgrade your Sigma plan to use ${label} in this workspace.`}
        variant="upgrade"
        data-testid={`module-upgrade-empty-state-${moduleName.toLowerCase()}`}
      />
    );
  }

  return children;
}
