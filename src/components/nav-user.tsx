"use client";

import Link from "next/link";

import { AppIcon } from "@/components/icons/app-icon";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ROUTES } from "@/constants/routes";
import { logout } from "@/features/auth/services/auth.service";
import { useInboxUnreadCount } from "@/features/notifications/hooks/use-inbox-unread-count";
import { useUser } from "@/providers/user-provider";

export function NavUser() {
  const { userData } = useUser();
  const isPlatformAdmin = Boolean(userData?.is_superuser && userData.tenant === null);
  const unreadCount = useInboxUnreadCount(!isPlatformAdmin, {
    notifyOnNew: true,
  });

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Account">
          <Link href={ROUTES.settingsAccount}>
            <AppIcon name="user" />
            <span>Account</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Notifications">
          <Link href={ROUTES.notifications}>
            <AppIcon name="notification" />
            <span>Notifications</span>
            {unreadCount > 0 ? (
              <span
                className="ml-auto size-1.5 rounded-full bg-brand-primary"
                data-testid="nav-unread-dot"
                aria-label="Unread notifications"
              />
            ) : null}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton tooltip="Sign out" onClick={() => void logout()}>
          <AppIcon name="logout" />
          <span>Sign out</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
