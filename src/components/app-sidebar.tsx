"use client";

import { memo, useMemo, type ComponentProps } from "react";
import { usePathname } from "next/navigation";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { buildSidebarNavItems } from "@/features/app-shell/utils/build-sidebar-nav";
import { useUser } from "@/providers/user-provider";

const SidebarTeamSwitcher = memo(function SidebarTeamSwitcher() {
  return (
    <SidebarHeader className="pt-3">
      <TeamSwitcher />
    </SidebarHeader>
  );
});

const SidebarAccount = memo(function SidebarAccount() {
  return (
    <SidebarFooter className="p-2">
      <div className="rounded-xl border border-dash-border">
        <NavUser />
      </div>
    </SidebarFooter>
  );
});

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { userData } = useUser();
  const userGroups = useMemo(() => userData?.groups ?? [], [userData?.groups]);
  const isPlatformAdmin = Boolean(userData?.is_superuser && userData.tenant === null);

  const navItems = buildSidebarNavItems(
    userGroups,
    pathname,
    Boolean(userData?.is_admin),
    isPlatformAdmin,
  );

  return (
    <Sidebar collapsible="icon" className="border-r-transparent" {...props}>
      <SidebarTeamSwitcher />
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarAccount />
    </Sidebar>
  );
}
