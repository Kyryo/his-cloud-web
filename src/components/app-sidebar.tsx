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

  const navItems = useMemo(
    () =>
      buildSidebarNavItems(
        userGroups,
        pathname,
        Boolean(userData?.is_admin),
      ),
    [pathname, userData?.is_admin, userGroups],
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border bg-sidebar-accent/70 p-2">
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
