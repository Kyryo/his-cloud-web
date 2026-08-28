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
import { ROUTES } from "@/constants/routes";
import { buildSidebarNavItems } from "@/features/app-shell/utils/build-sidebar-nav";
import { useInboxUnreadCount } from "@/features/notifications/hooks/use-inbox-unread-count";
import { useUser } from "@/providers/user-provider";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { userData } = useUser();
  const userGroups = useMemo(() => userData?.groups ?? [], [userData?.groups]);
  const isPlatformAdmin = Boolean(userData?.is_superuser && userData.tenant === null);
  const unreadCount = useInboxUnreadCount(!isPlatformAdmin, {
    notifyOnNew: true,
  });

  const navItems = buildSidebarNavItems(
    userGroups,
    pathname,
    Boolean(userData?.is_admin),
    isPlatformAdmin,
  ).map((item) =>
    item.url === ROUTES.notifications
      ? { ...item, showUnreadDot: unreadCount > 0 }
      : item,
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
