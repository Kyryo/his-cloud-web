"use client";

import * as React from "react";
import { AppIcon } from "@/components/icons/app-icon";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { getActiveClinics } from "@/features/app-shell/utils/workspace-clinics";
import type { UserClinic } from "@/features/app-shell/utils/workspace-clinics";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useUser } from "@/providers/user-provider";
import { useWorkspaceStore } from "@/state/workspace.store";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const { userData, isLoading } = useUser();
  const activeClinicId = useWorkspaceStore((state) => state.activeClinicId);
  const setActiveClinicId = useWorkspaceStore((state) => state.setActiveClinicId);

  const clinics = getActiveClinics(userData);
  const resolvedClinicId =
    activeClinicId && clinics.some((clinic) => clinic.clinic === activeClinicId)
      ? activeClinicId
      : (clinics.find((clinic) => clinic.is_primary)?.clinic ??
        clinics[0]?.clinic ??
        userData?.primary_clinic?.id ??
        null);

  const tenantName =
    userData?.tenant?.name ??
    userData?.primary_clinic?.tenant_name ??
    "Organization";

  const activeClinic =
    clinics.find((clinic) => clinic.clinic === resolvedClinicId) ??
    clinics.find((clinic) => clinic.is_primary) ??
    clinics[0];

  const activeClinicLabel =
    activeClinic?.clinic_name ?? userData?.primary_clinic?.name ?? "Clinic";

  function handleClinicSelect(clinic: UserClinic) {
    setActiveClinicId(clinic.clinic);
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <AppIcon name="building" size={16} />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-brand-navy">
                  {isLoading ? "Loading..." : tenantName}
                </span>
                <span className="truncate text-xs text-dash-muted">
                  {activeClinicLabel}
                </span>
              </div>
              <AppIcon name="chevronRight" className="ml-auto rotate-90" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={cn(
              "w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg",
              appFont.className,
            )}
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Clinics
            </DropdownMenuLabel>
            {clinics.length > 0 ? (
              clinics.map((clinic) => (
                <DropdownMenuItem
                  key={clinic.id}
                  onClick={() => handleClinicSelect(clinic)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <AppIcon name="building" size={14} />
                  </div>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-sm">{clinic.clinic_name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {clinic.role}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled className="text-muted-foreground">
                No clinics assigned
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
