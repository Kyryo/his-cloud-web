"use client";

import * as React from "react";
import { Building2, ChevronsUpDown } from "lucide-react";

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
import type { User } from "@/features/auth/types/auth.types";
import {
  readActiveClinicId,
  writeActiveClinicId,
} from "@/features/app-shell/utils/active-clinic";
import { useUser } from "@/providers/user-provider";

type UserClinic = NonNullable<User["clinics"]>[number];

function getActiveClinics(user: User | null): UserClinic[] {
  return (user?.clinics ?? []).filter((clinic) => clinic.is_active);
}

function resolveInitialClinicId(user: User | null): number | null {
  const clinics = getActiveClinics(user);
  if (clinics.length === 0) {
    return user?.primary_clinic?.id ?? null;
  }

  if (typeof window !== "undefined") {
    const storedId = readActiveClinicId();
    if (
      storedId &&
      clinics.some((clinic) => clinic.clinic === storedId)
    ) {
      return storedId;
    }
  }

  const primary = clinics.find((clinic) => clinic.is_primary);
  return primary?.clinic ?? clinics[0]?.clinic ?? user?.primary_clinic?.id ?? null;
}

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const { userData, isLoading } = useUser();
  const [manualClinicId, setManualClinicId] = React.useState<number | null>(
    () => {
      if (typeof window === "undefined") {
        return null;
      }
      return readActiveClinicId();
    },
  );

  const clinics = getActiveClinics(userData);
  const activeClinicId = React.useMemo(() => {
    if (
      manualClinicId &&
      clinics.some((clinic) => clinic.clinic === manualClinicId)
    ) {
      return manualClinicId;
    }

    return resolveInitialClinicId(userData);
  }, [clinics, manualClinicId, userData]);

  const tenantName =
    userData?.tenant?.name ??
    userData?.primary_clinic?.tenant_name ??
    "Organization";

  const activeClinic =
    clinics.find((clinic) => clinic.clinic === activeClinicId) ??
    clinics.find((clinic) => clinic.is_primary) ??
    clinics[0];

  const activeClinicLabel =
    activeClinic?.clinic_name ?? userData?.primary_clinic?.name ?? "Clinic";

  function handleClinicSelect(clinic: UserClinic) {
    setManualClinicId(clinic.clinic);
    writeActiveClinicId(clinic.clinic);
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
                <Building2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {isLoading ? "Loading..." : tenantName}
                </span>
                <span className="truncate text-xs">{activeClinicLabel}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
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
                    <Building2 className="size-3.5 shrink-0" />
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
