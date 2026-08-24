"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { buildSidebarNavItems } from "@/features/app-shell/utils/build-sidebar-nav";
import { useUser } from "@/providers/user-provider";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { userData } = useUser();
  const userGroups = useMemo(() => userData?.groups ?? [], [userData?.groups]);

  const navItems = buildSidebarNavItems(
    userGroups,
    pathname,
    Boolean(userData?.is_admin),
    Boolean(userData?.is_superuser && userData.tenant === null),
  );

  return (
    <Sidebar collapsible="icon" className="border-r-transparent" {...props}>
      <SidebarHeader className="px-3 pt-3">
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter className="p-2">
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
