"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { bffRequest } from "@/lib/bff-client";
import { resolveWorkspaceAreaHref } from "@/features/overview/utils/overview-quick-links";
import { useUser } from "@/providers/user-provider";

const STORAGE_PREFIX = "sigma.workspace-usage:";

function recordWorkspaceUsage(area: string) {
  return bffRequest("/api/workspace-usage", {
    method: "POST",
    body: { area },
  });
}

export function WorkspaceUsageRecorder() {
  const pathname = usePathname();
  const { userData } = useUser();
  const isPlatformAdmin = Boolean(
    userData?.is_superuser && userData.tenant === null,
  );
  const groupsKey = (userData?.groups ?? []).join("|");
  const modulesKey = (userData?.enabled_modules ?? []).join("|");

  useEffect(() => {
    if (!userData || isPlatformAdmin || !pathname) {
      return;
    }

    const href = resolveWorkspaceAreaHref(
      pathname,
      userData.groups ?? [],
      userData.enabled_modules ?? [],
    );
    if (!href) {
      return;
    }

    const storageKey = `${STORAGE_PREFIX}${href}`;
    try {
      if (sessionStorage.getItem(storageKey)) {
        return;
      }
      sessionStorage.setItem(storageKey, "1");
    } catch {
      return;
    }

    void recordWorkspaceUsage(href).catch(() => {
      try {
        sessionStorage.removeItem(storageKey);
      } catch {
        // Ignore storage failures; the next navigation can try again.
      }
    });
  }, [groupsKey, isPlatformAdmin, modulesKey, pathname, userData]);

  return null;
}
