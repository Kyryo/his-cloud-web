"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useState } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ROUTES } from "@/constants/routes";
import { getActiveClinics } from "@/features/app-shell/utils/workspace-clinics";
import type { UserClinic } from "@/features/app-shell/utils/workspace-clinics";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useUser } from "@/providers/user-provider";
import { useWorkspaceStore } from "@/state/workspace.store";

export function TeamSwitcher() {
  const { userData, isLoading } = useUser();
  const [open, setOpen] = useState(false);
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
    setOpen(false);
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip="Switch workspace"
              data-testid="sidebar-team-switcher-trigger"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <AppIcon
                name="building"
                size={16}
                className="shrink-0 text-sidebar-foreground/60"
              />
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-brand-navy">
                  {isLoading ? "Loading..." : activeClinicLabel}
                </span>
                <span className="truncate text-xs text-dash-muted">
                  {tenantName}
                </span>
              </div>
              <AppIcon
                name="chevronRight"
                className="ml-auto shrink-0 text-sidebar-foreground/50"
              />
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent
            data-testid="sidebar-team-switcher-popover"
            side="right"
            align="start"
            sideOffset={8}
            className={cn(appFont.className, "w-56 p-1.5")}
          >
            {clinics.length > 0 ? (
              clinics.map((clinic) => {
                const isActive = clinic.clinic === resolvedClinicId;

                return (
                  <button
                    key={clinic.id}
                    type="button"
                    data-testid={`clinic-option-${clinic.clinic}`}
                    onClick={() => handleClinicSelect(clinic)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground outline-none hover:bg-accent"
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {clinic.clinic_name}
                    </span>
                    {isActive ? (
                      <Check className="size-4 shrink-0 text-brand-primary" aria-hidden />
                    ) : null}
                  </button>
                );
              })
            ) : (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                No clinics assigned
              </p>
            )}
            <Separator className="my-1.5" />
            <Link
              href={ROUTES.settingsOrganization}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground outline-none hover:bg-accent"
            >
              <AppIcon name="settings" size={16} />
              <span>Organization settings</span>
            </Link>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
